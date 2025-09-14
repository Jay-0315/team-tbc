package com.tbc_back.tbc_back.domain.model;

public class Meetup {
    private final Long id;          // BIGINT
    private final int pricePoints;  // 참여비

    public Meetup(Long id, int pricePoints) {
        this.id = id;
        this.pricePoints = pricePoints;
    }

    public Long getId() { return id; }
    public int getPricePoints() { return pricePoints; }
}
