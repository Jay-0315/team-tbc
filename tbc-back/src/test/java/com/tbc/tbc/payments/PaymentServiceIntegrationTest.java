package com.tbc.tbc.payments;

import com.tbc.tbc.payments.adapter.in.web.dto.ConfirmRequest;
import com.tbc.tbc.payments.adapter.in.web.dto.ConfirmResponse;
import com.tbc.tbc.payments.adapter.in.web.dto.CreatePaymentRequest;
import com.tbc.tbc.payments.adapter.out.client.dto.TossConfirmReq;
import com.tbc.tbc.payments.adapter.out.client.dto.TossPaymentRes;
import com.tbc.tbc.payments.adapter.out.persistence.PaymentRepository;
import com.tbc.tbc.payments.adapter.out.persistence.WalletLedgerRepository;
import com.tbc.tbc.payments.adapter.out.persistence.WalletRepository;
import com.tbc.tbc.payments.application.port.out.TossClientPort;
import com.tbc.tbc.payments.application.service.PaymentService;
import com.tbc.tbc.payments.domain.wallet.Wallet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
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

    @MockBean
    private TossClientPort tossClientPort;

    @BeforeEach
    void cleanUp() {
        walletLedgerRepository.deleteAll();
        paymentRepository.deleteAll();
        walletRepository.deleteAll();
    }

    // 동일 orderId 결제 시 기존 엔티티 재사용 멱등 처리 및 지갑 테스트
    @Test
    void createInitSameOrderIdReturnsExistingPayment() {
        String orderId = "ORDER-" + UUID.randomUUID();
        CreatePaymentRequest request = new CreatePaymentRequest(1L, orderId, 1_000L, "Topup");

        var first = paymentService.createInit(request);
        var second = paymentService.createInit(request);

        assertThat(first.orderId()).isEqualTo(orderId);
        assertThat(second.orderId()).isEqualTo(orderId);
        assertThat(paymentRepository.count()).isEqualTo(1);
        assertThat(walletRepository.findByUserId(1L)).isPresent();
    }


    // 결제
    @Test
    void confirmTwiceCreditsWalletOnlyOnce() {
        Long userId = 2L;
        Long amount = 2_500L;
        String orderId = "ORDER-" + UUID.randomUUID();
        String paymentKey = "pay_" + UUID.randomUUID();

        paymentService.createInit(new CreatePaymentRequest(userId, orderId, amount, "Topup"));

        when(tossClientPort.confirm(any(TossConfirmReq.class)))
                .thenReturn(new TossPaymentRes(paymentKey, orderId, "DONE", amount));

        ConfirmRequest confirmRequest = new ConfirmRequest(paymentKey, orderId, amount);

        ConfirmResponse first = paymentService.confirmAndCredit(confirmRequest);
        assertThat(first.state()).isEqualTo("PAID");
        assertThat(first.creditedAmount()).isEqualTo(amount);
        assertThat(first.balanceAfter()).isEqualTo(amount);

        ConfirmResponse second = paymentService.confirmAndCredit(confirmRequest);
        assertThat(second.state()).isEqualTo("PAID");
        assertThat(second.creditedAmount()).isEqualTo(amount);
        assertThat(second.balanceAfter()).isEqualTo(amount);

        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();
        assertThat(wallet.getBalance()).isEqualTo(amount);
        assertThat(walletLedgerRepository.count()).isEqualTo(1);

        verify(tossClientPort, times(1)).confirm(any(TossConfirmReq.class));
    }
}
