"use client";

import { FormEvent, useMemo, useState, useCallback, useEffect } from "react";
import { samplePeriodicals, type PeriodicalRecord } from "@/lib/periodicals";


type SearchResult = PeriodicalRecord & {
  score: number;
  matchedTerms: string[];
};

type ApiState = {
  message: string;
  tone: "neutral" | "success" | "error";
};

const sampleJson = JSON.stringify(samplePeriodicals, null, 2);

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recordsJson, setRecordsJson] = useState(sampleJson);
  const [indexStats, setIndexStats] = useState<ApiState>({
    message: "Ready to index the sample periodicals collection.",
    tone: "neutral",
  });
  const [searchStats, setSearchStats] = useState<ApiState>({
    message: "Search the index!",
    tone: "neutral",
  });
  const [busy, setBusy] = useState(false);
  
  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showPublicationsModal, setShowPublicationsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PeriodicalRecord | null>(null);
  
  // Import mode: "manual" or "csv"
  const [importMode, setImportMode] = useState<"manual" | "csv">("manual");
  
  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    title: "",
    authors: "",
    publication: "",
    issue: "",
    publishedAt: new Date().toISOString().split('T')[0],
    summary: "",
    tags: "",
    holdings: "",
    digitalCopyLink: "",
  });
  const [publicationQuery, setPublicationQuery] = useState("");
  const [publicationPage, setPublicationPage] = useState(1);
  const [publicationRowsPerPage, setPublicationRowsPerPage] = useState(10);
  const [expandedPublication, setExpandedPublication] = useState<string | null>(null);
  const [recordsList, setRecordsList] = useState<PeriodicalRecord[]>(samplePeriodicals);
  const [allRecordsList, setAllRecordsList] = useState<PeriodicalRecord[]>(samplePeriodicals);
  
  // Search filter states
  const [selectedCreators, setSelectedCreators] = useState<Set<string>>(new Set());
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [selectedPeriodicals, setSelectedPeriodicals] = useState<Set<string>>(new Set());
  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set());
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  
  // Sort state
  const [sortBy, setSortBy] = useState<"none" | "issueDate" | "authorTitle" | "title">("none");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Search mode state
  const [searchMode, setSearchMode] = useState<"all" | "phrase" | "rootword">("rootword");
  
  // Autocomplete state
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [showAutocompleteSuggestions, setShowAutocompleteSuggestions] = useState(false);
  
  // Search field selector
  const [searchField, setSearchField] = useState<"any" | "title" | "author" | "subject" | "abstract" | "fulltext">("any");
  
  // Article Group view state
  const [showArticleGroup, setShowArticleGroup] = useState(false);
  const [articleGroupFilter, setArticleGroupFilter] = useState<{type: "creator" | "periodical" | "issue" | "subject", value: string}>({type: "creator", value: ""});
  
  // Filter expansion state
  const [expandedFilters, setExpandedFilters] = useState<{
    creators: boolean;
    subjects: boolean;
    periodicals: boolean;
    years: boolean;
  }>({
    creators: false,
    subjects: false,
    periodicals: false,
    years: false,
  });
  
  // Edit mode state
  const [editingRecord, setEditingRecord] = useState<Partial<PeriodicalRecord> | null>(null);
  
  // Jump to record state
  const [jumpInput, setJumpInput] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [editToConfirm, setEditToConfirm] = useState<Partial<PeriodicalRecord> | null>(null);

  // Load all records from Redis on mount
  useEffect(() => {
    async function loadRecords() {
      try {
        const response = await fetch("/api/records");
        const data = (await response.json()) as {
          ok: boolean;
          records?: any[];
        };

        if (data.ok && data.records && data.records.length > 0) {
          setAllRecordsList(data.records);
          setRecordsList(data.records);
        }
      } catch (error) {
        console.error("Failed to load records from Redis:", error);
        // Falls back to sample periodicals if fetch fails
      }
    }

    loadRecords();
  }, []);

  // ===== CALLBACK FUNCTIONS FOR BUTTONS =====
  const handleOpenPublicationsModal = useCallback(() => {
    setShowPublicationsModal(true);
  }, []);

  const handleOpenImportModal = useCallback(() => {
    setShowImportModal(true);
  }, []);

  const handleOpenSearchModal = useCallback(() => {
    setShowSearchModal(true);
  }, []);

  const handleClosePublicationsModal = useCallback(() => {
    setShowPublicationsModal(false);
  }, []);

  const handleCloseImportModal = useCallback(() => {
    setShowImportModal(false);
  }, []);

  const handleGoHome = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  function parseCSV(text: string): PeriodicalRecord[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) throw new Error("CSV must have header and at least one data row");

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const records: PeriodicalRecord[] = [];
    let id = 1;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim());
      if (parts.length < 3) continue;

      const titleIdx = headers.indexOf("title");
      const authorIdx = headers.indexOf("author") >= 0 ? headers.indexOf("author") : headers.indexOf("authors");
      const publicationIdx = headers.indexOf("publication");
      const issueIdx = headers.indexOf("issue");
      const yearIdx = headers.indexOf("year");
      const summaryIdx = headers.indexOf("summary") >= 0 ? headers.indexOf("summary") : headers.indexOf("content");
      const tagsIdx = headers.indexOf("tags");

      records.push({
        id: `doc-${id++}`,
        title: titleIdx >= 0 ? parts[titleIdx] : `Document ${i}`,
        authors: authorIdx >= 0 ? [parts[authorIdx]] : ["Unknown"],
        publication: publicationIdx >= 0 ? parts[publicationIdx] : "Uncategorized",
        issue: issueIdx >= 0 ? parts[issueIdx] : "N/A",
        publishedAt: yearIdx >= 0 ? parts[yearIdx] : new Date().getFullYear().toString(),
        summary: summaryIdx >= 0 ? parts[summaryIdx] : "",
        tags: tagsIdx >= 0 ? parts[tagsIdx].split(";").map((t) => t.trim()) : [],
      });
    }

    return records;
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      const text = await file.text();
      const parsed = parseCSV(text);

      const response = await fetch("/api/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: parsed }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        records?: number;
        uniqueTerms?: number;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Indexing failed.");
      }

      setIndexStats({
        message: `Indexed ${data.records ?? 0} periodicals from CSV with ${data.uniqueTerms ?? 0} unique terms.`,
        tone: "success",
      });

      setRecordsJson(JSON.stringify(parsed, null, 2));
      setRecordsList([...recordsList, ...parsed]);
      setAllRecordsList([...allRecordsList, ...parsed]);
      setSelectedRecord(parsed[0]);
    } catch (error) {
      setIndexStats({
        message: error instanceof Error ? error.message : "Unable to parse or index the CSV file.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  const statsToneClasses = useMemo(
    () => ({
      neutral: "border-gray-200 bg-gray-50 text-gray-700",
      success: "border-gray-200 bg-gray-100 text-gray-800",
      error: "border-red-200 bg-red-50 text-red-800",
    }),
    [],
  );

  const publicationList = useMemo(() => {
    try {
      const parsed = JSON.parse(recordsJson) as PeriodicalRecord[];
      const source = parsed.length > 0 ? parsed : samplePeriodicals;
      return Array.from(
        new Set(source.map((record) => record.publication?.trim()).filter(Boolean) as string[]),
      ).sort((a, b) => a.localeCompare(b));
    } catch {
      return Array.from(new Set(samplePeriodicals.map((record) => record.publication))).sort((a, b) =>
        a.localeCompare(b),
      );
    }
  }, [recordsJson]);

  const publicationRecords = useMemo(() => {
    try {
      const parsed = JSON.parse(recordsJson) as PeriodicalRecord[];
      return parsed.length > 0 ? parsed : samplePeriodicals;
    } catch {
      return samplePeriodicals;
    }
  }, [recordsJson]);

  const publicationDetails = useMemo(() => {
    const details = new Map<string, { publicationType: string; frequency: string; issues: Array<{ year: string; issue: string; count: number }> }>();

    for (const publication of publicationList) {
      const matched = publicationRecords.filter((record) => record.publication === publication);
      const issueMap = new Map<string, { count: number; year: string }>();
      
      matched.forEach((record) => {
        const issue = record.issue;
        const year = record.publishedAt.substring(0, 4);
        if (issue) {
          const current = issueMap.get(issue) ?? { count: 0, year };
          issueMap.set(issue, { count: current.count + 1, year });
        }
      });

      const issues = Array.from(issueMap.entries())
        .map(([issue, { count, year }]) => ({ year, issue, count }))
        .sort((a, b) => b.year.localeCompare(a.year) || b.issue.localeCompare(a.issue));
      
      const frequency = issues.length > 2 ? "annual" : "irregular";
      details.set(publication, {
        publicationType: "Journal - Popular",
        frequency,
        issues,
      });
    }

    return details;
  }, [publicationList, publicationRecords]);

  const recordIndex = useMemo(() => {
    if (!selectedRecord) return -1;
    return recordsList.findIndex((record) => record.id === selectedRecord.id);
  }, [selectedRecord, recordsList]);

  const canGoPrevious = recordIndex > 0;
  const canGoNext = recordIndex < recordsList.length - 1;

  const handlePreviousRecord = () => {
    if (canGoPrevious) {
      setSelectedRecord(recordsList[recordIndex - 1]);
    }
  };

  const handleNextRecord = () => {
    if (canGoNext) {
      setSelectedRecord(recordsList[recordIndex + 1]);
    }
  };

  const handleJumpToRecord = (recordNum: number) => {
    if (recordNum >= 1 && recordNum <= recordsList.length) {
      setSelectedRecord(recordsList[recordNum - 1]);
      setJumpInput("");
    }
  };

  const allAvailableCreators = useMemo(() => {
    const creators = new Map<string, number>();
    recordsList.forEach((record) => {
      record.authors.forEach((author) => {
        creators.set(author, (creators.get(author) ?? 0) + 1);
      });
    });
    return Array.from(creators.entries()).sort((a, b) => b[1] - a[1]);
  }, [recordsList]);

  const allAvailableSubjects = useMemo(() => {
    const subjects = new Map<string, number>();
    recordsList.forEach((record) => {
      record.tags.forEach((tag) => {
        subjects.set(tag, (subjects.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(subjects.entries()).sort((a, b) => b[1] - a[1]);
  }, [recordsList]);

  const availableCreators = useMemo(() => {
    if (results.length === 0) return allAvailableCreators;
    
    const creators = new Map<string, number>();
    results.forEach((result) => {
      result.authors.forEach((author) => {
        creators.set(author, (creators.get(author) ?? 0) + 1);
      });
    });
    return Array.from(creators.entries()).sort((a, b) => b[1] - a[1]);
  }, [results, allAvailableCreators]);

  const availableSubjects = useMemo(() => {
    if (results.length === 0) return allAvailableSubjects;
    
    const subjects = new Map<string, number>();
    results.forEach((result) => {
      result.tags.forEach((tag) => {
        subjects.set(tag, (subjects.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(subjects.entries()).sort((a, b) => b[1] - a[1]);
  }, [results, allAvailableSubjects]);

  const availablePeriodicals = useMemo(() => {
    if (results.length === 0) {
      const periodicals = new Map<string, number>();
      recordsList.forEach((record) => {
        periodicals.set(record.publication, (periodicals.get(record.publication) ?? 0) + 1);
      });
      return Array.from(periodicals.entries()).sort((a, b) => b[1] - a[1]);
    }
    
    const periodicals = new Map<string, number>();
    results.forEach((result) => {
      periodicals.set(result.publication, (periodicals.get(result.publication) ?? 0) + 1);
    });
    return Array.from(periodicals.entries()).sort((a, b) => b[1] - a[1]);
  }, [results, recordsList]);

  const availableYears = useMemo(() => {
    if (results.length === 0) {
      const years = new Map<string, number>();
      recordsList.forEach((record) => {
        const year = record.publishedAt.substring(0, 4);
        years.set(year, (years.get(year) ?? 0) + 1);
      });
      return Array.from(years.entries())
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
    }
    
    const years = new Map<string, number>();
    results.forEach((result) => {
      const year = result.publishedAt.substring(0, 4);
      years.set(year, (years.get(year) ?? 0) + 1);
    });
    return Array.from(years.entries())
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
  }, [results, recordsList]);

  const filteredResults = useMemo(() => {
    if (selectedCreators.size === 0 && selectedSubjects.size === 0 && selectedPeriodicals.size === 0 && selectedYears.size === 0 && !selectedIssue) {
      return results;
    }

    return results.filter((result) => {
      const matchesCreator =
        selectedCreators.size === 0 ||
        result.authors.some((author) => selectedCreators.has(author));

      const matchesSubject =
        selectedSubjects.size === 0 ||
        result.tags.some((tag) => selectedSubjects.has(tag));

      const matchesPeriodical =
        selectedPeriodicals.size === 0 ||
        selectedPeriodicals.has(result.publication);

      const matchesYear =
        selectedYears.size === 0 ||
        selectedYears.has(result.publishedAt.substring(0, 4));

      const matchesIssue =
        !selectedIssue ||
        result.issue === selectedIssue;

      return matchesCreator && matchesSubject && matchesPeriodical && matchesYear && matchesIssue;
    });
  }, [results, selectedCreators, selectedSubjects, selectedPeriodicals, selectedYears, selectedIssue]);

  const groupedResults = useMemo(() => {
    const groups = new Map<string, Map<string, SearchResult[]>>();

    filteredResults.forEach((result) => {
      const pub = result.publication;
      const issue = result.issue;

      if (!groups.has(pub)) {
        groups.set(pub, new Map());
      }

      const issueMap = groups.get(pub)!;
      if (!issueMap.has(issue)) {
        issueMap.set(issue, []);
      }

      issueMap.get(issue)!.push(result);
    });

    return Array.from(groups.entries())
      .sort(([pubA], [pubB]) => pubA.localeCompare(pubB))
      .map(([publication, issueMap]) => ({
        publication,
        issues: Array.from(issueMap.entries())
          .sort(([issueA], [issueB]) => issueB.localeCompare(issueA))
          .map(([issue, articles]) => ({ issue, articles })),
      }));
  }, [filteredResults]);

  const filteredPublications = useMemo(() => {
    const q = publicationQuery.trim().toLowerCase();
    if (!q) return publicationList;
    return publicationList.filter((publication) => publication.toLowerCase().includes(q));
  }, [publicationList, publicationQuery]);

  const totalPublicationPages = Math.max(1, Math.ceil(filteredPublications.length / publicationRowsPerPage));
  const clampedPublicationPage = Math.min(publicationPage, totalPublicationPages);
  const publicationStart = (clampedPublicationPage - 1) * publicationRowsPerPage;
  const visiblePublications = filteredPublications.slice(
    publicationStart,
    publicationStart + publicationRowsPerPage,
  );

  async function handleIndex(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    try {
      const parsed = JSON.parse(recordsJson) as PeriodicalRecord[];
      const response = await fetch("/api/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: parsed }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        records?: number;
        uniqueTerms?: number;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Indexing failed.");
      }

      setIndexStats({
        message: `Indexed ${data.records ?? 0} periodicals with ${data.uniqueTerms ?? 0} unique terms.`,
        tone: "success",
      });
      try {
        const parsed = JSON.parse(recordsJson) as PeriodicalRecord[];
        setRecordsList(parsed);
        setAllRecordsList(parsed);
      } catch {}

    } catch (error) {
      setIndexStats({
        message: error instanceof Error ? error.message : "Unable to index the dataset.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function runSearch(searchQuery: string) {
    setBusy(true);

    try {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      params.set("field", searchField);
      params.set("mode", searchMode);
      
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = (await response.json()) as {
        ok: boolean;
        results?: SearchResult[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Search failed.");
      }

      const normalizedResults = (data.results ?? []).map((r: SearchResult) => ({
        ...r,
        holdings: r.holdings ?? "",
        digitalCopyLink: r.digitalCopyLink ?? "",
        indexedAt: r.indexedAt ?? "",
        score: r.score ?? 0,
        matchedTerms: r.matchedTerms ?? [],
      }));

      setResults(normalizedResults as SearchResult[]);
      setSearchStats({
        message:
          searchQuery && normalizedResults && normalizedResults.length > 0
            ? `Found ${normalizedResults.length} matching periodicals for "${searchQuery}".`
            : `${searchQuery ? `No indexed matches found for "${searchQuery}".` : "Search index is ready. Use filters or enter keywords."}`,
        tone: normalizedResults && normalizedResults.length > 0 ? "success" : "neutral",
      });
      setRecordsList(normalizedResults);
    } catch (error) {
      setSearchStats({
        message: error instanceof Error ? error.message : "Unable to search the index.",
        tone: "error",
      });
      setResults([]);
    } finally {
      setBusy(false);
    }
  }

  async function fetchAutocompleteSuggestions(prefix: string) {
    if (!prefix.trim()) {
      setAutocompleteSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(prefix)}`);
      const data = (await response.json()) as {
        ok: boolean;
        suggestions?: string[];
      };

      if (data.ok) {
        setAutocompleteSuggestions(data.suggestions ?? []);
      }
    } catch (error) {
      setAutocompleteSuggestions([]);
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowAutocompleteSuggestions(false);
    await runSearch(query);
  }

  async function handleIssueClick(publication: string, issue: string) {
    setQuery("");
    setSelectedCreators(new Set());
    setSelectedSubjects(new Set());
    setSelectedPeriodicals(new Set([publication]));
    setSelectedYears(new Set());
    setSelectedIssue(issue);
    setSearchField("any");
    setSearchMode("rootword");
    setSelectedRecord(null);
    setShowPublicationsModal(false);
    setShowSearchModal(true);
    setTimeout(() => {
      runSearch("");
    }, 0);
  }

  function handleViewRecordDetails(record: PeriodicalRecord) {
    const normalized: PeriodicalRecord = {
      id: record.id,
      title: record.title,
      publication: record.publication,
      issue: record.issue,
      publishedAt: record.publishedAt,
      authors: record.authors || [],
      summary: record.summary,
      tags: record.tags || [],
      content: record.content,
      indexedAt: record.indexedAt || new Date().toISOString(),
      holdings: record.holdings || "",
      digitalCopyLink: record.digitalCopyLink || "",
    };
    setSelectedRecord(normalized);
    setShowSearchModal(false);
    setShowPublicationsModal(false);
  }

  function handleDeleteRecord(id: string) {
    setRecordToDelete(id);
    setShowDeleteConfirm(true);
  }

  async function confirmDelete() {
    if (!recordToDelete) return;
    
    try {
      const response = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recordToDelete }),
      });

      if (!response.ok) throw new Error("Delete failed");

      setRecordsList((prev) => prev.filter((r) => r.id !== recordToDelete));
      setAllRecordsList((prev) => prev.filter((r) => r.id !== recordToDelete));
      setSelectedRecord(null);
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
      alert("Record deleted successfully");
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : "Delete failed"));
      setShowDeleteConfirm(false);
    }
  }

  function handleSaveRecord(id: string, updates: Partial<PeriodicalRecord>) {
    setEditToConfirm(updates);
    setShowEditConfirm(true);
  }

  async function confirmEdit() {
    if (!editToConfirm || !selectedRecord) return;
    
    try {
      const response = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedRecord.id, updates: editToConfirm }),
      });

      if (!response.ok) throw new Error("Update failed");

      const updated: PeriodicalRecord = { ...selectedRecord, ...editToConfirm };
      
      setRecordsList((prev) =>
        prev.map((r) => r.id === selectedRecord.id ? updated : r)
      );
      setAllRecordsList((prev) =>
        prev.map((r) => r.id === selectedRecord.id ? updated : r)
      );
      
      try {
        const parsed = JSON.parse(recordsJson) as PeriodicalRecord[];
        const updatedJson = parsed.map((r) => r.id === selectedRecord.id ? updated : r);
        setRecordsJson(JSON.stringify(updatedJson, null, 2));
      } catch {
        // If JSON parsing fails, skip updating recordsJson
      }
      
      setSelectedRecord(updated);
      
      setShowEditModal(false);
      setShowEditConfirm(false);
      setEditingRecord(null);
      setEditToConfirm(null);
      
      alert("Record updated successfully");
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : "Update failed"));
      setShowEditConfirm(false);
    }
  }

  function handleCloseSearchModal() {
    setShowSearchModal(false);
    setQuery("");
    setResults([]);
    setRecordsList(samplePeriodicals);
    setSearchStats({ message: "Search the index after loading sample data.", tone: "neutral" });
    setSelectedCreators(new Set());
    setSelectedSubjects(new Set());
    setSelectedPeriodicals(new Set());
    setSelectedYears(new Set());
    setSelectedIssue(null);
    setSearchField("any");
    setSearchMode("rootword");
    setAutocompleteSuggestions([]);
    setShowAutocompleteSuggestions(false);
  }

  async function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    try {
      const record: PeriodicalRecord = {
        id: `doc-${Date.now()}`,
        title: manualForm.title.trim(),
        authors: manualForm.authors.split(",").map(a => a.trim()).filter(Boolean),
        publication: manualForm.publication.trim(),
        issue: manualForm.issue.trim(),
        publishedAt: manualForm.publishedAt.trim(),
        summary: manualForm.summary.trim(),
        tags: manualForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        indexedAt: new Date().toISOString(),
        holdings: manualForm.holdings.trim() || "",
        digitalCopyLink: manualForm.digitalCopyLink.trim() || "",
      };

      const response = await fetch("/api/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: [record] }),
      });

      const data = (await response.json()) as { ok?: boolean; uniqueTerms?: number; message?: string };
      if (!response.ok) throw new Error(data.message ?? "Failed to create record");

      setIndexStats({
        message: `Added "${record.title}" to the index.`,
        tone: "success",
      });

      setRecordsList(prev => [...prev, record]);
      setAllRecordsList(prev => [...prev, record]);
      setSelectedRecord(record);

      try {
        const existing = JSON.parse(recordsJson) as PeriodicalRecord[];
        setRecordsJson(JSON.stringify([...existing, record], null, 2));
      } catch {
        setRecordsJson(JSON.stringify([record], null, 2));
      }

      setManualForm({
        title: "",
        authors: "",
        publication: "",
        issue: "",
        publishedAt: new Date().toISOString().split('T')[0],
        summary: "",
        tags: "",
        holdings: "",
        digitalCopyLink: "",
      });
    } catch (error) {
      setIndexStats({
        message: error instanceof Error ? error.message : "Failed to create record",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Record Details View */}
      {selectedRecord && (
        <div className="min-h-screen bg-white">
          <header className="border-b border-gray-900 bg-gray-900 shadow-sm">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-gray-300">
                    The Online Philippine Periodical Index
                  </p>
                  <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
                    TOPPI
                  </h1>
                </div>
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleGoHome}
                    className="text-lg font-semibold text-gray-100 transition hover:text-white hover:underline"
                  >
                    Home
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleOpenPublicationsModal}
                      className="rounded-lg border border-gray-600 bg-gray-800 px-6 py-3 font-bold text-gray-100 transition hover:bg-gray-700"
                    >
                      Publications
                    </button>
                    <button
                      onClick={handleOpenImportModal}
                      className="rounded-lg border border-gray-600 bg-gray-800 px-6 py-3 font-bold text-gray-100 transition hover:bg-gray-700"
                    >
                      Import Data
                    </button>
                    <button
                      onClick={handleOpenSearchModal}
                      className="rounded-lg border border-gray-600 bg-gray-800 px-6 py-3 font-bold text-gray-100 transition hover:bg-gray-700"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="mb-6 flex items-center justify-center gap-6">
                <button
                  onClick={handlePreviousRecord}
                  disabled={!canGoPrevious}
                  className="text-base font-semibold text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2">
                  <span className="text-sm font-semibold text-gray-600">Record</span>
                  <input
                    type="number"
                    min="1"
                    max={recordsList.length}
                    value={jumpInput || (recordIndex >= 0 ? recordIndex + 1 : recordsList.length)}
                    onChange={(e) => setJumpInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && jumpInput) {
                        handleJumpToRecord(parseInt(jumpInput));
                      }
                    }}
                    onBlur={() => {
                      if (jumpInput) {
                        handleJumpToRecord(parseInt(jumpInput));
                      } else {
                        setJumpInput("");
                      }
                    }}
                    className="w-14 rounded border border-gray-300 bg-white px-2 py-1 text-center text-base font-semibold text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                  />
                  <span className="text-sm font-semibold text-gray-600">of {recordsList.length}</span>
                </div>
                <button
                  onClick={handleNextRecord}
                  disabled={!canGoNext}
                  className="text-base font-semibold text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-gray-900 flex-1">{selectedRecord.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const recordToEdit = {
                        ...selectedRecord,
                        holdings: selectedRecord?.holdings ?? "",
                        digitalCopyLink: selectedRecord?.digitalCopyLink ?? "",
                      };
                      setEditingRecord(recordToEdit);
                      setShowEditModal(true);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xl font-semibold text-gray-700 transition hover:bg-gray-100"
                    title="Edit Record"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(selectedRecord.id)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xl font-semibold text-gray-700 transition hover:bg-gray-100"
                    title="Delete Record"
                  >
                    🗑
                  </button>
                </div>
              </div>
              
              <table className="w-full mb-6">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-600 uppercase w-1/4">Creator</td>
                    <td className="py-3 text-gray-900">
                      {selectedRecord.authors.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedRecord.authors.map((author) => (
                            <a
                              key={author}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setQuery("");
                                setSelectedCreators(new Set([author]));
                                setSelectedSubjects(new Set());
                                setSelectedPeriodicals(new Set());
                                setSelectedYears(new Set());
                                setSelectedIssue(null);
                                setSearchField("any");
                                setSearchMode("rootword");
                                setSelectedRecord(null);
                                setShowSearchModal(true);
                                setTimeout(() => runSearch(""), 0);
                              }}
                              className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                            >
                              {author}
                            </a>
                          ))}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-600 uppercase">Periodical</td>
                    <td className="py-3 text-gray-900">{selectedRecord.publication}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-600 uppercase">Volume/Issue</td>
                    <td className="py-3 text-gray-900">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setQuery("");
                          setSelectedCreators(new Set());
                          setSelectedSubjects(new Set());
                          setSelectedPeriodicals(new Set([selectedRecord.publication]));
                          setSelectedYears(new Set());
                          setSelectedIssue(selectedRecord.issue);
                          setSearchField("any");
                          setSearchMode("rootword");
                          setSelectedRecord(null);
                          setShowSearchModal(true);
                          setTimeout(() => runSearch(""), 0);
                        }}
                        className="text-gray-600 hover:underline"
                      >
                        {selectedRecord.issue}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-600 uppercase">Issue Date</td>
                    <td className="py-3 text-gray-900">{selectedRecord.publishedAt}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-600 uppercase">Subject</td>
                    <td className="py-3 text-gray-900">
                      {selectedRecord.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedRecord.tags.map((tag) => (
                            <a
                              key={tag}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setQuery("");
                                setSelectedCreators(new Set());
                                setSelectedSubjects(new Set([tag]));
                                setSelectedPeriodicals(new Set());
                                setSelectedYears(new Set());
                                setSelectedIssue(null);
                                setSearchField("any");
                                setSearchMode("rootword");
                                setSelectedRecord(null);
                                setShowSearchModal(true);
                                setTimeout(() => runSearch(""), 0);
                              }}
                              className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                            >
                              #{tag}
                            </a>
                          ))}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-600 uppercase">Holdings</td>
                    <td className="py-3 text-gray-900">{selectedRecord.holdings ?? "N/A"}</td>
                  </tr>
                  {selectedRecord.digitalCopyLink && (
                    <tr>
                      <td className="py-3 pr-4 text-sm font-semibold text-gray-600 uppercase">Digital Copy</td>
                      <td className="py-3 text-gray-900">
                        <a 
                          href={selectedRecord.digitalCopyLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:underline"
                        >
                          Open Link →
                        </a>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="border-t border-gray-200 pt-6">
                <p className="mb-3 text-sm font-semibold text-gray-600 uppercase">Summary</p>
                <p className="text-base leading-relaxed text-gray-700">{selectedRecord.summary}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main UI */}
      {!selectedRecord && (
        <>
          <header className="border-b border-gray-900 bg-gray-900 shadow-sm">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-gray-300">
                    The Online Philippine Periodical Index
                  </p>
                  <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
                    TOPPI
                  </h1>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleOpenPublicationsModal}
                    className="rounded-lg border border-gray-600 bg-gray-800 px-6 py-3 font-bold text-gray-100 transition hover:bg-gray-700"
                  >
                    Publications
                  </button>
                  <button
                    onClick={handleOpenImportModal}
                    className="rounded-lg border border-gray-600 bg-gray-800 px-6 py-3 font-bold text-gray-100 transition hover:bg-gray-700"
                  >
                    Import Data
                  </button>
                  <button
                    onClick={handleOpenSearchModal}
                    className="rounded-lg border border-gray-600 bg-gray-800 px-6 py-3 font-bold text-gray-100 transition hover:bg-gray-700"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </header>

          <section className="px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 max-w-3xl">
                <h2 className="mb-4 text-3xl font-bold text-gray-900">
                  What is TOPPI?
                </h2>
                <p className="text-lg leading-relaxed text-gray-700">
                  TOPPI (The Online Philippine Periodical Index) is an Online indexing system that lets you upload periodicals data, search by title, publication, topic, author, or keywords. 
                  
                  Click "Import Data" to get started.
                </p>
              </div>

              <div>
                <h3 className="mb-6 text-2xl font-bold text-gray-900">Latest Added to Index</h3>
                <div className="grid gap-4">
                  {allRecordsList
                    .filter(item => item.indexedAt) // Only show items with indexedAt
                    .sort((a, b) => {
                      const dateA = new Date(a.indexedAt || new Date()).getTime();
                      const dateB = new Date(b.indexedAt || new Date()).getTime();
                      return dateB - dateA; // Most recent first
                    })
                    .slice(0, 5)
                    .map((item) => {
                      // Use indexedAt (when added to index)
                      const dateObj = new Date(item.indexedAt || new Date());
                      const formattedDate = dateObj.toLocaleDateString("en-US", { 
                        year: "numeric", 
                        month: "short", 
                        day: "numeric" 
                      });
                      const formattedTime = dateObj.toLocaleTimeString("en-US", { 
                        hour: "2-digit", 
                        minute: "2-digit",
                        hour12: true
                      });

                      return (
                        <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-5 transition hover:shadow-sm cursor-pointer" onClick={() => handleViewRecordDetails(item)}>
                          <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                              <p className="mt-1 text-base text-gray-700">
                                <span className="font-semibold">{item.publication}</span>
                                {" · "}
                                {item.issue}
                              </p>
                            </div>
                            <div className="text-right text-sm text-gray-600 whitespace-nowrap">
                              <div className="font-semibold text-gray-800">{formattedDate}</div>
                              <div className="text-xs text-gray-500">{formattedTime}</div>
                            </div>
                          </div>
                          <p className="mb-4 text-base leading-relaxed text-gray-700">{item.summary}</p>
                          <div className="flex flex-wrap gap-2">
                            {item.authors.map((author) => (
                              <span
                                key={author}
                                className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-800"
                              >
                                {author}
                              </span>
                            ))}
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </article>
                      );
                    })}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Import Data</h2>
              <button
                onClick={handleCloseImportModal}
                className="text-gray-500 transition hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className={`mb-6 rounded-lg border px-6 py-4 text-base font-medium ${statsToneClasses[indexStats.tone]}`}>
              {indexStats.message}
            </div>

            {/* Mode Tabs */}
            <div className="mb-6 flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setImportMode("manual")}
                className={`px-4 py-3 font-bold text-base transition ${
                  importMode === "manual"
                    ? "border-b-2 border-gray-700 text-gray-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setImportMode("csv")}
                className={`px-4 py-3 font-bold text-base transition ${
                  importMode === "csv"
                    ? "border-b-2 border-gray-700 text-gray-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                CSV Upload
              </button>
            </div>

            {importMode === "manual" && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-900">Title *</label>
                  <input
                    type="text"
                    value={manualForm.title}
                    onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                    placeholder="e.g., Machine Learning in Healthcare"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-900">Author(s)</label>
                  <input
                    type="text"
                    value={manualForm.authors}
                    onChange={(e) => setManualForm({ ...manualForm, authors: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                    placeholder="e.g., John Doe, Jane Smith (comma-separated)"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-900">Publication *</label>
                  <input
                    type="text"
                    value={manualForm.publication}
                    onChange={(e) => setManualForm({ ...manualForm, publication: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                    placeholder="e.g., Philippine Journal of Medicine"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-900">Issue</label>
                    <input
                      type="text"
                      value={manualForm.issue}
                      onChange={(e) => setManualForm({ ...manualForm, issue: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                      placeholder="e.g., Vol. 10, No. 2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-900">Published Date</label>
                    <input
                      type="date"
                      value={manualForm.publishedAt}
                      onChange={(e) => setManualForm({ ...manualForm, publishedAt: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-900">Summary</label>
                  <textarea
                    value={manualForm.summary}
                    onChange={(e) => setManualForm({ ...manualForm, summary: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                    placeholder="Brief description of the periodical"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-900">Holdings</label>
                  <input
                    type="text"
                    value={manualForm.holdings}
                    onChange={(e) => setManualForm({ ...manualForm, holdings: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                    placeholder="e.g., University of the Philippines Diliman"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-900">Digital Copy Link</label>
                  <input
                    type="url"
                    value={manualForm.digitalCopyLink}
                    onChange={(e) => setManualForm({ ...manualForm, digitalCopyLink: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                    placeholder="e.g., https://example.com/article.pdf"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 rounded-lg bg-gray-600 px-6 py-3 text-base font-bold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "Adding..." : "Add to Index"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseImportModal}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-bold text-gray-900 transition hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </form>
            )}

            {importMode === "csv" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-3 block text-base font-bold text-gray-900">
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={busy}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 file:mr-3 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    CSV format: title, author, publication, issue, year, summary, tags
                  </p>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="block text-base font-bold text-gray-900">
                      JSON Records
                    </label>
                    <button
                      type="button"
                      onClick={() => setRecordsJson(sampleJson)}
                      className="text-sm font-semibold text-gray-600 hover:text-gray-700"
                    >
                      Load Sample
                    </button>
                  </div>
                  <textarea
                    value={recordsJson}
                    onChange={(event) => setRecordsJson(event.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                    rows={10}
                  />
                </div>

                <form onSubmit={handleIndex} className="flex gap-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 rounded-lg bg-gray-600 px-6 py-3 text-base font-bold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "Indexing..." : "Index Records in Redis"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseImportModal}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-bold text-gray-900 transition hover:bg-gray-50"
                  >
                    Close
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publications Modal */}
      {showPublicationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Periodicals and Issues</h2>
                <button
                  onClick={handleClosePublicationsModal}
                  className="rounded border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <div className="flex items-center justify-end gap-3">
                <label className="text-base font-semibold text-gray-900">Search:</label>
                <input
                  value={publicationQuery}
                  onChange={(event) => {
                    setPublicationQuery(event.target.value);
                    setPublicationPage(1);
                  }}
                  className="w-full max-w-sm rounded border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                />
              </div>
            </div>

            <div>
              {visiblePublications.map((publication, index) => {
                const isExpanded = expandedPublication === publication;
                const details = publicationDetails.get(publication);

                return (
                  <div key={`${publication}-${publicationStart + index}`}>
                    <button
                      onClick={() => setExpandedPublication(isExpanded ? null : publication)}
                      className={`flex w-full items-center gap-3 border-b border-gray-200 px-6 py-3 text-left text-base font-semibold text-gray-900 ${
                        (publicationStart + index) % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <span className="text-gray-600">{isExpanded ? "▼" : "▶"}</span>
                      <span>{publication}</span>
                    </button>

                    {isExpanded && details && (
                      <div className="border-b border-gray-200 bg-gray-50 p-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                            <div className="overflow-hidden rounded border border-gray-200">
                              <div className="grid grid-cols-[150px_1fr] border-b border-gray-200 bg-gray-100">
                                <div className="border-r border-gray-200 px-3 py-2 text-right text-sm font-bold text-gray-700">
                                  Title
                                </div>
                                <div className="px-3 py-2 text-base text-gray-900">{publication}</div>
                              </div>
                              <div className="grid grid-cols-[150px_1fr] border-b border-gray-200 bg-gray-100">
                                <div className="border-r border-gray-200 px-3 py-2 text-right text-sm font-bold text-gray-700">
                                  Publication type
                                </div>
                                <div className="px-3 py-2 text-base text-gray-900">{details.publicationType}</div>
                              </div>
                              <div className="grid grid-cols-[150px_1fr] bg-gray-100">
                                <div className="border-r border-gray-200 px-3 py-2 text-right text-sm font-bold text-gray-700">
                                  Frequency
                                </div>
                                <div className="px-3 py-2 text-base text-gray-900">{details.frequency}</div>
                              </div>
                            </div>

                            <div className="overflow-hidden rounded border border-gray-200">
                              <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 text-center text-sm font-bold text-gray-700">
                                All Issues
                              </div>
                              <div>
                                {details.issues.length > 0 ? (
                                  (() => {
                                    const groupedByYear = new Map<string, Array<{ issue: string; count: number }>>();
                                    details.issues.forEach(({ year, issue, count }) => {
                                      if (!groupedByYear.has(year)) {
                                        groupedByYear.set(year, []);
                                      }
                                      groupedByYear.get(year)!.push({ issue, count });
                                    });
                                    
                                    return Array.from(groupedByYear.entries())
                                      .sort((a, b) => b[0].localeCompare(a[0]))
                                      .map(([year, issues]) => (
                                        <div key={year}>
                                          <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600">
                                            {year}
                                          </div>
                                          {issues.map(({ issue, count }) => (
                                            <a
                                              key={`${publication}-${issue}`}
                                              href="#"
                                              onClick={(event) => {
                                                event.preventDefault();
                                                void handleIssueClick(publication, issue);
                                              }}
                                              className="block border-b border-gray-200 bg-white px-6 py-2 text-sm text-gray-600 underline underline-offset-1 transition hover:bg-gray-50 last:border-b-0"
                                            >
                                              ▶ {issue}
                                              <span className="ml-2 text-xs text-gray-600 no-underline">
                                                ({count} {count === 1 ? "article" : "articles"})
                                              </span>
                                            </a>
                                          ))}
                                        </div>
                                      ));
                                  })()
                                ) : (
                                  <div className="bg-white px-4 py-3 text-base text-gray-600">No issues available</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {visiblePublications.length === 0 && (
                <div className="px-6 py-10 text-center text-lg text-gray-600">No publications found.</div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-6 py-3">
              <div className="flex items-center gap-3 text-base text-gray-900">
                <span className="font-semibold">Display</span>
                <select
                  value={publicationRowsPerPage}
                  onChange={(event) => {
                    setPublicationRowsPerPage(Number(event.target.value));
                    setPublicationPage(1);
                  }}
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>rows</span>
              </div>

              <div className="flex items-center gap-2 text-base font-semibold">
                <button
                  onClick={() => setPublicationPage(1)}
                  disabled={clampedPublicationPage === 1}
                  className="rounded border border-gray-300 bg-white px-3 py-1 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => setPublicationPage((page) => Math.max(1, page - 1))}
                  disabled={clampedPublicationPage === 1}
                  className="rounded border border-gray-300 bg-white px-3 py-1 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="rounded border border-gray-300 bg-white px-3 py-1 text-gray-800">
                  {clampedPublicationPage}
                </span>
                <button
                  onClick={() => setPublicationPage((page) => Math.min(totalPublicationPages, page + 1))}
                  disabled={clampedPublicationPage === totalPublicationPages}
                  className="rounded border border-gray-300 bg-white px-3 py-1 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => setPublicationPage(totalPublicationPages)}
                  disabled={clampedPublicationPage === totalPublicationPages}
                  className="rounded border border-gray-300 bg-white px-3 py-1 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>

            <div className="px-6 py-3 text-base text-gray-700">
              Showing {filteredPublications.length === 0 ? 0 : publicationStart + 1} to{" "}
              {Math.min(publicationStart + publicationRowsPerPage, filteredPublications.length)} of{" "}
              {filteredPublications.length} rows
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-[100]">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Delete Record?</h2>
            <p className="mb-6 text-base text-gray-700">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRecordToDelete(null);
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-bold text-gray-900 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {showEditConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-[100]">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Confirm Changes?</h2>
            <p className="mb-6 text-base text-gray-700">
              Are you sure you want to save these changes to the record?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmEdit}
                className="flex-1 rounded-lg bg-gray-600 px-4 py-3 font-bold text-white transition hover:bg-gray-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditConfirm(false);
                  setEditToConfirm(null);
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-bold text-gray-900 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRecord && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Edit Record</h2>
            <form onSubmit={(e: any) => {
              e.preventDefault();
              const record = selectedRecord as PeriodicalRecord | null;
              const edits = editingRecord as Partial<PeriodicalRecord> | null;
              if (record && edits) {
                handleSaveRecord(record.id, edits);
              }
            }} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">Title</label>
                <input type="text" value={editingRecord.title || ""} onChange={(e) => setEditingRecord({...editingRecord, title: e.target.value})} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">Authors</label>
                <input type="text" value={editingRecord.authors?.join(", ") || ""} onChange={(e) => setEditingRecord({...editingRecord, authors: e.target.value.split(",").map(a => a.trim())})} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20" placeholder="comma-separated" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">Publication</label>
                <input type="text" value={editingRecord.publication || ""} onChange={(e) => setEditingRecord({...editingRecord, publication: e.target.value})} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">Issue</label>
                <input type="text" value={editingRecord.issue || ""} onChange={(e) => setEditingRecord({...editingRecord, issue: e.target.value})} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">Published Date</label>
                <input type="date" value={editingRecord.publishedAt || ""} onChange={(e) => setEditingRecord({...editingRecord, publishedAt: e.target.value})} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">Summary</label>
                <textarea value={editingRecord.summary || ""} onChange={(e) => setEditingRecord({...editingRecord, summary: e.target.value})} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20" rows={3} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">Tags</label>
                <input type="text" value={editingRecord.tags?.join(", ") || ""} onChange={(e) => setEditingRecord({...editingRecord, tags: e.target.value.split(",").map(t => t.trim())})} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20" placeholder="comma-separated" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">Holdings</label>
                <input type="text" value={editingRecord.holdings || ""} onChange={(e) => setEditingRecord({...editingRecord, holdings: e.target.value})} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">Digital Copy Link</label>
                <input type="url" value={editingRecord.digitalCopyLink || ""} onChange={(e) => setEditingRecord({...editingRecord, digitalCopyLink: e.target.value})} className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 rounded-lg bg-gray-600 px-6 py-3 text-base font-bold text-white transition hover:bg-gray-700">Save Changes</button>
                <button type="button" onClick={() => {setShowEditModal(false); setEditingRecord(null);}} className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-bold text-gray-900 transition hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Search Index</h2>
              <button
                onClick={handleCloseSearchModal}
                className="text-gray-500 transition hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearch} className="mb-8 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-base font-bold text-gray-900">
                    Enter your search query
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setShowAutocompleteSuggestions(false);
                      setAutocompleteSuggestions([]);
                      setSelectedIssue(null);
                      setSelectedPeriodicals(new Set());
                      setTimeout(() => runSearch(""), 0);
                    }}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-700 hover:underline"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex gap-2">
                  <select
                    value={searchField}
                    onChange={(event) => setSearchField(event.target.value as typeof searchField)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                  >
                    <option value="any">Any</option>
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="subject">Subject</option>
                    <option value="abstract">Abstract</option>
                    <option value="fulltext">Fulltext</option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);

                        if (event.target.value.trim()) {
                          setShowAutocompleteSuggestions(true);
                          fetchAutocompleteSuggestions(event.target.value);
                        } else {
                          setShowAutocompleteSuggestions(false);
                          setAutocompleteSuggestions([]);
                        }
                      }}
                      onFocus={() => {
                        if (query.trim() && autocompleteSuggestions.length > 0) {
                          setShowAutocompleteSuggestions(true);
                        }
                      }}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                      placeholder="e.g., machine learning, education, health..."
                    />

                    {showAutocompleteSuggestions && autocompleteSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-gray-300 bg-white shadow-lg">
                        {autocompleteSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setQuery(suggestion);
                              setShowAutocompleteSuggestions(false);
                            }}
                            className="block w-full px-4 py-3 text-left text-base text-gray-900 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="block text-base font-bold text-gray-900">
                    Search Mode
                  </label>

                  <div className="flex gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="searchMode"
                        value="all"
                        checked={searchMode === "all"}
                        onChange={(e) => setSearchMode(e.target.value as typeof searchMode)}
                        className="h-4 w-4 border-gray-300 accent-gray-600 focus:ring-gray-400"
                      />
                      <span className="text-gray-700">All the Words</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="searchMode"
                        value="phrase"
                        checked={searchMode === "phrase"}
                        onChange={(e) => setSearchMode(e.target.value as typeof searchMode)}
                        className="h-4 w-4 border-gray-300 accent-gray-600 focus:ring-gray-400"
                      />
                      <span className="text-gray-700">As Phrase</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="searchMode"
                        value="rootword"
                        checked={searchMode === "rootword"}
                        onChange={(e) => setSearchMode(e.target.value as typeof searchMode)}
                        className="h-4 w-4 border-gray-300 accent-gray-600 focus:ring-gray-400"
                      />
                      <span className="text-gray-700">As Rootword</span>
                    </label>
                  </div>
                </div>

                {query && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Searching in:</span>

                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800">
                      {searchField.charAt(0).toUpperCase() + searchField.slice(1)}
                    </span>
                  </div>
                )}
              </div>

              <div className={`rounded-lg border px-6 py-4 text-base font-medium ${statsToneClasses[searchStats.tone]}`}>
                {searchStats.message}
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-gray-600 px-6 py-3 text-base font-bold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Search
              </button>
            </form>

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 font-bold text-gray-900">Filter by Creator</h3>
                  {availableCreators.length > 0 ? (
                    <div className="space-y-2">
                      {availableCreators
                        .slice(0, expandedFilters.creators ? availableCreators.length : 5)
                        .map(([creator, count]) => (
                          <label
                            key={creator}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCreators.has(creator)}
                              onChange={(e) => {
                                const newCreators = new Set(selectedCreators);

                                if (e.target.checked) {
                                  newCreators.add(creator);
                                } else {
                                  newCreators.delete(creator);
                                }

                                setSelectedCreators(newCreators);

                                if (!query.trim()) {
                                  runSearch("");
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 accent-gray-400"
                            />

                            <span className="flex-1 text-gray-700">{creator}</span>

                            <span className="text-xs text-gray-500">
                              ({count})
                            </span>
                          </label>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No creators found</p>
                  )}

                  {availableCreators.length > 5 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFilters((prev) => ({
                          ...prev,
                          creators: !prev.creators,
                        }))
                      }
                      className="mt-3 text-xs font-semibold text-gray-600 hover:text-gray-700"
                    >
                      {expandedFilters.creators ? "See Less" : "See More"}
                    </button>
                  )}

                  {selectedCreators.size > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCreators(new Set());

                        if (!query.trim()) {
                          runSearch("");
                        }
                      }}
                      className="mt-3 text-xs font-semibold text-gray-600 hover:text-gray-700"
                    >
                      Clear Creator Filter
                    </button>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 font-bold text-gray-900">Filter by Subject</h3>
                  {availableSubjects.length > 0 ? (
                    <div className="space-y-2">
                      {availableSubjects.slice(0, expandedFilters.subjects ? undefined : 5).map(([subject, count]) => (
                        <label key={subject} className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedSubjects.has(subject)}
                            onChange={(e) => {
                              const newSubjects = new Set(selectedSubjects);
                              if (e.target.checked) {
                                newSubjects.add(subject);
                              } else {
                                newSubjects.delete(subject);
                              }
                              setSelectedSubjects(newSubjects);
                              if (!query.trim()) {
                                runSearch("");
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 accent-gray-400"
                          />
                          <span className="flex-1 text-gray-700">{subject}</span>
                          <span className="text-xs text-gray-500">({count})</span>
                        </label>
                      ))}
                      {availableSubjects.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setExpandedFilters({...expandedFilters, subjects: !expandedFilters.subjects})}
                          className="mt-2 text-xs font-semibold text-gray-600 hover:text-gray-700"
                        >
                          {expandedFilters.subjects ? "See Less" : `See More (${availableSubjects.length - 5}+)`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No subjects found</p>
                  )}
                  {selectedSubjects.size > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubjects(new Set());
                        if (!query.trim()) {
                          runSearch("");
                        }
                      }}
                      className="mt-3 text-xs font-semibold text-gray-600 hover:text-gray-700"
                    >
                      Clear Subject Filter
                    </button>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 font-bold text-gray-900">Filter by Periodical</h3>
                  {availablePeriodicals.length > 0 ? (
                    <div className="space-y-2">
                      {availablePeriodicals.slice(0, expandedFilters.periodicals ? undefined : 5).map(([periodical, count]) => (
                        <label key={periodical} className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedPeriodicals.has(periodical)}
                            onChange={(e) => {
                              const newPeriodicals = new Set(selectedPeriodicals);
                              if (e.target.checked) {
                                newPeriodicals.add(periodical);
                              } else {
                                newPeriodicals.delete(periodical);
                              }
                              setSelectedPeriodicals(newPeriodicals);
                              if (!query.trim()) {
                                runSearch("");
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 accent-gray-400"
                          />
                          <span className="flex-1 text-gray-700">{periodical}</span>
                          <span className="text-xs text-gray-500">({count})</span>
                        </label>
                      ))}
                      {availablePeriodicals.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setExpandedFilters({...expandedFilters, periodicals: !expandedFilters.periodicals})}
                          className="mt-2 text-xs font-semibold text-gray-600 hover:text-gray-700"
                        >
                          {expandedFilters.periodicals ? "See Less" : `See More (${availablePeriodicals.length - 5}+)`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No periodicals found</p>
                  )}
                  {selectedPeriodicals.size > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPeriodicals(new Set());
                        if (!query.trim()) {
                          runSearch("");
                        }
                      }}
                      className="mt-3 text-xs font-semibold text-gray-600 hover:text-gray-700"
                    >
                      Clear Periodical Filter
                    </button>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 font-bold text-gray-900">Filter by Year</h3>
                  {availableYears.length > 0 ? (
                    <div className="space-y-2">
                      {availableYears.slice(0, expandedFilters.years ? undefined : 5).map(([year, count]) => (
                        <label key={year} className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedYears.has(year)}
                            onChange={(e) => {
                              const newYears = new Set(selectedYears);
                              if (e.target.checked) {
                                newYears.add(year);
                              } else {
                                newYears.delete(year);
                              }
                              setSelectedYears(newYears);
                              if (!query.trim()) {
                                runSearch("");
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 accent-gray-400"
                          />
                          <span className="flex-1 text-gray-700">{year}</span>
                          <span className="text-xs text-gray-500">({count})</span>
                        </label>
                      ))}
                      {availableYears.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setExpandedFilters({...expandedFilters, years: !expandedFilters.years})}
                          className="mt-2 text-xs font-semibold text-gray-600 hover:text-gray-700"
                        >
                          {expandedFilters.years ? "See Less" : `See More (${availableYears.length - 5}+)`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No years found</p>
                  )}
                  {selectedYears.size > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedYears(new Set());
                        if (!query.trim()) {
                          runSearch("");
                        }
                      }}
                      className="mt-3 text-xs font-semibold text-gray-600 hover:text-gray-700"
                    >
                      Clear Year Filter
                    </button>
                  )}
                </div>
              </div>

              {filteredResults.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                  <p className="text-base text-gray-600">
                    {results.length === 0 
                      ? "No results yet. Try searching for keywords from the indexed periodicals."
                      : "No results match the selected filters. Try adjusting your filters."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedResults.map((pubGroup) => (
                    <div key={pubGroup.publication} className="rounded-lg border border-gray-200 bg-white p-5">
                      <h3 className="mb-4 text-lg font-bold text-gray-900">{pubGroup.publication}</h3>

                      <div className="space-y-4">
                        {pubGroup.issues.map((issueGroup) => (
                          <div key={issueGroup.issue} className="ml-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <h4 className="mb-3 text-base font-semibold text-gray-800">
                              Issue: {issueGroup.issue}
                              <span className="ml-2 text-sm font-normal text-gray-600">
                                ({issueGroup.articles.length} {issueGroup.articles.length === 1 ? "article" : "articles"})
                              </span>
                            </h4>

                            <div className="space-y-3">
                              {issueGroup.articles.map((article) => (
                                <article
                                  key={article.id}
                                  className="rounded-lg border border-gray-200 bg-white p-4 cursor-pointer transition hover:bg-gray-50"
                                  onClick={() => handleViewRecordDetails(article)}
                                >
                                  <h5 className="text-base font-bold text-gray-600 hover:underline">
                                    {article.title}
                                  </h5>
                                  <p className="mt-2 text-sm text-gray-700">{article.summary}</p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {article.authors.map((author) => (
                                      <span
                                        key={author}
                                        className="rounded-full border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-800"
                                      >
                                        {author}
                                      </span>
                                    ))}
                                    {article.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-800"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                </article>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
