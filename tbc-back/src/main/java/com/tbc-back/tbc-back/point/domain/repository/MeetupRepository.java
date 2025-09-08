package com.tbc_back.tbc_back.domain.repository;

import com.tbc_back.tbc_back.domain.model.Meetup;

import java.util.Optional;

public interface MeetupRepository {
    Optional<Meetup> findById(String meetupId);
}
