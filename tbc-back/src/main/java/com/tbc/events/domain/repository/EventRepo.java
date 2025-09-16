package com.tbc.events.domain.repository;

import com.tbc.events.domain.model.Event;
import com.tbc.events.domain.model.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepo extends JpaRepository<Event, Long> {

    @Query("select e from Event e " +
            "where (:q is null or (lower(e.title) like concat('% ', lower(:q), ' %') or lower(e.title) like concat(lower(:q), ' %') or lower(e.title) like concat('% ', lower(:q)) or lower(e.title) = lower(:q))) " +
            "and (:category is null or e.category = :category) " +
            "and (:status is null or e.status = :status)")
    Page<Event> findList(@Param("q") String q,
                         @Param("category") String category,
                         @Param("status") EventStatus status,
                         Pageable pageable);
  
    @Query("select e from Event e " +
            "where (:q is null or (lower(e.title) like concat('% ', lower(:q), ' %') or lower(e.title) like concat(lower(:q), ' %') or lower(e.title) like concat('% ', lower(:q)) or lower(e.title) = lower(:q))) " +
            "and (:category is null or e.category = :category) " +
            "and (:status is null or e.status = :status) " +
            "order by (select count(r) from EventReview r where r.event.id = e.id) desc, e.createdAt desc")
    Page<Event> findListOrderByReviewCountDesc(@Param("q") String q,
                                               @Param("category") String category,
                                               @Param("status") EventStatus status,
                                               Pageable pageable);
}



