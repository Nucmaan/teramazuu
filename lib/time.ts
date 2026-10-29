// All campaign times are expressed in Africa/Mogadishu (EAT). Dates are stored
// in UTC; these helpers convert at the edges (forms, display, charts).
export const CAMPAIGN_TZ = "Africa/Mogadishu";

/** Offset in minutes of `tz` at instant `date` (e.g. +180 for EAT). */
function tzOffsetMinutes(date: Date, tz = CAMPAIGN_TZ) {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = name?.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}

/** "2026-10-30T09:00" interpreted as Mogadishu wall time → UTC Date. */
export function fromCampaignLocal(value: string): Date | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const asUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  const offset = tzOffsetMinutes(new Date(asUtc));
  return new Date(asUtc - offset * 60_000);
}

/** UTC Date → "2026-10-30T09:00" in Mogadishu wall time (for datetime-local). */
export function toCampaignLocalInput(date: Date): string {
  const shifted = new Date(date.getTime() + tzOffsetMinutes(date) * 60_000);
  return shifted.toISOString().slice(0, 16);
}

export function formatCampaignDate(date: Date, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: CAMPAIGN_TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function formatCampaignDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: CAMPAIGN_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** YYYY-MM-DD of the Mogadishu calendar day containing `date`. */
export function campaignDayKey(date: Date) {
  return toCampaignLocalInput(date).slice(0, 10);
}

/** UTC instant at which the Mogadishu calendar day of `date` began. */
export function startOfCampaignDay(date: Date) {
  return fromCampaignLocal(`${campaignDayKey(date)}T00:00`)!;
}
