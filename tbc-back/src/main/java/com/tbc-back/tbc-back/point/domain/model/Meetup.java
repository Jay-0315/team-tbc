package com.tbc_back.tbc_back.domain.model;

public class Meetup {
    private final String id;         // CHAR(36)
    private final int pricePoints;   // INT - 참여비

    public Meetup(String id, int pricePoints) {
        this.id = id;
        this.pricePoints = pricePoints;
    }

    public String getId() { return id; }
    public int getPricePoints() { return pricePoints; }
}
