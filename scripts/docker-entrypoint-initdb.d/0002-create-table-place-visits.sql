CREATE TABLE portfolio.place_visits
(
    location  varchar(64),
    action    varchar(50),
    address   varchar(200),
    timestamp timestamptz DEFAULT NOW()
);

CREATE INDEX idx_place_action ON portfolio.place_visits (place, action);
