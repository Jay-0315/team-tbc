package com.tbc.payments.adapter.in.web;

import com.tbc.payments.adapter.out.persistence.WalletLedgerRepository;
import com.tbc.payments.adapter.out.persistence.WalletRepository;
import com.tbc.payments.domain.wallet.LedgerType;
import com.tbc.payments.domain.wallet.Wallet;
import com.tbc.payments.domain.wallet.WalletLedger;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/dev/wallet")
@RequiredArgsConstructor
public class DevWalletController {

	private final WalletRepository walletRepository;
	private final WalletLedgerRepository ledgerRepository;

	@PostMapping("/credit")
	@Transactional
	public ResponseEntity<Map<String, Object>> credit(@RequestParam Long userId,
	                                                @RequestParam Long amount) {
		if (userId == null || amount == null || amount <= 0) {
			return ResponseEntity.badRequest().body(Map.of(
				"error", "INVALID_PARAMS"
			));
		}

		Wallet wallet = walletRepository.findByUserId(userId)
				.orElseGet(() -> walletRepository.save(Wallet.builder()
						.userId(userId)
						.balance(0L)
						.build()));

		String idemKey = "DEV-CREDIT:" + userId + ":" + UUID.randomUUID();
		WalletLedger ledger = WalletLedger.builder()
				.walletId(wallet.getId())
				.type(LedgerType.CREDIT)
				.amount(amount)
				.reason("DEV_CREDIT")
				.refType("DEV")
				.refId(String.valueOf(userId))
				.idempotencyKey(idemKey)
				.build();
		ledgerRepository.save(ledger);

		wallet.setBalance(wallet.getBalance() + amount);
		walletRepository.save(wallet);

		return ResponseEntity.ok(Map.of(
				"userId", userId,
				"walletId", wallet.getId(),
				"credited", amount,
				"balance", wallet.getBalance()
		));
	}
}


