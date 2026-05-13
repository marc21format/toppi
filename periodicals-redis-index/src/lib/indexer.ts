import { getRedisClient } from "./redis";
import {
  recordToSearchText,
  samplePeriodicals,
  tokenize,
  type PeriodicalRecord,
} from "./periodicals";

const DOCS_KEY = "periodicals:docs";

function docKey(id: string) {
  return `periodicals:doc:${id}`;
}

function termKey(term: string) {
  return `periodicals:term:${term}`;
}

function normalizeRecord(record: PeriodicalRecord): PeriodicalRecord {
  return {
    ...record,
    authors: record.authors.filter(Boolean),
    tags: record.tags.filter(Boolean),
  };
}

export async function indexRecords(inputRecords: PeriodicalRecord[] = samplePeriodicals) {
  const client = await getRedisClient();
  if (!client) {
    throw new Error("Redis client is unavailable.");
  }
  const records = inputRecords.map(normalizeRecord);
  const uniqueTerms = new Set<string>();

  for (const record of records) {
    const searchableText = recordToSearchText(record);
    const terms = tokenize(searchableText);
    const pipeline = client.multi();

    const docData: Record<string, string> = {
      id: record.id,
      title: record.title,
      publication: record.publication,
      issue: record.issue,
      publishedAt: record.publishedAt,
      authors: JSON.stringify(record.authors),
      summary: record.summary,
      tags: JSON.stringify(record.tags),
      searchableText,
    };
    if (record.content) {
      docData.content = record.content;
    }
    if (record.indexedAt) {
      docData.indexedAt = record.indexedAt;
    }
    if (record.holdings !== null && record.holdings !== undefined) {
      docData.holdings = record.holdings;
    }
    if (record.digitalCopyLink !== null && record.digitalCopyLink !== undefined) {
      docData.digitalCopyLink = record.digitalCopyLink;
    }
    pipeline.hSet(docKey(record.id), docData);
    pipeline.sAdd(DOCS_KEY, record.id);

    for (const term of new Set(terms)) {
      uniqueTerms.add(term);
      pipeline.sAdd(termKey(term), record.id);
    }

    await pipeline.exec();
  }

  return {
    indexed: records.length,
    uniqueTerms: uniqueTerms.size,
  };
}

export type SearchResult = PeriodicalRecord & {
  score: number;
  matchedTerms: string[];
};

