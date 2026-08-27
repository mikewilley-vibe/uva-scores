import type { SportSchedule } from "@/lib/espn";

export function SportNav({ schedules }: { schedules: SportSchedule[] }) {
  return (
    <nav aria-label="UVA sports" className="flex flex-wrap gap-2">
      {schedules.map(({ sport, upcoming }) => (
        <a
          key={sport.id}
          href={`#${sport.id}`}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition-colors hover:border-uva-orange hover:text-white"
        >
          {sport.label}
          {upcoming.length > 0 ? (
            <span className="ml-1.5 text-uva-orange">{upcoming.length}</span>
          ) : null}
        </a>
      ))}
    </nav>
  );
}
