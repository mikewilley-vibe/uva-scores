import Image from "next/image";
import type { Game, TeamSide } from "@/lib/espn";
import { formatGameDate, formatGameTime, formatVenue, uvaResult } from "@/lib/format";

function Team({ team, align }: { team: TeamSide; align: "left" | "right" }) {
  const rankedName = team.rank ? `#${team.rank} ${team.shortName}` : team.shortName;

  return (
    <div
      className={`flex min-w-0 items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      {team.logo ? (
        <Image
          src={team.logo}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 object-contain"
        />
      ) : (
        <div className="h-12 w-12 shrink-0 rounded-full bg-uva-navy/10" />
      )}
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold tracking-tight text-uva-navy">
          {rankedName}
        </p>
        <p className="text-sm text-uva-navy/55">{team.abbreviation}</p>
      </div>
    </div>
  );
}

function Score({ game }: { game: Game }) {
  if (game.status === "scheduled") {
    return (
      <p className="px-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-uva-navy/40">
        {game.uvaIsHome ? "vs" : "at"}
      </p>
    );
  }

  return (
    <div className="px-3 text-center">
      <p className="font-[family-name:var(--font-display)] text-2xl tabular-nums text-uva-navy">
        {game.away.score ?? "–"}
        <span className="mx-1 text-uva-navy/30">–</span>
        {game.home.score ?? "–"}
      </p>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-uva-navy/50">
        {game.statusText}
      </p>
    </div>
  );
}

export function GameCard({
  game,
  showSport = false,
}: {
  game: Game;
  showSport?: boolean;
}) {
  const result = uvaResult(game);
  const opponent = game.uvaIsHome ? game.away : game.home;

  return (
    <article className="rounded-2xl border border-uva-navy/8 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(35,45,75,0.45)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-medium uppercase tracking-[0.14em] text-uva-navy/55">
        <span className="flex flex-wrap items-center gap-2">
          {showSport ? (
            <span className="rounded-full bg-uva-navy/8 px-2 py-0.5 text-[11px] tracking-[0.12em] text-uva-navy">
              {game.sportLabel}
            </span>
          ) : null}
          <span suppressHydrationWarning>
            {formatGameDate(game)}
            {game.week ? ` · ${game.week}` : ""}
          </span>
        </span>
        <span className="flex items-center gap-2">
          {result ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] tracking-[0.12em] ${
                result === "W"
                  ? "bg-uva-orange/15 text-uva-orange"
                  : "bg-uva-navy/8 text-uva-navy/70"
              }`}
            >
              {result}
            </span>
          ) : null}
          {game.status === "in_progress" ? (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] tracking-[0.12em] text-white">
              Live
            </span>
          ) : null}
          {game.tv ? <span>{game.tv}</span> : null}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Team team={game.away} align="left" />
        <Score game={game} />
        <Team team={game.home} align="right" />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-uva-navy/8 pt-3 text-sm text-uva-navy/65">
        <p suppressHydrationWarning>
          {game.status === "scheduled" ? formatGameTime(game) : game.statusText}
          {game.uvaIsHome ? " · Home" : ` · at ${opponent.shortName}`}
        </p>
        <p className="text-right">{formatVenue(game)}</p>
      </div>
    </article>
  );
}
