export type RecordSport = "football" | "basketball";

export type SportRecords = {
  sport: RecordSport;
  label: string;
  season: string;
  record: string;
  conference: string;
  highlight: string;
  stats: { name: string; value: string }[];
  notes: string[];
};

export const UVA_RECORDS: Record<RecordSport, SportRecords> = {
  football: {
    sport: "football",
    label: "Football",
    season: "2025",
    record: "11–3",
    conference: "ACC 7–1",
    highlight: "ACC Championship game",
    stats: [
      { name: "All-time bowl games", value: "22" },
      { name: "ACC titles", value: "2" },
      { name: "Heisman finalists", value: "1" },
      { name: "NFL draftees (all-time)", value: "180+" },
    ],
    notes: [
      "Beat Virginia Tech 27–7 in the regular-season finale.",
      "Reached the ACC Championship and fell to Duke in overtime.",
    ],
  },
  basketball: {
    sport: "basketball",
    label: "Basketball",
    season: "2025–26",
    record: "23–11",
    conference: "ACC 13–7",
    highlight: "2019 NCAA champions",
    stats: [
      { name: "NCAA titles", value: "1" },
      { name: "ACC regular-season titles", value: "11" },
      { name: "NCAA Tournament trips", value: "25" },
      { name: "Naismith Coach of the Year", value: "2" },
    ],
    notes: [
      "Last season ended in the ACC Tournament semifinals vs Duke.",
      "Program highlight: 2019 national championship in Minneapolis.",
    ],
  },
};
