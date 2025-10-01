package com.tbc.point.domain.repository;

import com.tbc.point.domain.model.Meetup;

import java.util.List;
import java.util.Optional;

public interface MeetupRepository {
    Optional<Meetup> findById(Long meetupId);

    List<Meetup> findOpenMeetups();

    void incrementJoined(Long meetupId);

    Long save(Meetup meetup);
}
