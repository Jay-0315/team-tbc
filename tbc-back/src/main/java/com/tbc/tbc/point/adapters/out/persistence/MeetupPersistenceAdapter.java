package com.tbc.tbc.point.adapters.out.persistence;

import com.tbc.tbc.point.adapters.out.persistence.entity.MeetupEntity;
import com.tbc.tbc.point.adapters.out.persistence.jpa.SpringDataMeetupJpaRepository;
import com.tbc.tbc.point.domain.model.Meetup;
import com.tbc.tbc.point.domain.repository.MeetupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MeetupPersistenceAdapter implements MeetupRepository {

    private final SpringDataMeetupJpaRepository jpa;

    @Override
    public Optional<Meetup> findById(Long meetupId) {
        return jpa.findById(meetupId)
                .map(e -> new Meetup(
                        e.getId(),           // Long
                        e.getPricePoints()   // int
                ));
    }
}
