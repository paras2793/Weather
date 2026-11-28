export function isPopulatedPlace(place) {
  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);
  const hasCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;

  if (!hasCoordinates) return false;

  const featureCode = String(place.featureCode ?? "").toUpperCase();

  return featureCode.startsWith("PPL");
}

export function rankCityCandidates(cities, query, preferredCountryCode = "IN") {
  const exactQuery = query.split(",")[0].trim().toLocaleLowerCase();
  const preferred = preferredCountryCode.trim().toUpperCase();

  return [...cities].sort((first, second) => {
    const firstExact = first.name.toLocaleLowerCase() === exactQuery ? 1 : 0;
    const secondExact = second.name.toLocaleLowerCase() === exactQuery ? 1 : 0;
    if (firstExact !== secondExact) return secondExact - firstExact;

    const firstPreferred = first.countryCode === preferred ? 1 : 0;
    const secondPreferred = second.countryCode === preferred ? 1 : 0;
    if (firstPreferred !== secondPreferred) return secondPreferred - firstPreferred;

    return second.population - first.population;
  });
}