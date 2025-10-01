package com.tbc.events.domain.repository;

import com.tbc.events.domain.model.EventReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventReviewRepo extends JpaRepository<EventReview, Long> {
    Page<EventReview> findByEvent_Id(Long eventId, Pageable pageable);

    long countByEvent_Id(Long eventId);

    @Query("select avg(r.rating) from EventReview r where r.event.id = :eventId")
    Double avgRatingByEventId(@Param("eventId") Long eventId);
}


