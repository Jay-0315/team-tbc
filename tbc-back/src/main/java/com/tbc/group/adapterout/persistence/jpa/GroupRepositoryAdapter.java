package com.tbc.group.adapterout.persistence.jpa;

import com.tbc.group.adapterout.persistence.jpa.entity.GroupEntity;
import com.tbc.group.adapterout.persistence.jpa.repository.GroupJpaRepository;
import com.tbc.group.application.port.out.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class GroupRepositoryAdapter implements GroupRepository {

    private final GroupJpaRepository repo;

    @Override
    public Long save(com.tbc.group.domain.model.Group g) {
        var e = GroupEntity.builder()
                .title(g.title())
                .category(g.category())
                .topic(g.topic())
                .minParticipants(g.minParticipants())
                .maxParticipants(g.maxParticipants())
                .mode(g.mode().name())
                .feeType(g.feeType().name())
                .feeAmount(g.feeAmount())
                .feeInfo(g.feeInfo())
                .tagsCsv(String.join(",", g.tags()))
                .contentHtml(g.contentHtml())
                .hostId(g.hostId())
                .build();
        return repo.save(e).getId();
    }

    @Override
    public Optional<com.tbc.group.domain.model.Group> findById(Long id) {
        return repo.findById(id).map(e -> new com.tbc.group.domain.model.Group(
                e.getId(), e.getTitle(), e.getCategory(), e.getTopic(),
                e.getMinParticipants(), e.getMaxParticipants(),
                com.tbc.group.domain.model.Group.Mode.valueOf(e.getMode()),
                com.tbc.group.domain.model.Group.FeeType.valueOf(e.getFeeType()),
                e.getFeeAmount(), e.getFeeInfo(),
                e.getTagsCsv() == null ? List.of() : Arrays.asList(e.getTagsCsv().split(",")),
                e.getContentHtml(), e.getHostId()
        ));
    }

    @Override
    public Page<com.tbc.group.domain.model.Group> findAll(Pageable pageable) {
        return repo.findAll(pageable).map(e -> new com.tbc.group.domain.model.Group(
                e.getId(), e.getTitle(), e.getCategory(), e.getTopic(),
                e.getMinParticipants(), e.getMaxParticipants(),
                com.tbc.group.domain.model.Group.Mode.valueOf(e.getMode()),
                com.tbc.group.domain.model.Group.FeeType.valueOf(e.getFeeType()),
                e.getFeeAmount(), e.getFeeInfo(),
                e.getTagsCsv() == null ? List.of() : Arrays.asList(e.getTagsCsv().split(",")),
                e.getContentHtml(), e.getHostId()
        ));
    }

    @Override
    public Page<com.tbc.group.domain.model.Group> findAll(Pageable pageable, String searchQuery, String category) {
        return repo.findAll(pageable, searchQuery, category).map(e -> new com.tbc.group.domain.model.Group(
                e.getId(), e.getTitle(), e.getCategory(), e.getTopic(),
                e.getMinParticipants(), e.getMaxParticipants(),
                com.tbc.group.domain.model.Group.Mode.valueOf(e.getMode()),
                com.tbc.group.domain.model.Group.FeeType.valueOf(e.getFeeType()),
                e.getFeeAmount(), e.getFeeInfo(),
                e.getTagsCsv() == null ? List.of() : Arrays.asList(e.getTagsCsv().split(",")),
                e.getContentHtml(), e.getHostId()
        ));
    }
}
