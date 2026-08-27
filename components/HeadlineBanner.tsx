import Image from "next/image";
import type { HeadlineGame } from "@/lib/headlines";
import type { TeamSide } from "@/lib/espn";
import { formatHeadlineWhen } from "@/lib/format";

function TeamRow({
  team,
  showScore,
}: {
  team: TeamSide;
  showScore: boolean;
}) {
  const name = team.rank ? `#${team.rank} ${team.abbreviation}` : team.abbreviation;

  return (
    <div className="flex items-center gap-2">
      {team.logo ? (
        <Image
          src={team.logo}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 shrink-0 object-contain"
        />
      ) : (
        <span className="h-5 w-5 shrink-0 rounded-full bg-white/10" />
      )}
      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white">
        {name}
      </span>
      {showScore ? (
        <span className="font-[family-name:var(--font-display)] text-sm tabular-nums text-white">
          {team.score ?? "–"}
        </span>
      ) : null}
    </div>
  );
}

function HeadlineChip({ game }: { game: HeadlineGame }) {
  const showScore = game.status !== "scheduled";

  return (
    <article className="w-[168px] shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
        <span>{game.leagueLabel}</span>
        {game.status === "in_progress" ? (
          <span className="text-uva-orange">Live</span>
        ) : (
          <span>{game.tv ?? ""}</span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <TeamRow team={game.away} showScore={showScore} />
        <TeamRow team={game.home} showScore={showScore} />
      </div>
      <p className="mt-2 truncate text-[11px] text-white/50" suppressHydrationWarning>
        {formatHeadlineWhen(game)}
      </p>
    </article>
  );
}

export function HeadlineBanner({ games }: { games: HeadlineGame[] }) {
  if (games.length === 0) return null;

  return (
    <div className="relative border-b border-white/10">
      <p className="px-5 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45 sm:px-8">
        Around the leagues
      </p>
      <div
        className="headline-scroll flex gap-2 overflow-x-auto px-5 pb-3 sm:px-8"
        aria-label="Biggest games in other leagues"
      >
        {games.map((game) => (
          <HeadlineChip key={`${game.league}-${game.id}`} game={game} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-uva-navy to-transparent" />
    </div>
  );
}
