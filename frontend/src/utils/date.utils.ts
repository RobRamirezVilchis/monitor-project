
export function normalizeDateRange(range: [Date, Date]): [Date, Date] {
  const [start, end] = range;
  if (start.getTime() > end.getTime()) {
    return [end, start];
  }
  return [start, end];
}

export function normalizeTimeRange(range: [Date, Date]): [Date, Date] {
  const [start, end] = range;
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return [start, end];
}

export function getTodayDatesRange(): [Date, Date] {
  const start = new Date();
  const end = new Date(start);
  return normalizeTimeRange([start, end]);
}

export function getYesterdayDatesRange(): [Date, Date] {
  const start = new Date();
  start.setDate(start.getDate() - 1);
  const end = new Date(start);
  return normalizeTimeRange([start, end]);
}

export function getLast7DaysDatesRange(): [Date, Date] {
  const start = new Date();
  const end = new Date(start);
  start.setDate(end.getDate() - 6);
  return normalizeTimeRange([start, end]);
}

export function getThisWeekDatesRange(): [Date, Date] {
  const start = new Date();
  const end = new Date(start);
  start.setDate(start.getDate() - start.getDay());
  end.setDate(start.getDate() + 6);
  return normalizeTimeRange([start, end]);
}

export function getLastWeekDatesRange(): [Date, Date] {
  const start = new Date();
  const end = new Date(start);
  start.setDate(start.getDate() - start.getDay() - 7);
  end.setDate(start.getDate() + 6);
  return normalizeTimeRange([start, end]);
}

export function getLast30DaysDatesRange(): [Date, Date] {
  const start = new Date();
  const end = new Date(start);
  start.setDate(end.getDate() - 30);
  return normalizeTimeRange([start, end]);
}

export function getThisMonthDatesRange(): [Date, Date] {
  const start = new Date();
  start.setDate(1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(end.getDate() - 1);
  return normalizeTimeRange([start, end]);
}

export function getLastMonthDatesRange(): [Date, Date] {
  const start = new Date();
  start.setDate(1);
  start.setMonth(start.getMonth() - 1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(end.getDate() - 1);
  return normalizeTimeRange([start, end]);
}

export function getThisQuarterDatesRange(): [Date, Date] {
  const start = new Date();
  start.setDate(1);
  start.setMonth(Math.floor(start.getMonth() / 3) * 3);   
  const end = new Date(start);
  end.setMonth(end.getMonth() + 3);
  end.setDate(end.getDate() - 1);
  return normalizeTimeRange([start, end]);
}

export function getLastQuarterDatesRange(): [Date, Date] {
  const start = new Date();
  start.setDate(1);
  start.setMonth(Math.floor(start.getMonth() / 3) * 3 - 3);   
  const end = new Date(start);
  end.setMonth(end.getMonth() + 3);
  end.setDate(end.getDate() - 1);
  return normalizeTimeRange([start, end]);
}

export function getThisYearDatesRange(): [Date, Date] {
  const start = new Date();
  start.setDate(1);
  start.setMonth(0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 12);
  end.setDate(end.getDate() - 1);
  return normalizeTimeRange([start, end]);
}

export function getLastYearDatesRange(): [Date, Date] {
  const start = new Date();
  start.setDate(1);
  start.setMonth(0);
  const end = new Date(start);
  start.setFullYear(start.getFullYear() - 1);
  end.setDate(end.getDate() - 1);
  return normalizeTimeRange([start, end]);
}