const ESPN_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://www.espn.com/",
};

export async function fetchEspn(url: string) {
  return fetch(url, {
    cache: "no-store",
    headers: ESPN_HEADERS,
  });
}
