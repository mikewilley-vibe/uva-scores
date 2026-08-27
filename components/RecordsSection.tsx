"use client";

import { useState } from "react";
import { UVA_RECORDS, type RecordSport } from "@/lib/records";

export function RecordsSection() {
  const [sport, setSport] = useState<RecordSport>("football");
  const records = UVA_RECORDS[sport];

  return (
    <section
      id="records"
      className="flex scroll-mt-6 flex-col gap-4 rounded-3xl border-2 border-uva-orange bg-white p-5 shadow-[0_12px_40px_-24px_rgba(35,45,75,0.45)] sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-uva-orange">
            New · Sample data
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-wide text-uva-navy">
            Records & stats
          </h2>
        </div>
        <div className="flex gap-2" role="tablist" aria-label="Choose a sport">
          {(Object.keys(UVA_RECORDS) as RecordSport[]).map((id) => {
            const selected = sport === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setSport(id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                  selected
                    ? "bg-uva-orange text-white"
                    : "bg-uva-navy/8 text-uva-navy hover:bg-uva-navy/12"
                }`}
              >
                {UVA_RECORDS[id].label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="rounded-xl bg-uva-orange/10 px-4 py-3 text-sm font-medium text-uva-navy">
        Showing <span className="font-semibold">{records.label}</span> records
        for the {records.season} season.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-uva-navy px-4 py-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
            Last season
          </p>
          <p className="font-[family-name:var(--font-display)] text-4xl tracking-wide">
            {records.record}
          </p>
          <p className="mt-1 text-sm text-white/70">{records.conference}</p>
        </div>
        <div className="rounded-2xl bg-[#f4efe6] px-4 py-5 sm:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-uva-navy/50">
            Program highlight
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl uppercase tracking-wide text-uva-navy">
            {records.highlight}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {records.stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-2xl border border-uva-navy/8 bg-[#f4efe6] px-4 py-4"
          >
            <p className="font-[family-name:var(--font-display)] text-3xl text-uva-navy">
              {stat.value}
            </p>
            <p className="text-sm text-uva-navy/60">{stat.name}</p>
          </div>
        ))}
      </div>

      <ul className="flex flex-col gap-2 text-sm leading-6 text-uva-navy/75">
        {records.notes.map((note) => (
          <li key={note} className="border-l-4 border-uva-orange pl-3">
            {note}
          </li>
        ))}
      </ul>
    </section>
  );
}
