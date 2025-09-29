package com.tbc.payments.application.service;

import com.tbc.payments.adapter.in.web.dto.ConfirmRequest;
import com.tbc.payments.adapter.in.web.dto.ConfirmResponse;
import com.tbc.payments.adapter.in.web.dto.CreatePaymentRequest;
import com.tbc.payments.adapter.in.web.dto.CreatePaymentResponse;
import com.tbc.payments.adapter.out.client.dto.TossConfirmReq;
import com.tbc.payments.adapter.out.client.dto.TossPaymentRes;
import com.tbc.payments.application.port.in.PaymentUseCase;
import com.tbc.payments.application.port.in.WalletUseCase;
import com.tbc.payments.application.port.out.*;
import com.tbc.payments.domain.payment.*;
import com.tbc.payments.domain.wallet.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService implements PaymentUseCase {

    private final TossClientPort tossClientPort;
    private final PaymentPersistencePort paymentRepository;
    private final WalletPersistencePort walletRepository;
    private final WalletLedgerPersistencePort ledgerRepository;
    private final WalletUseCase walletUseCase;
    private final MeetupPointPort meetupPointPort;

    /**
     * 결제 INIT: orderId 예약 + 사용자의 지갑 보장(없으면 생성) + 이미 존재하는 orderId면 그대로 리턴 (멱등 처리)
     */
    @Transactional
    public CreatePaymentResponse createInit(CreatePaymentRequest req) {
        // 기존: 중복 orderId가 있으면 예외 던짐
        // paymentRepository.findByOrderId(req.orderId()).ifPresent(p -> {
        //     throw new IllegalStateException("DUPLICATE_ORDER_ID");
        // });

        // 수정: 이미 존재하는 orderId면 그대로 리턴 (멱등 처리)
        return paymentRepository.findByOrderId(req.orderId())
                .map(p -> {
                    log.debug("INIT already exists orderId={}, userId={}, amount={}",
                            p.getOrderId(), p.getUserId(), p.getAmount());
                    return new CreatePaymentResponse(p.getOrderId());
                })
                .orElseGet(() -> {
                    // 지갑 보장 (없으면 balance=0으로 생성)
                    walletUseCase.getOrCreate(req.userId());

                    Payment p = Payment.builder()
                            .orderId(req.orderId())
                            .userId(req.userId())
                            .amount(req.amount())
                            .state(PaymentState.INIT)
                            .build();

                    paymentRepository.savePayment(p);
                    log.debug("INIT saved orderId={}, userId={}, amount={}",
                            p.getOrderId(), p.getUserId(), p.getAmount());
                    return new CreatePaymentResponse(p.getOrderId());
                });
    }

    // INIT 상태 결제 취소
    @Transactional
    @Override
    public Payment cancelInit(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalStateException("ORDER_NOT_FOUND"));

        if (payment.getState() != PaymentState.INIT) {
            throw new IllegalStateException("ONLY_INIT_CAN_BE_CANCELLED");
        }

        payment.setState(PaymentState.CANCELED);
        return paymentRepository.savePayment(payment);
    }

    /**
     * Toss Confirm + 잔액 CREDIT + 원장 기록 (멱등)
     */
    @Transactional
    public ConfirmResponse confirmAndCredit(ConfirmRequest req) {
        // 1) 서버 원주문 확인 & 금액 대조
        Payment payment = paymentRepository.findByOrderId(req.orderId())
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));

        if (!payment.getAmount().equals(req.amount())) {
            throw new IllegalStateException("AMOUNT_MISMATCH");
        }

        // 멱등: 이미 PAID면 현재 잔액 리턴
        if (payment.getState() == PaymentState.PAID) {
            Wallet w = walletRepository.findByUserId(payment.getUserId())
                    .orElseThrow(() -> new IllegalStateException("WALLET_NOT_FOUND"));
            return new ConfirmResponse(payment.getOrderId(), payment.getState().name(),
                    payment.getAmount(), w.getBalance());
        }

        // 2) Toss Confirm 호출
        TossPaymentRes res = tossClientPort.confirm(new TossConfirmReq(req.paymentKey(), req.orderId(), req.amount()));

        if (res == null || res.status() == null) {
            throw new IllegalStateException("INVALID_TOSS_RESPONSE");
        }
        String st = res.status().toUpperCase();
        if (!(st.equals("DONE") || st.equals("SUCCESS"))) {
            throw new IllegalStateException("PAYMENT_NOT_PAID_STATUS=" + res.status());
        }

        // 3) 상태 전이: INIT -> PAID
        if (!payment.getState().canTransitTo(PaymentState.PAID)) {
            throw new IllegalStateException("INVALID_STATE_TRANSITION");
        }
        payment.setPaymentKey(res.paymentKey());
        payment.setState(PaymentState.PAID);
        paymentRepository.savePayment(payment);
        log.debug("PAYMENT PAID orderId={}, paymentKey={}", payment.getOrderId(), payment.getPaymentKey());

        // 4) 지갑 잠금 후 CREDIT + 원장 기록 (멱등)
        Wallet wallet = walletRepository.findByUserIdForUpdate(payment.getUserId())
                .orElseThrow(() -> new IllegalStateException("WALLET_NOT_FOUND"));

        String idemKey = "TOPUP:" + payment.getOrderId();

        try {
            WalletLedger ledger = WalletLedger.builder()
                    .walletId(wallet.getId())
                    .type(LedgerType.CREDIT)
                    .amount(payment.getAmount())
                    .reason("TOPUP")
                    .refType("PAYMENT")
                    .refId(payment.getOrderId())
                    .idempotencyKey(idemKey)
                    .build(); // created_at/updated_at은 Auditing이 자동 세팅

            ledgerRepository.saveLedger(ledger);

            wallet.setBalance(wallet.getBalance() + payment.getAmount());
            // updated_at도 Auditing이 자동 갱신됨 (수동 set 필요X)

        } catch (DataIntegrityViolationException dup) {
            // 멱등키 UNIQUE 충돌 → 이미 크레딧된 상태로 간주하고 현재 잔액만 반환
            log.warn("Idempotent ledger hit for orderId={}, key={}", payment.getOrderId(), idemKey);
        }

        // confirm 직후 참가비 DEBIT
        if (Boolean.TRUE.equals(req.autoDeduct()) && req.meetupId() != null) {
            String externalRef = "PAYMENT_CONFIRM_JOIN:" + payment.getOrderId();
            meetupPointPort.deductForMeetup(
                    payment.getUserId(),
                    req.meetupId(),
                    payment.getAmount(),
                    externalRef,
                    "MEETUP_JOIN_AFTER_PAYMENT" // 사유
            );
        }

        walletRepository.saveWallet(wallet);
        return new ConfirmResponse(payment.getOrderId(), payment.getState().name(),
                payment.getAmount(), wallet.getBalance());
    }
}