export async function searchRecords(
  query: string,
  field: "any" | "title" | "author" | "subject" | "abstract" | "fulltext" = "any",
  mode: "all" | "phrase" | "rootword" = "rootword"
): Promise<SearchResult[]> {
  const client = await getRedisClient();
  if (!client) {
    throw new Error("Redis client is unavailable.");
  }

  // If empty query, return all documents
  if (!query.trim()) {
    const allDocIds = await client.sMembers(DOCS_KEY);
    const docs = await Promise.all(
      allDocIds.map(async (id) => {
        const document = await client.hGetAll(docKey(id));
        return {
          id: document.id,
          title: document.title,
          publication: document.publication,
          issue: document.issue,
          publishedAt: document.publishedAt,
          authors: JSON.parse(document.authors || "[]") as string[],
          summary: document.summary,
          tags: JSON.parse(document.tags || "[]") as string[],
          content: document.content,
          indexedAt: document.indexedAt,
          holdings: document.holdings,
          digitalCopyLink: document.digitalCopyLink,
          score: 0,
          matchedTerms: [],
        } satisfies SearchResult;
      }),
    );
    return docs.filter((item) => item.title && item.publication);
  }

  const allDocIds = await client.sMembers(DOCS_KEY);
  const allTermKeys = await client.keys("periodicals:term:*");
  const allTerms = allTermKeys.map((key) => key.replace("periodicals:term:", ""));
  const scoreById = new Map<string, number>();
  const matchedTermsById = new Map<string, Set<string>>();

  if (mode === "all") {
    // ALL: Every word must appear in the document
    const queryTerms = tokenize(query);
    const termDocMaps = await Promise.all(
      queryTerms.map(async (queryTerm) => {
        const matchingTerms = allTerms.filter((term) => term.startsWith(queryTerm));
        const docSet = new Set<string>();
        for (const term of matchingTerms) {
          const ids = await client.sMembers(termKey(term));
          ids.forEach((id) => docSet.add(id));
        }
        return docSet;
      })
    );
    // Find intersection: docs that contain ALL terms
    const intersection = termDocMaps.reduce((acc, set) => new Set([...acc].filter((x) => set.has(x))));
    for (const docId of intersection) {
      scoreById.set(docId, queryTerms.length);
      const terms = new Set<string>();
      for (const queryTerm of queryTerms) {
        const matchingTerms = allTerms.filter((term) => term.startsWith(queryTerm));
        matchingTerms.forEach((term) => terms.add(term));
      }
      matchedTermsById.set(docId, terms);
    }
  } else if (mode === "phrase") {
    // PHRASE: Exact phrase match in searchableText
    const phraseQuery = query.toLowerCase();
    for (const docId of allDocIds) {
      const document = await client.hGetAll(docKey(docId));
      if (document.searchableText && document.searchableText.toLowerCase().includes(phraseQuery)) {
        scoreById.set(docId, 100); // High score for exact phrase
        matchedTermsById.set(docId, new Set([phraseQuery]));
      }
    }
  } else {
    // ROOTWORD (default): Prefix matching
    const queryTerms = tokenize(query);
    for (const queryTerm of queryTerms) {
      const matchingTerms = allTerms.filter((term) => term.startsWith(queryTerm));
      for (const term of matchingTerms) {
        const ids = await client.sMembers(termKey(term));
        for (const id of ids) {
          scoreById.set(id, (scoreById.get(id) ?? 0) + 1);
          if (!matchedTermsById.has(id)) {
            matchedTermsById.set(id, new Set());
          }
          matchedTermsById.get(id)?.add(term);
        }
      }
    }
  }

  const rankedIds = [...scoreById.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .slice(0, 100);

  const docs = await Promise.all(
    rankedIds.map(async ({ id, score }) => {
      const document = await client.hGetAll(docKey(id));

      return {
        id: document.id,
        title: document.title,
        publication: document.publication,
        issue: document.issue,
        publishedAt: document.publishedAt,
        authors: JSON.parse(document.authors || "[]") as string[],
        summary: document.summary,
        tags: JSON.parse(document.tags || "[]") as string[],
        content: document.content,
        indexedAt: document.indexedAt,
        holdings: document.holdings,
        digitalCopyLink: document.digitalCopyLink,
        score,
        matchedTerms: [...(matchedTermsById.get(id) ?? new Set())],
      } satisfies SearchResult;
    }),
  );

  const filtered = docs.filter((item) => item.title && item.publication);

  // Filter by field if specified
  if (field === "any") {
    return filtered;
  }

  return filtered.filter((doc) => {
    const queryLower = query.toLowerCase();
    switch (field) {
      case "title":
        return doc.title.toLowerCase().includes(queryLower);
      case "author":
        return doc.authors.some((author) => author.toLowerCase().includes(queryLower));
      case "subject":
        return doc.tags.some((tag) => tag.toLowerCase().includes(queryLower));
      case "abstract":
        return doc.summary.toLowerCase().includes(queryLower);
      case "fulltext":
        return (doc.content || "").toLowerCase().includes(queryLower);
      default:
        return true;
    }
  });
}

// Get autocomplete suggestions
export async function getAutocompleteSuggestions(prefix: string): Promise<string[]> {
  const client = await getRedisClient();
  if (!client) {
    throw new Error("Redis client is unavailable.");
  }

  if (!prefix.trim()) {
    return [];
  }

  const normalizedPrefix = prefix.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (normalizedPrefix.length === 0) {
    return [];
  }

  // Get all indexed terms
  const allTermKeys = await client.keys("periodicals:term:*");
  const allTerms = allTermKeys.map((key) => key.replace("periodicals:term:", ""));

  // Find terms that start with the prefix
  const matches = allTerms
    .filter((term) => term.startsWith(normalizedPrefix))
    .sort()
    .slice(0, 10); // Return top 10 suggestions

  return matches;
}

// Update an existing record
export async function updateRecord(id: string, updates: Partial<PeriodicalRecord>): Promise<void> {
  const client = await getRedisClient();
  if (!client) {
    throw new Error("Redis client is unavailable.");
  }

  const existing = await client.hGetAll(docKey(id));
  if (!existing || !existing.id) {
    throw new Error(`Record ${id} not found.`);
  }

  const record: PeriodicalRecord = {
    id: existing.id,
    title: updates.title ?? existing.title,
    publication: updates.publication ?? existing.publication,
    issue: updates.issue ?? existing.issue,
    publishedAt: updates.publishedAt ?? existing.publishedAt,
    authors: updates.authors ?? (JSON.parse(existing.authors || "[]") as string[]),
    summary: updates.summary ?? existing.summary,
    tags: updates.tags ?? (JSON.parse(existing.tags || "[]") as string[]),
    content: updates.content ?? existing.content,
    indexedAt: existing.indexedAt,
    holdings: updates.holdings ?? existing.holdings,
    digitalCopyLink: updates.digitalCopyLink ?? existing.digitalCopyLink,
  };

  const searchableText = recordToSearchText(record);
  const terms = tokenize(searchableText);

  const docData: Record<string, string> = {
    id: record.id,
    title: record.title,
    publication: record.publication,
    issue: record.issue,
    publishedAt: record.publishedAt,
    authors: JSON.stringify(record.authors),
    summary: record.summary,
    tags: JSON.stringify(record.tags),
    searchableText,
  };
  if (record.content) {
    docData.content = record.content;
  }
  if (record.indexedAt) {
    docData.indexedAt = record.indexedAt;
  }
  if (record.holdings !== null && record.holdings !== undefined) {
    docData.holdings = record.holdings;
  }
  if (record.digitalCopyLink !== null && record.digitalCopyLink !== undefined) {
    docData.digitalCopyLink = record.digitalCopyLink;
  }

  const pipeline = client.multi();
  pipeline.hSet(docKey(id), docData);

  for (const term of new Set(terms)) {
    pipeline.sAdd(termKey(term), id);
  }

  await pipeline.exec();
}

// Delete a record
export async function deleteRecord(id: string): Promise<void> {
  const client = await getRedisClient();
  if (!client) {
    throw new Error("Redis client is unavailable.");
  }

  const existing = await client.hGetAll(docKey(id));
  if (!existing || !existing.id) {
    throw new Error(`Record ${id} not found.`);
  }

  const pipeline = client.multi();
  pipeline.del(docKey(id));
  pipeline.sRem(DOCS_KEY, id);

  const searchableText = existing.searchableText || "";
  const terms = tokenize(searchableText);
  for (const term of new Set(terms)) {
    pipeline.sRem(termKey(term), id);
  }

  await pipeline.exec();
}
