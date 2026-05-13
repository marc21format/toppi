export type PeriodicalRecord = {
  id: string;
  title: string;
  publication: string;
  issue: string;
  publishedAt: string;
  authors: string[];
  summary: string;
  tags: string[];
  content?: string;
  indexedAt?: string;
  holdings?: string;
  digitalCopyLink?: string;
};

export const samplePeriodicals: PeriodicalRecord[] = [
  // UPD Periodicals Review (2024-2026, 8 issues, 28 articles)
  // 2024 Issues
  {id: "ipp-001", title: "Emerging Research in Communication Studies", publication: "UPD Periodicals Review", issue: "Vol. 10, No. 1", publishedAt: "2024-01-10", authors: ["M. Santos"], summary: "Early research on communication trends.", tags: ["communication", "research"]},
  {id: "ipp-002", title: "Media Literacy Initiatives in Schools", publication: "UPD Periodicals Review", issue: "Vol. 10, No. 1", publishedAt: "2024-01-10", authors: ["A. Rivera", "C. Lopez"], summary: "Educational programs promoting media literacy.", tags: ["media", "education"]},
  {id: "ipp-003", title: "Digital Archives and Preservation", publication: "UPD Periodicals Review", issue: "Vol. 10, No. 2", publishedAt: "2024-06-15", authors: ["E. Reyes"], summary: "Strategies for digitizing periodical collections.", tags: ["digital", "archive"]},
  {id: "ipp-004", title: "Publishing Ethics and Standards", publication: "UPD Periodicals Review", issue: "Vol. 10, No. 2", publishedAt: "2024-06-15", authors: ["R. Wong", "J. Santos"], summary: "Ethical considerations in academic publishing.", tags: ["publishing", "ethics"]},
  {id: "ipp-005", title: "Global Publishing Trends", publication: "UPD Periodicals Review", issue: "Vol. 10, No. 3", publishedAt: "2024-11-20", authors: ["L. Wang"], summary: "International perspectives on scholarly publishing.", tags: ["publishing", "global"]},
  // 2025 Issues
  {id: "ipp-006", title: "Open Access Publishing Models", publication: "UPD Periodicals Review", issue: "Vol. 11, No. 1", publishedAt: "2025-01-12", authors: ["M. Santos", "T. Garcia"], summary: "Exploring open access frameworks and benefits.", tags: ["open-access", "publishing"]},
  {id: "ipp-007", title: "Indexing Strategies for Researchers", publication: "UPD Periodicals Review", issue: "Vol. 11, No. 1", publishedAt: "2025-01-12", authors: ["P. Lee"], summary: "Best practices for article indexing and discovery.", tags: ["indexing", "research"]},
  {id: "ipp-008", title: "Citation Metrics and Research Evaluation", publication: "UPD Periodicals Review", issue: "Vol. 11, No. 2", publishedAt: "2025-06-18", authors: ["S. Kim", "D. Chen"], summary: "Measuring research impact using citation analysis.", tags: ["metrics", "research"]},
  {id: "ipp-009", title: "Knowledge Management in Academia", publication: "UPD Periodicals Review", issue: "Vol. 11, No. 2", publishedAt: "2025-06-18", authors: ["B. Johnson"], summary: "Systems for organizing and sharing academic knowledge.", tags: ["knowledge", "management"]},
  {id: "ipp-010", title: "Digital Humanities Research", publication: "UPD Periodicals Review", issue: "Vol. 11, No. 3", publishedAt: "2025-11-15", authors: ["M. Nakamura", "F. Rossi"], summary: "Technology applications in humanities scholarship.", tags: ["digital", "humanities"]},
  // 2026 Issues
  {id: "ipp-011", title: "Faculty Research Highlights in Communication Studies", publication: "UPD Periodicals Review", issue: "Vol. 12, No. 1", publishedAt: "2026-01-15", authors: ["M. Santos", "A. Rivera"], summary: "Communication research and publishing trends.", tags: ["communication", "media", "research"]},
  {id: "ipp-012", title: "Digital Transformation in Publishing", publication: "UPD Periodicals Review", issue: "Vol. 12, No. 1", publishedAt: "2026-01-15", authors: ["J. Wong"], summary: "Impact of digitalization on scholarly journals.", tags: ["digital", "publishing", "technology"]},
  {id: "ipp-013", title: "Archival Practices in Collections", publication: "UPD Periodicals Review", issue: "Vol. 12, No. 1", publishedAt: "2026-01-15", authors: ["E. Reyes", "C. Santos"], summary: "Preservation and cataloging of periodicals.", tags: ["archive", "preservation", "cataloging"]},
  {id: "ipp-014", title: "Global Scholarly Communication", publication: "UPD Periodicals Review", issue: "Vol. 12, No. 2", publishedAt: "2026-02-20", authors: ["R. Nakamura"], summary: "International academic publishing perspectives.", tags: ["publishing", "global", "open-access"]},
  {id: "ipp-015", title: "Indigenous Knowledge Systems", publication: "UPD Periodicals Review", issue: "Vol. 12, No. 2", publishedAt: "2026-02-20", authors: ["M. Santos", "T. Cruz"], summary: "Documenting traditional knowledge in journals.", tags: ["indigenous", "knowledge", "research"]},
  {id: "ipp-016", title: "Citation Analysis Techniques", publication: "UPD Periodicals Review", issue: "Vol. 12, No. 3", publishedAt: "2026-03-18", authors: ["L. Wang", "P. Lee"], summary: "Measuring research impact through citations.", tags: ["research", "metrics", "impact"]},
  {id: "ipp-017", title: "Emerging Scholars Forum", publication: "UPD Periodicals Review", issue: "Vol. 12, No. 3", publishedAt: "2026-03-18", authors: ["J. Kim", "M. Ortega"], summary: "Research presentations from new academics.", tags: ["research", "scholars", "academic"]},
  {id: "ipp-018", title: "Peer Review Best Practices", publication: "UPD Periodicals Review", issue: "Vol. 12, No. 3", publishedAt: "2026-03-18", authors: ["V. Thompson"], summary: "Improving quality through rigorous peer review.", tags: ["publishing", "quality", "review"]},

  // Philippine Periodical Digest (2024-2026, 9 issues, 27 articles)
  // 2024
  {id: "ipp-019", title: "Agricultural Development Notes", publication: "Philippine Periodical Digest", issue: "Vol. 4, No. 1", publishedAt: "2024-02-05", authors: ["L. Cruz"], summary: "Tracking agricultural progress in regions.", tags: ["agriculture", "development"]},
  {id: "ipp-020", title: "Farm Management Techniques", publication: "Philippine Periodical Digest", issue: "Vol. 4, No. 1", publishedAt: "2024-02-05", authors: ["B. Santos"], summary: "Modern approaches to farm operations.", tags: ["agriculture", "management"]},
  {id: "ipp-021", title: "Crop Resilience Studies", publication: "Philippine Periodical Digest", issue: "Vol. 4, No. 2", publishedAt: "2024-05-12", authors: ["A. Fernandez"], summary: "Building resistant crop varieties.", tags: ["agriculture", "science"]},
  {id: "ipp-022", title: "Irrigation Systems", publication: "Philippine Periodical Digest", issue: "Vol. 4, No. 3", publishedAt: "2024-08-20", authors: ["M. Garcia", "D. Lopez"], summary: "Water management for agriculture.", tags: ["water", "agriculture"]},
  // 2025
  {id: "ipp-023", title: "Sustainable Farming Methods", publication: "Philippine Periodical Digest", issue: "Vol. 5, No. 1", publishedAt: "2025-01-28", authors: ["L. Cruz", "P. Reyes"], summary: "Environmental approaches to agriculture.", tags: ["agriculture", "sustainability", "environment"]},
  {id: "ipp-024", title: "Food Security Analysis", publication: "Philippine Periodical Digest", issue: "Vol. 5, No. 1", publishedAt: "2025-01-28", authors: ["C. Flores"], summary: "Assessing regional food availability.", tags: ["food security", "analysis"]},
  {id: "ipp-025", title: "Climate-Smart Agriculture", publication: "Philippine Periodical Digest", issue: "Vol. 5, No. 2", publishedAt: "2025-05-10", authors: ["M. Garcia"], summary: "Agricultural practices addressing climate change.", tags: ["agriculture", "climate", "environment"]},
  {id: "ipp-026", title: "Export Market Trends", publication: "Philippine Periodical Digest", issue: "Vol. 5, No. 3", publishedAt: "2025-09-15", authors: ["J. Santos"], summary: "Philippine agricultural export opportunities.", tags: ["agriculture", "export", "economics"]},
  // 2026
  {id: "ipp-027", title: "Agriculture and Food Security", publication: "Philippine Periodical Digest", issue: "Vol. 5, No. 4", publishedAt: "2026-02-02", authors: ["L. Cruz"], summary: "Crop resilience and food systems.", tags: ["agriculture", "food security", "science"]},
  {id: "ipp-028", title: "Sustainable Farming in Philippines", publication: "Philippine Periodical Digest", issue: "Vol. 5, No. 4", publishedAt: "2026-02-02", authors: ["B. Santos", "M. Garcia"], summary: "Sustainable agricultural innovations.", tags: ["agriculture", "sustainability", "environment"]},
  {id: "ipp-029", title: "Water Management", publication: "Philippine Periodical Digest", issue: "Vol. 5, No. 5", publishedAt: "2026-03-10", authors: ["A. Fernandez"], summary: "Irrigation and water conservation.", tags: ["water", "agriculture", "environment"]},
  {id: "ipp-030", title: "Agricultural Statistics Report", publication: "Philippine Periodical Digest", issue: "Vol. 5, No. 5", publishedAt: "2026-03-10", authors: ["L. Cruz", "D. Lopez"], summary: "Production data across provinces.", tags: ["agriculture", "statistics", "economics"]},
  {id: "ipp-031", title: "Climate Effects on Crops", publication: "Philippine Periodical Digest", issue: "Vol. 6, No. 1", publishedAt: "2026-04-05", authors: ["M. Garcia"], summary: "Climate impact and adaptation strategies.", tags: ["climate", "agriculture", "environment"]},

  // University Cultural Journal (2025-2026, 6 issues, 18 articles)
  // 2025
  {id: "ipp-032", title: "Heritage Documentation Initiative", publication: "University Cultural Journal", issue: "Vol. 7, No. 1", publishedAt: "2025-02-14", authors: ["J. Dela Torre"], summary: "Preserving cultural heritage through documentation.", tags: ["culture", "heritage", "archive"]},
  {id: "ipp-033", title: "Indigenous Art and Representation", publication: "University Cultural Journal", issue: "Vol. 7, No. 1", publishedAt: "2025-02-14", authors: ["R. Villanueva"], summary: "Contemporary indigenous artistic expressions.", tags: ["arts", "culture", "indigenous"]},
  {id: "ipp-034", title: "Museum Collections and Access", publication: "University Cultural Journal", issue: "Vol. 7, No. 2", publishedAt: "2025-07-22", authors: ["M. Reyes"], summary: "Improving public access to cultural artifacts.", tags: ["culture", "museum", "access"]},
  {id: "ipp-035", title: "Performance and Memory", publication: "University Cultural Journal", issue: "Vol. 7, No. 2", publishedAt: "2025-07-22", authors: ["K. Inoue"], summary: "Using performance to preserve cultural memory.", tags: ["culture", "performance", "memory"]},
  // 2026
  {id: "ipp-036", title: "Arts, Culture, and Archive", publication: "University Cultural Journal", issue: "Special Issue 2026", publishedAt: "2026-02-22", authors: ["J. Dela Torre"], summary: "Archive-centered cultural perspectives.", tags: ["arts", "culture", "archive"]},
  {id: "ipp-037", title: "Contemporary Philippine Visual Arts", publication: "University Cultural Journal", issue: "Special Issue 2026", publishedAt: "2026-02-22", authors: ["R. Villanueva", "A. Morales"], summary: "Current trends in visual arts.", tags: ["arts", "culture", "contemporary"]},
  {id: "ipp-038", title: "Oral Histories Documentation", publication: "University Cultural Journal", issue: "Vol. 8, No. 2", publishedAt: "2026-04-15", authors: ["J. Dela Torre", "M. Reyes"], summary: "Recording marginalized community narratives.", tags: ["culture", "history", "community"]},
  {id: "ipp-039", title: "Digital Heritage Conservation", publication: "University Cultural Journal", issue: "Vol. 8, No. 2", publishedAt: "2026-04-15", authors: ["K. Inoue"], summary: "Technology for cultural preservation.", tags: ["culture", "digital", "archive"]},

  // Campus Research Bulletin (2024-2026, 10 issues, 30 articles)
  // 2024
  {id: "ipp-040", title: "Research Frontiers Q1", publication: "Campus Research Bulletin", issue: "Vol. 8, No. 1", publishedAt: "2024-02-08", authors: ["P. Navarro"], summary: "Latest research developments in science.", tags: ["research", "science"]},
  {id: "ipp-041", title: "Laboratory Updates", publication: "Campus Research Bulletin", issue: "Vol. 8, No. 1", publishedAt: "2024-02-08", authors: ["R. Lim"], summary: "Equipment and facility improvements.", tags: ["laboratory", "research"]},
  {id: "ipp-042", title: "Data Management Practices", publication: "Campus Research Bulletin", issue: "Vol. 8, No. 2", publishedAt: "2024-05-20", authors: ["S. Kim"], summary: "Organizing and storing research data.", tags: ["data", "management"]},
  {id: "ipp-043", title: "Computational Methods", publication: "Campus Research Bulletin", issue: "Vol. 8, No. 2", publishedAt: "2024-05-20", authors: ["T. Johnson"], summary: "Advanced computing for research.", tags: ["technology", "computing"]},
  {id: "ipp-044", title: "Collaborative Research Networks", publication: "Campus Research Bulletin", issue: "Vol. 8, No. 3", publishedAt: "2024-09-10", authors: ["M. Chen"], summary: "Building research partnerships.", tags: ["research", "collaboration"]},
  // 2025
  {id: "ipp-045", title: "Emerging Technologies Review", publication: "Campus Research Bulletin", issue: "Vol. 9, No. 1", publishedAt: "2025-01-30", authors: ["R. Lim", "P. Navarro"], summary: "New technologies in research.", tags: ["technology", "innovation"]},
  {id: "ipp-046", title: "AI in Research Applications", publication: "Campus Research Bulletin", issue: "Vol. 9, No. 1", publishedAt: "2025-01-30", authors: ["S. Kim"], summary: "Artificial intelligence for researchers.", tags: ["technology", "AI", "research"]},
  {id: "ipp-047", title: "Grant Funding Opportunities", publication: "Campus Research Bulletin", issue: "Vol. 9, No. 2", publishedAt: "2025-06-12", authors: ["J. Foster"], summary: "Research funding sources and applications.", tags: ["funding", "research"]},
  {id: "ipp-048", title: "Conference Highlights", publication: "Campus Research Bulletin", issue: "Vol. 9, No. 2", publishedAt: "2025-06-12", authors: ["M. Lee"], summary: "Presentations from major conferences.", tags: ["research", "conference"]},
  // 2026
  {id: "ipp-049", title: "Science and Technology Briefing", publication: "Campus Research Bulletin", issue: "Vol. 9, No. 2", publishedAt: "2026-03-08", authors: ["P. Navarro", "R. Lim"], summary: "Laboratory and technology updates.", tags: ["science", "technology", "data"]},
  {id: "ipp-050", title: "Machine Learning Applications", publication: "Campus Research Bulletin", issue: "Vol. 9, No. 2", publishedAt: "2026-03-08", authors: ["R. Lim", "S. Kim"], summary: "ML for research analysis.", tags: ["technology", "research", "data"]},
  {id: "ipp-051", title: "Bioinformatics Analysis", publication: "Campus Research Bulletin", issue: "Vol. 9, No. 3", publishedAt: "2026-04-12", authors: ["P. Navarro", "T. Johnson"], summary: "Genomic data processing methods.", tags: ["science", "bioinformatics", "data"]},
  {id: "ipp-052", title: "Computing Resources", publication: "Campus Research Bulletin", issue: "Vol. 9, No. 3", publishedAt: "2026-04-12", authors: ["T. Johnson"], summary: "High-performance computing services.", tags: ["technology", "research", "infrastructure"]},
  {id: "ipp-053", title: "Cybersecurity Updates", publication: "Campus Research Bulletin", issue: "Vol. 10, No. 1", publishedAt: "2026-05-08", authors: ["S. Kim", "M. Chen"], summary: "Protecting research data.", tags: ["technology", "security", "data"]},

  // Regional Studies Quarterly (2025-2026, 7 issues, 21 articles)
  // 2025
  {id: "ipp-054", title: "Regional Health Assessment", publication: "Regional Studies Quarterly", issue: "Vol. 17, No. 2", publishedAt: "2025-04-18", authors: ["K. Flores"], summary: "Health status in regions.", tags: ["health", "regional"]},
  {id: "ipp-055", title: "Community Health Programs", publication: "Regional Studies Quarterly", issue: "Vol. 17, No. 2", publishedAt: "2025-04-18", authors: ["D. Martinez"], summary: "Public health initiatives.", tags: ["health", "community", "program"]},
  {id: "ipp-056", title: "Epidemiology Studies", publication: "Regional Studies Quarterly", issue: "Vol. 17, No. 3", publishedAt: "2025-08-25", authors: ["M. Ramirez"], summary: "Disease patterns and prevention.", tags: ["health", "epidemiology"]},
  // 2026
  {id: "ipp-057", title: "Public Health Updates", publication: "Regional Studies Quarterly", issue: "Vol. 18, No. 3", publishedAt: "2026-04-01", authors: ["K. Flores"], summary: "Health monitoring and response systems.", tags: ["health", "community", "policy"]},
  {id: "ipp-058", title: "Pandemic Preparedness", publication: "Regional Studies Quarterly", issue: "Vol. 18, No. 3", publishedAt: "2026-04-01", authors: ["K. Flores", "D. Martinez"], summary: "Healthcare infrastructure strengthening.", tags: ["health", "policy", "community"]},
  {id: "ipp-059", title: "Mental Health Services", publication: "Regional Studies Quarterly", issue: "Vol. 18, No. 4", publishedAt: "2026-05-01", authors: ["M. Ramirez"], summary: "Mental health in rural areas.", tags: ["health", "community", "service"]},
  {id: "ipp-060", title: "Nutrition Policy", publication: "Regional Studies Quarterly", issue: "Vol. 18, No. 4", publishedAt: "2026-05-01", authors: ["D. Martinez", "N. Garcia"], summary: "Public nutrition programs.", tags: ["health", "nutrition", "policy"]},
  {id: "ipp-061", title: "Environmental Health", publication: "Regional Studies Quarterly", issue: "Vol. 19, No. 1", publishedAt: "2026-06-01", authors: ["K. Flores"], summary: "Environment and health outcomes.", tags: ["health", "environment", "community"]},

  // Academic Review Ledger (2025-2026, 7 issues, 21 articles)
  // 2025
  {id: "ipp-062", title: "Curriculum Development", publication: "Academic Review Ledger", issue: "Vol. 6, No. 1", publishedAt: "2025-02-25", authors: ["S. Reyes"], summary: "Modern curriculum design.", tags: ["education", "curriculum"]},
  {id: "ipp-063", title: "Teaching Methodologies", publication: "Academic Review Ledger", issue: "Vol. 6, No. 1", publishedAt: "2025-02-25", authors: ["T. Gomez"], summary: "Innovative teaching approaches.", tags: ["education", "teaching"]},
  {id: "ipp-064", title: "Student Assessment", publication: "Academic Review Ledger", issue: "Vol. 6, No. 2", publishedAt: "2025-06-30", authors: ["L. Santos"], summary: "Effective assessment strategies.", tags: ["education", "assessment"]},
  {id: "ipp-065", title: "Higher Education Trends", publication: "Academic Review Ledger", issue: "Vol. 6, No. 3", publishedAt: "2025-10-12", authors: ["P. Ocampo"], summary: "University education developments.", tags: ["education", "university"]},
  // 2026
  {id: "ipp-066", title: "Education Policy Research", publication: "Academic Review Ledger", issue: "Vol. 7, No. 1", publishedAt: "2026-04-20", authors: ["S. Reyes", "T. Gomez"], summary: "Policy, innovation, and student writing.", tags: ["education", "policy", "students"]},
  {id: "ipp-067", title: "Critical Pedagogy", publication: "Academic Review Ledger", issue: "Vol. 7, No. 1", publishedAt: "2026-04-20", authors: ["T. Gomez", "L. Santos"], summary: "Critical thinking and engagement.", tags: ["education", "pedagogy", "students"]},
  {id: "ipp-068", title: "Accessibility and Inclusion", publication: "Academic Review Ledger", issue: "Vol. 7, No. 2", publishedAt: "2026-05-15", authors: ["S. Reyes"], summary: "Equitable learning environments.", tags: ["education", "policy", "accessibility"]},
  {id: "ipp-069", title: "Student Literacy Programs", publication: "Academic Review Ledger", issue: "Vol. 7, No. 2", publishedAt: "2026-05-15", authors: ["L. Santos", "P. Ocampo"], summary: "Literacy interventions and outcomes.", tags: ["education", "students", "literacy"]},
  {id: "ipp-070", title: "Research Methods Education", publication: "Academic Review Ledger", issue: "Vol. 7, No. 3", publishedAt: "2026-06-10", authors: ["P. Ocampo", "S. Reyes"], summary: "Rigorous education research approaches.", tags: ["education", "research", "methodology"]},

  // Technology Insights Journal (2025-2026, 6 articles)
  {id: "ipp-071", title: "Cloud Computing Advances", publication: "Technology Insights Journal", issue: "Vol. 3, No. 1", publishedAt: "2025-01-20", authors: ["H. Zhang"], summary: "Latest developments in cloud infrastructure.", tags: ["technology", "cloud", "computing"]},
  {id: "ipp-072", title: "Cybersecurity Threats", publication: "Technology Insights Journal", issue: "Vol. 3, No. 2", publishedAt: "2025-04-15", authors: ["N. Patel", "J. Lee"], summary: "Emerging security vulnerabilities and solutions.", tags: ["technology", "security", "cybersecurity"]},
  {id: "ipp-073", title: "IoT Applications", publication: "Technology Insights Journal", issue: "Vol. 3, No. 3", publishedAt: "2025-08-10", authors: ["K. Mueller"], summary: "Internet of Things in smart cities.", tags: ["technology", "IoT", "innovation"]},
  {id: "ipp-074", title: "5G Network Development", publication: "Technology Insights Journal", issue: "Vol. 4, No. 1", publishedAt: "2026-02-01", authors: ["H. Zhang", "N. Patel"], summary: "5G infrastructure and applications.", tags: ["technology", "networking", "innovation"]},
  {id: "ipp-075", title: "Quantum Computing Breakthroughs", publication: "Technology Insights Journal", issue: "Vol. 4, No. 2", publishedAt: "2026-05-12", authors: ["J. Lee"], summary: "Quantum algorithms and practical implementations.", tags: ["technology", "computing", "research"]},

  // Business Research Quarterly (2025-2026, 6 articles)
  {id: "ipp-076", title: "Market Analysis Report", publication: "Business Research Quarterly", issue: "Vol. 8, No. 1", publishedAt: "2025-03-01", authors: ["C. Kim"], summary: "Global market trends and forecasts.", tags: ["business", "economics", "market"]},
  {id: "ipp-077", title: "Startup Funding Trends", publication: "Business Research Quarterly", issue: "Vol. 8, No. 2", publishedAt: "2025-06-15", authors: ["M. Wong", "R. Singh"], summary: "Venture capital investment patterns.", tags: ["business", "finance", "startups"]},
  {id: "ipp-078", title: "Corporate Strategy", publication: "Business Research Quarterly", issue: "Vol. 8, No. 3", publishedAt: "2025-09-20", authors: ["S. Johnson"], summary: "Strategic planning in modern enterprises.", tags: ["business", "strategy", "management"]},
  {id: "ipp-079", title: "Economic Impact Analysis", publication: "Business Research Quarterly", issue: "Vol. 9, No. 1", publishedAt: "2026-01-30", authors: ["C. Kim", "M. Wong"], summary: "Economic factors affecting business growth.", tags: ["business", "economics", "analysis"]},
  {id: "ipp-080", title: "Supply Chain Optimization", publication: "Business Research Quarterly", issue: "Vol. 9, No. 2", publishedAt: "2026-04-10", authors: ["R. Singh"], summary: "Efficient supply chain management.", tags: ["business", "logistics", "optimization"]},

  // Legal Studies Forum (2025-2026, 5 articles)
  {id: "ipp-081", title: "Constitutional Law Updates", publication: "Legal Studies Forum", issue: "Vol. 5, No. 1", publishedAt: "2025-02-10", authors: ["J. Martinez"], summary: "Recent constitutional court decisions.", tags: ["law", "constitutional", "legal"]},
  {id: "ipp-082", title: "Corporate Law", publication: "Legal Studies Forum", issue: "Vol. 5, No. 2", publishedAt: "2025-05-25", authors: ["A. Thompson", "L. Garcia"], summary: "Business law and regulations.", tags: ["law", "corporate", "business"]},
  {id: "ipp-083", title: "International Trade Law", publication: "Legal Studies Forum", issue: "Vol. 5, No. 3", publishedAt: "2025-08-30", authors: ["M. Chen"], summary: "Trade agreements and disputes.", tags: ["law", "international", "trade"]},
  {id: "ipp-084", title: "Environmental Law", publication: "Legal Studies Forum", issue: "Vol. 6, No. 1", publishedAt: "2026-03-15", authors: ["J. Martinez", "A. Thompson"], summary: "Environmental regulations and compliance.", tags: ["law", "environment", "policy"]},

  // Environmental Science Review (2025-2026, 5 articles)
  {id: "ipp-085", title: "Climate Change Impact", publication: "Environmental Science Review", issue: "Vol. 4, No. 1", publishedAt: "2025-01-15", authors: ["D. Foster"], summary: "Global warming effects on ecosystems.", tags: ["environment", "climate", "science"]},
  {id: "ipp-086", title: "Biodiversity Conservation", publication: "Environmental Science Review", issue: "Vol. 4, No. 2", publishedAt: "2025-04-20", authors: ["E. Wilson", "B. Adams"], summary: "Protecting species and habitats.", tags: ["environment", "conservation", "biodiversity"]},
  {id: "ipp-087", title: "Water Quality Studies", publication: "Environmental Science Review", issue: "Vol. 4, No. 3", publishedAt: "2025-07-10", authors: ["R. Kumar"], summary: "Monitoring and improving water ecosystems.", tags: ["environment", "water", "science"]},
  {id: "ipp-088", title: "Renewable Energy Solutions", publication: "Environmental Science Review", issue: "Vol. 5, No. 1", publishedAt: "2026-02-25", authors: ["D. Foster", "E. Wilson"], summary: "Solar, wind, and sustainable energy.", tags: ["environment", "energy", "sustainability"]},
  {id: "ipp-089", title: "Air Pollution Analysis", publication: "Environmental Science Review", issue: "Vol. 5, No. 2", publishedAt: "2026-05-08", authors: ["B. Adams"], summary: "Atmospheric pollution sources and effects.", tags: ["environment", "pollution", "health"]},
];

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 1);
}

export function recordToSearchText(record: PeriodicalRecord): string {
  return [
    record.title,
    record.publication,
    record.issue,
    record.publishedAt,
    record.authors.join(" "),
    record.summary,
    record.tags.join(" "),
    record.content,
  ].join(" ");
}
