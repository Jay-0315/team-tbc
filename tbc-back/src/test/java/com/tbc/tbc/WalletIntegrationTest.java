package com.tbc.tbc;

import com.tbc.tbc.payments.adapter.in.web.dto.ConfirmRequest;
import com.tbc.tbc.payments.adapter.in.web.dto.ConfirmResponse;
import com.tbc.tbc.payments.adapter.in.web.dto.CreatePaymentRequest;
import com.tbc.tbc.payments.adapter.out.client.dto.TossConfirmReq;
import com.tbc.tbc.payments.adapter.out.client.dto.TossPaymentRes;
import com.tbc.tbc.payments.adapter.out.persistence.PaymentRepository;
import com.tbc.tbc.payments.adapter.out.persistence.WalletLedgerRepository;
import com.tbc.tbc.payments.adapter.out.persistence.WalletRepository;
import com.tbc.tbc.payments.application.port.in.PaymentUseCase;
import com.tbc.tbc.payments.application.port.out.TossClientPort;
import com.tbc.tbc.payments.application.service.PaymentService;
import com.tbc.tbc.payments.domain.payment.Payment;
import com.tbc.tbc.payments.domain.payment.PaymentState;
import com.tbc.tbc.payments.domain.wallet.LedgerType;
import com.tbc.tbc.payments.domain.wallet.Wallet;
import com.tbc.tbc.payments.domain.wallet.WalletLedger;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.junit.jupiter.api.BeforeEach;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test") // src/test/resources/application-test.yml 사용
@Transactional
class PaymentServiceIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletLedgerRepository walletLedgerRepository;

    @MockBean(name = "tossClientAdapter")
    private TossClientPort tossClientPort;

    @BeforeEach
    void setup() {
        walletLedgerRepository.deleteAll();
        paymentRepository.deleteAll();
        walletRepository.deleteAll();
    }

    @Test
    void confirmAndCredit_marksPaymentPaidAndCreditsWallet() {
        // given
        Long userId = 42L;
        String orderId = "ORDER-" + UUID.randomUUID();
        Long amount = 12_345L;

        paymentService.createInit(new CreatePaymentRequest(userId, orderId, amount, "테스트 주문"));

        TossPaymentRes tossResponse = new TossPaymentRes("pay-key-123", orderId, "DONE", amount);
        when(tossClientPort.confirm(any(TossConfirmReq.class))).thenReturn(tossResponse);

        // when
        ConfirmResponse response = paymentService.confirmAndCredit(
                new ConfirmRequest(tossResponse.paymentKey(), orderId, amount)
        );

        // then
        ArgumentCaptor<TossConfirmReq> confirmCaptor = ArgumentCaptor.forClass(TossConfirmReq.class);
        verify(tossClientPort).confirm(confirmCaptor.capture());
        verifyNoMoreInteractions(tossClientPort);

        TossConfirmReq sentRequest = confirmCaptor.getValue();
        assertThat(sentRequest.paymentKey()).isEqualTo(tossResponse.paymentKey());
        assertThat(sentRequest.orderId()).isEqualTo(orderId);
        assertThat(sentRequest.amount()).isEqualTo(amount);

        assertThat(response.orderId()).isEqualTo(orderId);
        assertThat(response.state()).isEqualTo(PaymentState.PAID.name());
        assertThat(response.creditedAmount()).isEqualTo(amount);
        assertThat(response.balanceAfter()).isEqualTo(amount);

        Payment payment = paymentRepository.findByOrderId(orderId).orElseThrow();
        assertThat(payment.getState()).isEqualTo(PaymentState.PAID);
        assertThat(payment.getPaymentKey()).isEqualTo(tossResponse.paymentKey());

        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();
        assertThat(wallet.getBalance()).isEqualTo(amount);

        List<WalletLedger> ledgers = walletLedgerRepository.findAll();
        assertThat(ledgers).hasSize(1);
        WalletLedger ledger = ledgers.getFirst();
        assertThat(ledger.getWalletId()).isEqualTo(wallet.getId());
        assertThat(ledger.getType()).isEqualTo(LedgerType.CREDIT);
        assertThat(ledger.getAmount()).isEqualTo(amount);
        assertThat(ledger.getIdempotencyKey()).isEqualTo("TOPUP:" + orderId);
    }
}