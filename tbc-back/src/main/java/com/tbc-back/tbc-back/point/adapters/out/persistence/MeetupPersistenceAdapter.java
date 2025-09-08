package com.tbc_back.tbc_back.adapters.out.persistence;

import com.tbc_back.tbc_back.adapters.out.persistence.entity.MeetupEntity;
import com.tbc_back.tbc_back.adapters.out.persistence.jpa.SpringDataMeetupJpaRepository;
import com.tbc_back.tbc_back.domain.model.Meetup;
import com.tbc_back.tbc_back.domain.repository.MeetupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MeetupPersistenceAdapter implements MeetupRepository {

    private final SpringDataMeetupJpaRepository jpa;

    @Override
    public Optional<Meetup> findById(String meetupId) {
        return jpa.findById(meetupId).map(e -> new Meetup(e.getId(), e.getPricePoints()));
    }
}
