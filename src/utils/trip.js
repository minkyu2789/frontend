function normalizeDate(dateText) {
  if (!dateText) {
    return null;
  }

  const normalized = String(dateText).replace(/\./g, "-");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function pickCurrentTrip(trips) {
  if (!Array.isArray(trips) || trips.length === 0) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeTrip = trips.find((trip) => {
    const start = normalizeDate(trip?.startDate);
    const end = normalizeDate(trip?.endDate);
    if (!start || !end) {
      return false;
    }

    return start <= today && end >= today;
  });

  if (activeTrip) {
    return activeTrip;
  }

  return [...trips].sort((a, b) => {
    const aStart = normalizeDate(a?.startDate);
    const bStart = normalizeDate(b?.startDate);
    return (bStart?.getTime() || 0) - (aStart?.getTime() || 0);
  })[0] || null;
}
