package com.tbc.point.adapters.out.persistence;

import com.tbc.point.adapters.out.persistence.entity.MeetupEntity;
import com.tbc.point.adapters.out.persistence.jpa.SpringDataMeetupJpaRepository;
import com.tbc.point.domain.model.Meetup;
import com.tbc.point.domain.repository.MeetupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MeetupPersistenceAdapter implements MeetupRepository {

    private final SpringDataMeetupJpaRepository jpa;

    @Override
    public Optional<Meetup> findById(Long meetupId) {
        return jpa.findById(meetupId).map(this::toDomain);
    }

    @Override
    public List<Meetup> findOpenMeetups() {
        return jpa.findByStatusOrderByCreatedAtDesc("OPEN")
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public void incrementJoined(Long meetupId) {
        jpa.incrementJoined(meetupId);
    }

    @Override
    public Long save(Meetup meetup) {
        MeetupEntity entity = toEntity(meetup);
        return jpa.save(entity).getId();
    }

    private Meetup toDomain(MeetupEntity e) {
        return new Meetup(
                e.getId(),
                e.getHostId(),
                e.getTitle(),
                e.getTopic(),
                e.getCategory(),
                e.getFeeAmount(),
                e.getFeeType(),
                e.getCapacity(),
                e.getMaxParticipants(),
                e.getMinParticipants(),
                e.getJoined(),
                e.getStatus(),
                e.getMode(),
                e.getLocation(),
                e.getCoverUrl(),
                e.getDescription(),
                e.getFeeInfo(),
                e.getTagsCsv(),
                e.getContentHtml(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }

    private MeetupEntity toEntity(Meetup m) {
        MeetupEntity e = new MeetupEntity();
        e.setId(m.getId());
        e.setHostId(m.getHostId());
        e.setTitle(m.getTitle());
        e.setTopic(m.getTopic());
        e.setCategory(m.getCategory());
        e.setFeeAmount(m.getFeeAmount());
        e.setFeeType(m.getFeeType());
        e.setCapacity(m.getCapacity());
        e.setMaxParticipants(m.getMaxParticipants());
        e.setMinParticipants(m.getMinParticipants());
        e.setJoined(m.getJoined());
        e.setStatus(m.getStatus());
        e.setMode(m.getMode());
        e.setLocation(m.getLocation());
        e.setCoverUrl(m.getCoverUrl());
        e.setDescription(m.getDescription());
        e.setFeeInfo(m.getFeeInfo());
        e.setTagsCsv(m.getTagsCsv());
        e.setContentHtml(m.getContentHtml());
        e.setCreatedAt(m.getCreatedAt());
        e.setUpdatedAt(m.getUpdatedAt());
        return e;
    }
}
