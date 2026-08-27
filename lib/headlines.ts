import type { GameStatus, TeamSide } from "./espn";

export const HEADLINE_LEAGUES = [
  {
    id: "cfb",
    label: "CFB",
    path: "football/college-football",
    query: "groups=80&limit=100",
    limit: 5,
  },
  {
    id: "cbb",
    label: "CBB",
    path: "basketball/mens-college-basketball",
    query: "limit=100",
    limit: 3,
  },
  {
    id: "nfl",
    label: "NFL",
    path: "football/nfl",
    query: "",
    limit: 4,
  },
  {
    id: "nba",
    label: "NBA",
    path: "basketball/nba",
    query: "",
    limit: 2,
  },
  {
    id: "mlb",
    label: "MLB",
    path: "baseball/mlb",
    query: "",
    limit: 4,
  },
] as const;

export type HeadlineLeagueId = (typeof HEADLINE_LEAGUES)[number]["id"];

export type HeadlineGame = {
  id: string;
  league: HeadlineLeagueId;
  leagueLabel: string;
  date: string;
  timeValid: boolean;
  tv?: string;
  status: GameStatus;
  statusText: string;
  home: TeamSide;
  away: TeamSide;
  homeConferenceId?: string;
  awayConferenceId?: string;
};

type EspnTeam = {
  id?: string;
  displayName?: string;
  shortDisplayName?: string;
  abbreviation?: string;
  logo?: string;
  logos?: { href?: string }[];
  conferenceId?: string;
};

type EspnCompetitor = {
  id?: string;
  homeAway?: string;
  winner?: boolean;
  score?: string | number | { displayValue?: string; value?: number };
  curatedRank?: { current?: number };
  team?: EspnTeam;
};

type EspnCompetition = {
  date?: string;
  timeValid?: boolean;
  broadcast?: string;
  broadcasts?: { names?: string[]; type?: { shortName?: string }; media?: { shortName?: string } }[];
  geoBroadcasts?: { type?: { shortName?: string }; market?: { type?: string }; media?: { shortName?: string } }[];
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
};

type EspnEvent = {
  id?: string;
  date?: string;
  timeValid?: boolean;
  competitions?: EspnCompetition[];
};

const POWER_CBB = new Set(["2", "4", "7", "8", "23"]);
const MARQUEE_MLB = new Set([
  "NYY",
  "LAD",
  "BOS",
  "CHC",
  "ATL",
  "PHI",
  "HOU",
  "NYM",
  "SF",
  "SD",
  "TEX",
  "SEA",
]);
const MAJOR_TV = new Set([
  "ABC",
  "NBC",
  "CBS",
  "FOX",
  "ESPN",
  "NFL Net",
  "TNT",
  "TBS",
  "Amazon",
  "Prime Video",
]);
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

function logoFor(team?: EspnTeam) {
  return team?.logo ?? team?.logos?.[0]?.href ?? "";
}

function scoreFor(competitor?: EspnCompetitor) {
  const score = competitor?.score;
  if (score === undefined || score === null || score === "") return undefined;
  if (typeof score === "object") return score.displayValue;
  return String(score);
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

function tvFor(competition: EspnCompetition) {
  const named = competition.broadcasts?.find((broadcast) => broadcast.names?.[0])?.names?.[0];
  if (named) return named;

  const national = competition.geoBroadcasts?.find(
    (broadcast) => broadcast.market?.type === "National" && broadcast.media?.shortName,
  );
  return national?.media?.shortName ?? competition.broadcast;
}

function statusFor(competition: EspnCompetition): {
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

function parseEvent(
  event: EspnEvent,
  league: (typeof HEADLINE_LEAGUES)[number],
): HeadlineGame | null {
  const competition = event.competitions?.[0];
  if (!competition) return null;

  const parsedStatus = statusFor(competition);
  if (!parsedStatus) return null;

  const homeCompetitor = competition.competitors?.find((team) => team.homeAway === "home");
  const awayCompetitor = competition.competitors?.find((team) => team.homeAway === "away");
  const home = teamSide(homeCompetitor);
  const away = teamSide(awayCompetitor);

  if (
    (league.id === "cfb" || league.id === "cbb") &&
    (home.id === "258" || away.id === "258")
  ) {
    return null;
  }

  return {
    id: event.id ?? "",
    league: league.id,
    leagueLabel: league.label,
    date: competition.date ?? event.date ?? "",
    timeValid: competition.timeValid ?? event.timeValid ?? true,
    tv: tvFor(competition),
    status: parsedStatus.status,
    statusText: parsedStatus.statusText,
    home,
    away,
    homeConferenceId: homeCompetitor?.team?.conferenceId,
    awayConferenceId: awayCompetitor?.team?.conferenceId,
  };
}

function importance(game: HeadlineGame, now: number) {
  let score = 0;
  if (game.status === "in_progress") score += 10000;
  if (game.status === "final") score -= 200;

  const ranks = [game.away.rank, game.home.rank].filter((rank): rank is number => rank !== undefined);
  if (ranks.length === 2) score += 500 + (25 - ranks[0]) + (25 - ranks[1]);
  else if (ranks.length === 1) score += 200 + (25 - ranks[0]);

  if (game.league === "cbb") {
    const power = [game.awayConferenceId, game.homeConferenceId].filter((id) => id && POWER_CBB.has(id));
    if (power.length === 2) score += 350;
    else if (power.length === 1) score += 120;
  }

  if (game.league === "mlb") {
    if (MARQUEE_MLB.has(game.away.abbreviation)) score += 40;
    if (MARQUEE_MLB.has(game.home.abbreviation)) score += 40;
  }

  if (game.tv && MAJOR_TV.has(game.tv)) score += 80;

  const start = new Date(game.date).getTime();
  if (!Number.isNaN(start) && game.status === "scheduled") {
    score -= Math.max(0, start - now) / (1000 * 60 * 60);
  }

  return score;
}

function pickBiggest(games: HeadlineGame[], limit: number, now: number) {
  const scored = games
    .map((game) => ({ game, score: importance(game, now) }))
    .sort((a, b) => b.score - a.score || a.game.date.localeCompare(b.game.date));

  const soon = scored.filter(
    (item) =>
      item.game.status === "in_progress" ||
      new Date(item.game.date).getTime() <= now + TWO_WEEKS_MS,
  );
  const pool = soon.length > 0 ? soon : scored;
  return pool.slice(0, limit).map((item) => item.game);
}

async function fetchLeague(league: (typeof HEADLINE_LEAGUES)[number]): Promise<HeadlineGame[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${league.path}/scoreboard${league.query ? `?${league.query}` : ""}`;
  const response = await fetch(url, {
    next: { revalidate: 60 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Could not load ${league.label} scoreboard (${response.status})`);
  }

  const data = (await response.json()) as { events?: EspnEvent[] };
  return (data.events ?? [])
    .map((event) => parseEvent(event, league))
    .filter((game): game is HeadlineGame => game !== null);
}

export async function getHeadlineGames(): Promise<HeadlineGame[]> {
  const now = Date.now();
  const results = await Promise.allSettled(HEADLINE_LEAGUES.map((league) => fetchLeague(league)));
  const picked: HeadlineGame[] = [];

  results.forEach((result, index) => {
    if (result.status !== "fulfilled") return;
    picked.push(...pickBiggest(result.value, HEADLINE_LEAGUES[index].limit, now));
  });

  return picked.sort((a, b) => {
    if (a.status === "in_progress" && b.status !== "in_progress") return -1;
    if (b.status === "in_progress" && a.status !== "in_progress") return 1;
    return a.date.localeCompare(b.date);
  });
}
