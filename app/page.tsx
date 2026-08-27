import { GameCard } from "@/components/GameCard";
import { HeadlineBanner } from "@/components/HeadlineBanner";
import { RecordsSection } from "@/components/RecordsSection";
import { SportNav } from "@/components/SportNav";
import { getUvaSchedules } from "@/lib/espn";
import { getHeadlineGames } from "@/lib/headlines";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [schedules, headlines] = await Promise.all([
    getUvaSchedules(),
    getHeadlineGames(),
  ]);
  const upcoming = schedules
    .flatMap((schedule) => schedule.upcoming)
    .sort((a, b) => {
      if (a.status === "in_progress" && b.status !== "in_progress") return -1;
      if (b.status === "in_progress" && a.status !== "in_progress") return 1;
      return a.date.localeCompare(b.date);
    });

  return (
    <div className="min-h-full bg-[#f4efe6]">
      <header className="bg-uva-navy text-white">
        <HeadlineBanner games={headlines} />
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-5 py-10 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-uva-orange">
            Wahoowa
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase leading-none tracking-wide sm:text-5xl">
            UVA Games
          </h1>
          <p className="max-w-md text-sm leading-6 text-white/70">
            Upcoming Virginia Cavaliers games and recent results for football,
            basketball, baseball, and lacrosse.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <SportNav schedules={schedules} />
            <a
              href="#records"
              className="rounded-full bg-uva-orange px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white"
            >
              Records
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-12 px-5 py-10 sm:px-8">
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-wide text-uva-navy">
              Coming up
            </h2>
            <p className="text-sm text-uva-navy/50">{upcoming.length} games</p>
          </div>
          {upcoming.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-uva-navy/20 bg-white/70 px-5 py-8 text-center text-uva-navy/60">
              No upcoming UVA games are listed right now.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {upcoming.map((game) => (
                <GameCard
                  key={`${game.sport}-${game.id}`}
                  game={game}
                  showSport
                />
              ))}
            </div>
          )}
        </section>

        <RecordsSection />

        {schedules.map(({ sport, recent }) => (
          <section
            key={sport.id}
            id={sport.id}
            className="flex scroll-mt-6 flex-col gap-4"
          >
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-wide text-uva-navy">
                {sport.label}
              </h2>
              <p className="text-sm text-uva-navy/50">Recent results</p>
            </div>
            {recent.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-uva-navy/20 bg-white/70 px-5 py-8 text-center text-uva-navy/60">
                Results will show here after {sport.label.toLowerCase()} games
                are final.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {recent.map((game) => (
                  <GameCard key={`${game.sport}-${game.id}`} game={game} />
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
