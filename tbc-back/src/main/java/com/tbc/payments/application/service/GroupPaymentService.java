package com.tbc.payments.application.service;

import com.tbc.group.application.port.out.GroupMemberRepository;
import com.tbc.group.application.port.out.GroupRepository;
import com.tbc.group.domain.event.UserJoinedGroupEvent;
import com.tbc.group.domain.model.Group;
import com.tbc.payments.application.port.out.WalletHoldRepositoryPort;
import com.tbc.payments.application.port.out.WalletRepositoryPort;
import com.tbc.payments.domain.model.WalletHold;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GroupPaymentService {
    private final WalletRepositoryPort walletRepo;
    private final WalletHoldRepositoryPort holdRepo;
    private final GroupRepository groupRepo;
    private final GroupMemberRepository memberRepo;
    private final ApplicationEventPublisher events;

    @Transactional
    public void joinPaidGroup(Long groupId, Long userId) {
        Group group = groupRepo.findById(groupId).orElseThrow(() -> new IllegalArgumentException("GROUP_NOT_FOUND"));
        if (group.feeType() != Group.FeeType.PAID) throw new IllegalStateException("GROUP_NOT_PAID");
        if (memberRepo.isMember(groupId, userId)) return; // idempotent

        long fee = group.feeAmount() == null ? 0 : group.feeAmount();
        long bal = walletRepo.findByUserId(userId).map(w -> w.balance()).orElse(0L);
        if (bal < fee) throw new IllegalStateException("INSUFFICIENT_BALANCE");

        // debit immediately and record hold (escrow)
        walletRepo.updateBalance(userId, -fee);
        holdRepo.save(new com.tbc.payments.domain.model.WalletHold(null, userId, groupId, fee, "HELD", null, null));

        // grant membership (member role)
        memberRepo.addMember(groupId, userId);

        // publish chat membership event
        events.publishEvent(new UserJoinedGroupEvent(groupId, userId));
    }

    @Transactional
    public void settleGroup(Long groupId) {
        Group group = groupRepo.findById(groupId).orElseThrow(() -> new IllegalArgumentException("GROUP_NOT_FOUND"));
        int active = memberRepo.countActiveMembers(groupId);
        var held = holdRepo.findActiveByGroupId(groupId);
        if (active >= group.minParticipants()) {
            // capture: funds to host
            long total = held.stream().mapToLong(WalletHold::amount).sum();
            Long hostId = group.hostId();
            if (total > 0 && hostId != null) {
                walletRepo.updateBalance(hostId, total);
            }
            holdRepo.captureByGroupId(groupId);
        } else {
            // release back to participants
            for (WalletHold h : held) {
                walletRepo.updateBalance(h.userId(), h.amount());
            }
            holdRepo.releaseByGroupId(groupId);
        }
    }
}


