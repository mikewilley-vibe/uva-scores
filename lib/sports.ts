export const SPORTS = [
  {
    id: "football",
    label: "Football",
    path: "football/college-football",
    teamId: "258",
  },
  {
    id: "basketball",
    label: "Basketball",
    path: "basketball/mens-college-basketball",
    teamId: "258",
  },
  {
    id: "baseball",
    label: "Baseball",
    path: "baseball/college-baseball",
    teamId: "131",
  },
  {
    id: "lacrosse",
    label: "Lacrosse",
    path: "lacrosse/mens-college-lacrosse",
    teamId: "258",
  },
] as const;

export type Sport = (typeof SPORTS)[number];
export type SportId = Sport["id"];
