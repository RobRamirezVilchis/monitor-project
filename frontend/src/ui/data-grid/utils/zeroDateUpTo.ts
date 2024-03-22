/**
 * Returns a new date with all values up to the given unit set to 0.
 * @param date the date to zero up to the given `unit`
 * @param unit the unit to zero up to
 * @returns a new date with all values up to the given unit set to 0
 * @example
 * const date = new Date("2021-01-01 12:34:56.789")
 * zeroDateUpTo(date, "hours");        // 2021-01-01 00:00:00.000
 * zeroDateUpTo(date, "minutes");      // 2021-01-01 12:00:00.000
 * zeroDateUpTo(date, "seconds");      // 2021-01-01 12:34:00.000
 * zeroDateUpTo(date, "milliseconds"); // 2021-01-01 12:34:56.000
 */
export function zeroDateUpTo(date: Date, unit: "hours" | "minutes" | "seconds" | "milliseconds") {
  const newDate = new Date(date);
  switch (unit) {
    case "hours":
      newDate.setHours(0, 0, 0, 0);
    case "minutes":
      newDate.setMinutes(0, 0, 0);
    case "seconds":
      newDate.setSeconds(0, 0);
    case "milliseconds":
      newDate.setMilliseconds(0);
  }
  return newDate;
}