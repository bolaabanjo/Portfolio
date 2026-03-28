interface OpenLibraryResult {
  coverUrl: string | null;
  author: string | null;
  firstPublishYear: number | null;
  subjects: string[];
}

const cache = new Map<string, OpenLibraryResult>();

export async function fetchBookData(
  title: string,
  author?: string
): Promise<OpenLibraryResult> {
  const cacheKey = `${title}::${author || ""}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    const params = new URLSearchParams({ title, limit: "1" });
    if (author) params.set("author", author);

    const res = await fetch(
      `https://openlibrary.org/search.json?${params.toString()}`,
      { next: { revalidate: 86400 } } // cache for 24h
    );

    if (!res.ok) return fallback(cacheKey);

    const data = await res.json();
    const doc = data.docs?.[0];

    if (!doc) return fallback(cacheKey);

    const result: OpenLibraryResult = {
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      author: doc.author_name?.[0] || null,
      firstPublishYear: doc.first_publish_year || null,
      subjects: (doc.subject || []).slice(0, 3),
    };

    cache.set(cacheKey, result);
    return result;
  } catch {
    return fallback(cacheKey);
  }
}

function fallback(cacheKey: string): OpenLibraryResult {
  const result = { coverUrl: null, author: null, firstPublishYear: null, subjects: [] };
  cache.set(cacheKey, result);
  return result;
}
