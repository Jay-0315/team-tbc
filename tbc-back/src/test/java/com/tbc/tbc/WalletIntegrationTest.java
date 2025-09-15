package com.tbc.tbc;

import com.tbc.tbc.payments.domain.wallet.LedgerType;
import com.tbc.tbc.payments.domain.wallet.Wallet;
import com.tbc.tbc.payments.domain.wallet.WalletLedger;
import com.tbc.tbc.payments.repository.WalletLedgerRepository;
import com.tbc.tbc.payments.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.junit.jupiter.api.BeforeEach;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test") // src/test/resources/application-test.yml 사용
@Transactional
public class WalletIntegrationTest {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletLedgerRepository ledgerRepository;

    private Wallet wallet;

    @BeforeEach
    void setup() {
        ledgerRepository.deleteAll();
        walletRepository.deleteAll();

        // 1) 사용자 지갑 생성 (flush로 DB에 즉시 반영)
        wallet = Wallet.builder()
                .userId(1L)
                .balance(0L)
                .build();
        wallet = walletRepository.saveAndFlush(wallet); // ✅ flush 추가
    }

    @Test
    void 결제충전_차감_잔액검증() {
        // 1) 사용자 지갑 생성 (즉시 DB 반영)
        wallet = walletRepository.saveAndFlush(wallet);

        // 2) 충전 (1000포인트)
        WalletLedger charge = WalletLedger.builder()
                .walletId(wallet.getId())   // FK = wallets.id
                .type(LedgerType.CREDIT)
                .amount(1000L)
                .reason("TOPUP")
                .refType("PAYMENT")
                .refId(UUID.randomUUID().toString())
                .idempotencyKey("TEST-CHARGE-" + UUID.randomUUID().toString())
                .build();

        ledgerRepository.saveAndFlush(charge); // 🔥 ledger 즉시 flush
        wallet.setBalance(wallet.getBalance() + 1000L);
        wallet = walletRepository.saveAndFlush(wallet); // 🔥 balance 반영도 즉시 flush

        // 3) 차감 (500포인트)
        WalletLedger debit = WalletLedger.builder()
                .walletId(wallet.getId())
                .type(LedgerType.DEBIT)
                .amount(500L)
                .reason("MEETUP_JOIN")
                .refType("PAYMENT")
                .refId(UUID.randomUUID().toString())
                .idempotencyKey("TEST-DEBIT-" + UUID.randomUUID().toString())
                .build();

        ledgerRepository.saveAndFlush(debit); // 🔥 ledger 즉시 flush
        wallet.setBalance(wallet.getBalance() - 500L);
        wallet = walletRepository.saveAndFlush(wallet);

        // 4) 검증
        Wallet found = walletRepository.findById(wallet.getId()).orElseThrow();
        assertThat(found.getBalance()).isEqualTo(500L);
    }

}