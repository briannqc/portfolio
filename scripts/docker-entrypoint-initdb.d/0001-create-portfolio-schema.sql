CREATE SCHEMA portfolio;

CREATE TABLE portfolio.place_visits
(
    place   varchar(64),
    action  varchar(50),
    address varchar(200),
    at      timestamptz DEFAULT NOW()
);

CREATE INDEX idx_place_action ON portfolio.place_visits (place, action);
