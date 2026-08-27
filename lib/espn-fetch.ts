const ESPN_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://www.espn.com/",
};

export async function fetchEspn(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 60 },
    headers: ESPN_HEADERS,
  });

  if (response.ok) return response;

  const fallbackUrl = url.replace("site.api.espn.com", "site.web.api.espn.com");
  if (fallbackUrl === url) return response;

  return fetch(fallbackUrl, {
    next: { revalidate: 60 },
    headers: ESPN_HEADERS,
  });
}
