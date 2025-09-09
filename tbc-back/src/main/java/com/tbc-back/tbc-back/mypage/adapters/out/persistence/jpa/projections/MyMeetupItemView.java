package com.tbc_back.tbc_back.mypage.adapters.out.persistence.jpa.projections;

import java.time.Instant;

public interface MyMeetupItemView {
    String getRole();
    String getStatus();
    Instant getJoinedAt();

    MeetupView getMeetup();

    interface MeetupView {
        String getId();
        String getTitle();
        Instant getStartAt();
    }
}
