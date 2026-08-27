import { SPORTS, type Sport, type SportId } from "./sports";
import { fetchEspn } from "./espn-fetch";

export type TeamSide = {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  logo: string;
  rank?: number;
  score?: string;
  winner?: boolean;
};

export type GameStatus = "scheduled" | "in_progress" | "final";

export type Game = {
  id: string;
  sport: SportId;
  sportLabel: string;
  date: string;
  timeValid: boolean;
  week?: string;
  venue?: string;
  city?: string;
  state?: string;
  tv?: string;
  status: GameStatus;
  statusText: string;
  home: TeamSide;
  away: TeamSide;
  uvaIsHome: boolean;
};

export type SportSchedule = {
  sport: Sport;
  upcoming: Game[];
  recent: Game[];
};

type EspnTeam = {
  id?: string;
  displayName?: string;
  shortDisplayName?: string;
  abbreviation?: string;
  logos?: { href?: string }[];
};

type EspnCompetitor = {
  id?: string;
  homeAway?: string;
  winner?: boolean;
  score?: string | { displayValue?: string; value?: number };
  curatedRank?: { current?: number };
  team?: EspnTeam;
};

type EspnEvent = {
  id?: string;
  date?: string;
  timeValid?: boolean;
  week?: { text?: string };
  competitions?: {
    date?: string;
    timeValid?: boolean;
    venue?: {
      fullName?: string;
      address?: { city?: string; state?: string };
    };
    broadcasts?: { media?: { shortName?: string }; type?: { shortName?: string } }[];
    status?: {
      type?: {
        name?: string;
        state?: string;
        completed?: boolean;
        description?: string;
        detail?: string;
        shortDetail?: string;
      };
    };
    competitors?: EspnCompetitor[];
  }[];
};

function logoFor(team?: EspnTeam) {
  return team?.logos?.[0]?.href ?? "";
}

function scoreFor(competitor?: EspnCompetitor) {
  const score = competitor?.score;
  if (!score) return undefined;
  if (typeof score === "string") return score;
  return score.displayValue;
}

function rankFor(competitor?: EspnCompetitor) {
  const rank = competitor?.curatedRank?.current;
  if (!rank || rank >= 99) return undefined;
  return rank;
}

function teamSide(competitor?: EspnCompetitor): TeamSide {
  const team = competitor?.team;
  return {
    id: competitor?.id ?? team?.id ?? "",
    name: team?.displayName ?? "TBD",
    shortName: team?.shortDisplayName ?? team?.displayName ?? "TBD",
    abbreviation: team?.abbreviation ?? "",
    logo: logoFor(team),
    rank: rankFor(competitor),
    score: scoreFor(competitor),
    winner: competitor?.winner,
  };
}

function tvFor(competition: NonNullable<EspnEvent["competitions"]>[number]) {
  const tv = competition.broadcasts?.find(
    (broadcast) => broadcast.type?.shortName === "TV" && broadcast.media?.shortName,
  );
  return tv?.media?.shortName;
}

function statusFor(competition: NonNullable<EspnEvent["competitions"]>[number]): {
  status: GameStatus;
  statusText: string;
} | null {
  const type = competition.status?.type;
  if (type?.name === "STATUS_POSTPONED" || type?.description === "Postponed") {
    return null;
  }
  if (type?.completed || type?.state === "post") {
    return { status: "final", statusText: type.shortDetail ?? type.detail ?? "Final" };
  }
  if (type?.state === "in") {
    return {
      status: "in_progress",
      statusText: type.detail ?? type.shortDetail ?? "In progress",
    };
  }
  return { status: "scheduled", statusText: type?.shortDetail ?? "Scheduled" };
}

function parseEvent(event: EspnEvent, sport: Sport): Game | null {
  const competition = event.competitions?.[0];
  if (!competition) return null;

  const parsedStatus = statusFor(competition);
  if (!parsedStatus) return null;

  const home = teamSide(competition.competitors?.find((team) => team.homeAway === "home"));
  const away = teamSide(competition.competitors?.find((team) => team.homeAway === "away"));

  return {
    id: event.id ?? "",
    sport: sport.id,
    sportLabel: sport.label,
    date: competition.date ?? event.date ?? "",
    timeValid: competition.timeValid ?? event.timeValid ?? true,
    week: event.week?.text,
    venue: competition.venue?.fullName,
    city: competition.venue?.address?.city,
    state: competition.venue?.address?.state,
    tv: tvFor(competition),
    status: parsedStatus.status,
    statusText: parsedStatus.statusText,
    home,
    away,
    uvaIsHome: home.id === sport.teamId,
  };
}

async function fetchSchedule(sport: Sport, season: number): Promise<Game[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport.path}/teams/${sport.teamId}/schedule?season=${season}`;
  const response = await fetchEspn(url);

  if (!response.ok) {
    throw new Error(`Could not load UVA ${sport.label} schedule (${response.status})`);
  }

  const data = (await response.json()) as { events?: EspnEvent[] };
  return (data.events ?? [])
    .map((event) => parseEvent(event, sport))
    .filter((game): game is Game => game !== null);
}

async function getSportSchedule(sport: Sport): Promise<SportSchedule> {
  const year = new Date().getFullYear();
  const seasons = await Promise.allSettled([
    fetchSchedule(sport, year),
    fetchSchedule(sport, year - 1),
  ]);

  const gamesById = new Map<string, Game>();
  for (const result of seasons) {
    if (result.status !== "fulfilled") continue;
    for (const game of result.value) {
      if (game.id) gamesById.set(game.id, game);
    }
  }

  const games = [...gamesById.values()];
  if (games.length === 0 && seasons.every((result) => result.status === "rejected")) {
    throw new Error(`Could not load UVA ${sport.label} schedule`);
  }
  const upcoming = games
    .filter((game) => game.status !== "final")
    .sort((a, b) => {
      if (a.status === "in_progress" && b.status !== "in_progress") return -1;
      if (b.status === "in_progress" && a.status !== "in_progress") return 1;
      return a.date.localeCompare(b.date);
    });

  const recent = games
    .filter((game) => game.status === "final")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  return { sport, upcoming, recent };
}

export async function getUvaSchedules(): Promise<SportSchedule[]> {
  const results = await Promise.allSettled(SPORTS.map((sport) => getSportSchedule(sport)));
  const schedules = results.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    return { sport: SPORTS[index], upcoming: [], recent: [] };
  });

  if (
    results.every((result) => result.status === "rejected") ||
    schedules.every((schedule) => schedule.upcoming.length === 0 && schedule.recent.length === 0)
  ) {
    const firstError = results.find((result) => result.status === "rejected");
    throw firstError && firstError.status === "rejected"
      ? firstError.reason
      : new Error("Could not load UVA schedules");
  }

  return schedules;
}
