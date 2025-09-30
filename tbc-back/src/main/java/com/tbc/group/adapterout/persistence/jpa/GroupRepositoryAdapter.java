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
                .capacity(g.maxParticipants())  // capacity는 maxParticipants와 동일
                .joined(0)  // 기본값으로 0 설정
                .coverUrl("")  // 기본값으로 빈 문자열 설정
                .mode(g.mode().name())
                .feeType(g.feeType().name())
                .feeAmount(g.feeAmount())
                .feeInfo(g.feeInfo())
                .tagsCsv(g.tags() == null ? "" : String.join(",", g.tags()))
                .contentHtml(g.contentHtml())
                .hostId(g.hostId())
                .location(g.location())
                .latitude(g.latitude())
                .longitude(g.longitude())
                .imagePath(g.imagePath())
                .eventDate(g.eventDate())
                .eventTime(g.eventTime())
                .startAt(g.eventDate() != null && g.eventTime() != null ? 
                    g.eventDate().atTime(g.eventTime()) : null)
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
                e.getContentHtml(), e.getHostId(),
                e.getLocation(), e.getLatitude(), e.getLongitude(), e.getImagePath(),
                e.getEventDate(), e.getEventTime(),
                e.getCapacity(), e.getJoined(), e.getCoverUrl(), e.getStartAt() // Added these fields
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
                e.getContentHtml(), e.getHostId(),
                e.getLocation(), e.getLatitude(), e.getLongitude(), e.getImagePath(),
                e.getEventDate(), e.getEventTime(),
                e.getCapacity(), e.getJoined(), e.getCoverUrl(), e.getStartAt() // Added these fields
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
                e.getContentHtml(), e.getHostId(),
                e.getLocation(), e.getLatitude(), e.getLongitude(), e.getImagePath(),
                e.getEventDate(), e.getEventTime(),
                e.getCapacity(), e.getJoined(), e.getCoverUrl(), e.getStartAt() // Added these fields
        ));
    }

    @Override
    public Page<com.tbc.group.domain.model.Group> findByUserId(Long userId, Pageable pageable) {
        return repo.findByUserId(userId, pageable).map(e -> new com.tbc.group.domain.model.Group(
                e.getId(), e.getTitle(), e.getCategory(), e.getTopic(),
                e.getMinParticipants(), e.getMaxParticipants(),
                com.tbc.group.domain.model.Group.Mode.valueOf(e.getMode()),
                com.tbc.group.domain.model.Group.FeeType.valueOf(e.getFeeType()),
                e.getFeeAmount(), e.getFeeInfo(),
                e.getTagsCsv() == null ? List.of() : Arrays.asList(e.getTagsCsv().split(",")),
                e.getContentHtml(), e.getHostId(),
                e.getLocation(), e.getLatitude(), e.getLongitude(), e.getImagePath(),
                e.getEventDate(), e.getEventTime(),
                e.getCapacity(), e.getJoined(), e.getCoverUrl(), e.getStartAt() // Added these fields
        ));
    }
}
