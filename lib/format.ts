type Dated = {
  date: string;
  timeValid?: boolean;
};

const timeZone = "America/New_York";

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  return parts.find((item) => item.type === type)?.value ?? "";
}

export function formatGameDate(game: Dated) {
  if (!game.date) return "Date TBD";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).formatToParts(new Date(game.date));

  return `${part(parts, "weekday")}, ${part(parts, "month")} ${part(parts, "day")}`;
}

export function formatGameTime(game: Dated) {
  if (!game.date || !game.timeValid) return "Time TBD";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(new Date(game.date));

  return `${part(parts, "hour")}:${part(parts, "minute")} ${part(parts, "dayPeriod")} ${part(parts, "timeZoneName")}`;
}

export function formatHeadlineWhen(game: Dated & { status: string; statusText: string }) {
  if (game.status !== "scheduled") return game.statusText;
  if (!game.date || !game.timeValid) return formatGameDate(game);

  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date(game.date));
  const todayParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());

  const sameDay =
    part(dateParts, "month") === part(todayParts, "month") &&
    part(dateParts, "day") === part(todayParts, "day");

  const timeParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(game.date));
  const time = `${part(timeParts, "hour")}:${part(timeParts, "minute")} ${part(timeParts, "dayPeriod")}`;
  const daysAway =
    (new Date(game.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);

  if (daysAway > 6) {
    return `${formatGameDate(game)} · ${time}`;
  }

  return sameDay ? time : `${part(dateParts, "weekday")} ${time}`;
}

export function formatVenue(game: { venue?: string; city?: string; state?: string }) {
  const place = [game.city, game.state].filter(Boolean).join(", ");
  if (game.venue && place) return `${game.venue} · ${place}`;
  return game.venue ?? place ?? "Location TBD";
}

export function uvaResult(game: {
  status: string;
  uvaIsHome: boolean;
  home: { winner?: boolean };
  away: { winner?: boolean };
}) {
  const uva = game.uvaIsHome ? game.home : game.away;
  if (game.status !== "final" || uva.winner === undefined) return null;
  return uva.winner ? "W" : "L";
}
