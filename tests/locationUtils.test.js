import test from "node:test";
import assert from "node:assert/strict";
import { isPopulatedPlace, rankCityCandidates } from "../src/services/locationUtils.js";

test("keeps populated-place feature codes", () => {
  assert.equal(isPopulatedPlace({ latitude: 28.5, longitude: 77.3, featureCode: "PPLA" }), true);
  assert.equal(isPopulatedPlace({ latitude: 28.5, longitude: 77.3, featureCode: "PPL" }), true);
});

test("filters country and administrative-area feature codes", () => {
  assert.equal(isPopulatedPlace({ latitude: 20, longitude: 78, featureCode: "PCLI" }), false);
  assert.equal(isPopulatedPlace({ latitude: 28, longitude: 77, featureCode: "ADM1" }), false);
});

test("rejects locations without valid coordinates", () => {
  assert.equal(isPopulatedPlace({ latitude: 120, longitude: 77, featureCode: "PPL" }), false);
  assert.equal(isPopulatedPlace({ latitude: 28, longitude: Number.NaN, featureCode: "PPL" }), false);
});

test("does not accept results without a populated-place classification", () => {
  assert.equal(isPopulatedPlace({ latitude: 20, longitude: 78 }), false);
});

test("ranks an Indian exact-name match first without removing other countries", () => {
  const ranked = rankCityCandidates([
    { id: "one", name: "Noida", countryCode: "US", population: 900000 },
    { id: "two", name: "Noida", countryCode: "IN", population: 100000 },
  ], "Noida", "IN");

  assert.equal(ranked[0].id, "two");
  assert.equal(ranked.length, 2);
});
