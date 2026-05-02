# Design Document: Google-Like Search Engine

## Overview

This document describes the technical design for transforming Eagle Search Naija from a basic SQL `LIKE` search into a full Google-style search engine with a self-sustaining PPC ad revenue system.

The feature adds:
- SQLite FTS5 full-text search index with weighted relevance scoring
- A dedicated `/search` results page with snippets, pagination, sponsored badges, filters, knowledge panel, and "People Also Search For"
- Autocomplete with 150 ms debounce and 300 ms SLA
- Search history (authenticated users, 50-entry cap) and trending searches (24-hour rolling window)
- Impression/click analytics with CTR tracking
- Location-aware ranking via the Haversine formula
- A PPC ad auction: `Ad_Rank = CPC_Bid × Quality_Score`
- Quality Score (1–10) computed from keyword relevance (40%), profile completeness (30%), and CTR history (30%)
- Keyword targeting, budget management (daily/monthly caps, midnight resets), ad scheduling
- Paystack billing at ₦1,000 threshold or every 7 days
- Campaign management dashboard for business owners
- Admin revenue dashboard with 90-day chart and leaderboard

All new code stays within the existing Next.js 16 App Router architecture. SQLite FTS5 is used for MVP; the schema is designed to migrate cleanly to PostgreSQL full-text search later.

---

## Architecture

### High-Level Data Flow

```mermaid
flowchart TD
    subgraph Browser
        A[Search Input] -->|150ms debounce| B[Autocomplete API]
        A -->|Submit| C[/search page]
        C -->|SSR/CSR fetch| D[Search API]
        C -->|Impression batch| E[Analytics API]
        C -->|Click| F[Click API]
    end

    subgraph Next.js App Router
        D --> G[SearchService]
        B --> H[AutocompleteService]
        E --> I[AnalyticsService]
        F --> J[AdBillingService]
    end

    subgraph Database - SQLite / PostgreSQL
        G --> K[(business_fts FTS5)]
        G --> L[(Business)]
        G --> M[(AdCampaign / AdKeyword)]
        J --> N[(AdClick / AdBillingCycle)]
        I --> O[(AdImpression / SearchQuery)]
    end

    subgraph Background Jobs - Node cron
        P[Midnight Budget Reset] --> L
        Q[Quality Score Recompute - 24h] --> M
        R[Billing Cycle Check - hourly] --> J
        S[Trending Refresh - 30min] --> O
    end
```

### Request Lifecycle for a Search

1. User types → 150 ms debounce fires → `GET /api/search/autocomplete?q=...` → returns ≤8 suggestions.
2. User submits → browser navigates to `/search?q=...&page=1&...filters`.
3. `/search` page (Server Component) calls `SearchService.query()`:
   a. Runs FTS5 query to get ranked organic candidates.
   b. Runs ad auction to get ≤3 sponsored results.
   c. Applies filters (category, rating, open-now, distance).
   d. Applies proximity boost via Haversine.
   e. Returns paginated payload.
4. Page renders sponsored results (top), then organic results, then Knowledge Panel (if triggered), then "People Also Search For".
5. Client-side: impression events are batched and sent to `POST /api/search/impressions`.
6. On click: `POST /api/search/click` records the event and triggers budget deduction.

---

## Components and Interfaces

### New API Routes

| Route | Method | Description |
|---|---|---|
| `/api/search` | GET | Main search endpoint — FTS5 + ad auction + filters |
| `/api/search/autocomplete` | GET | Autocomplete suggestions (≤8, 300 ms SLA) |
| `/api/search/impressions` | POST | Batch impression recording |
| `/api/search/click` | POST | Click recording + budget deduction |
| `/api/search/history` | GET / DELETE | User search history |
| `/api/search/trending` | GET | Trending searches (cached 30 min) |
| `/api/search/knowledge-panel` | GET | Knowledge panel data for a business |
| `/api/ads/campaigns` | GET / POST | List / create ad campaigns |
| `/api/ads/campaigns/[id]` | GET / PATCH / DELETE | Read / update / delete a campaign |
| `/api/ads/campaigns/[id]/keywords` | GET / POST / DELETE | Manage keywords |
| `/api/ads/billing` | GET | Billing history for a business |
| `/api/ads/quality-score/[id]` | GET | Current quality score breakdown |
| `/api/admin/revenue` | GET | Platform-wide revenue metrics |
| `/api/admin/campaigns` | GET | All campaigns (admin view) |

### New Frontend Pages

| Path | Type | Description |
|---|---|---|
| `/search` | Server Component + Client islands | Google-style results page |
| `/dashboard/ads` | Client Component | Business owner ad campaign dashboard |
| `/dashboard/ads/new` | Client Component | Create campaign form |
| `/dashboard/ads/[id]` | Client Component | Edit campaign |
| `/admin/revenue` | Client Component | Admin revenue dashboard |

### New Frontend Components

```
src/components/search/
  SearchBar.tsx              — unified search bar with autocomplete dropdown
  SearchResults.tsx          — results list (sponsored + organic)
  SearchResultCard.tsx       — single organic result card
  SponsoredResultCard.tsx    — single sponsored result card with badge
  SearchFilters.tsx          — filter panel (category, rating, open-now, distance)
  FilterChips.tsx            — active filter chips above results
  Pagination.tsx             — numbered pagination controls
  KnowledgePanel.tsx         — business knowledge panel sidebar
  PeopleAlsoSearch.tsx       — related suggestions section
  SearchHistoryDropdown.tsx  — recent searches dropdown

src/components/ads/
  CampaignTable.tsx          — campaign list table
  CampaignForm.tsx           — create/edit campaign form
  KeywordInput.tsx           — keyword tag input (max 20)
  BudgetInput.tsx            — daily/monthly budget inputs with validation
  ScheduleBuilder.tsx        — day-of-week + time-range schedule UI
  QualityScoreCard.tsx       — quality score breakdown display
  BillingHistoryTable.tsx    — billing records table
  PerformanceChart.tsx       — 30-day impressions/clicks/spend chart

src/components/admin/
  RevenueMetrics.tsx         — platform KPI cards
  RevenuChart.tsx            — 90-day daily revenue chart
  TopSpendersLeaderboard.tsx — top 10 businesses by spend
  AllCampaignsTable.tsx      — filterable all-campaigns table
```

### Service Layer (src/lib/services/)

```
SearchService.ts        — FTS5 query, relevance scoring, ad auction, filters
AutocompleteService.ts  — suggestion generation and ranking
AdAuctionService.ts     — Ad_Rank computation, budget checks, schedule checks
QualityScoreService.ts  — Quality_Score formula
BillingService.ts       — Paystack charge trigger, billing cycle management
TrendingService.ts      — trending query aggregation (cached)
HaversineService.ts     — distance computation
```

---

## Data Models

### New Prisma Models

```prisma
// Full-text search index (managed via raw SQL for FTS5)
// Not a Prisma model — created via migration raw SQL:
// CREATE VIRTUAL TABLE business_fts USING fts5(
//   businessId UNINDEXED,
//   name,
//   category,
//   description,
//   tags,
//   city,
//   state,
//   content='Business',
//   content_rowid='rowid'
// );

model SearchQuery {
  id        String   @id @default(cuid())
  query     String
  userId    String?  // null for anonymous
  sessionId String?  // browser session ID for anonymous
  resultCount Int    @default(0)
  createdAt DateTime @default(now())

  @@index([createdAt])
  @@index([query])
}

model SearchHistory {
  id        String   @id @default(cuid())
  userId    String
  query     String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

model AdCampaign {
  id               String   @id @default(cuid())
  businessId       String
  business         Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  name             String
  status           String   @default("ACTIVE")
  // ACTIVE | PAUSED | BUDGET_EXHAUSTED | PAYMENT_FAILED | DELETED
  cpcBid           Float    // NGN, minimum 10
  dailyBudget      Float    // NGN, minimum 500
  monthlyBudget    Float?   // NGN, optional
  dailySpent       Float    @default(0)
  monthlySpent     Float    @default(0)
  totalSpent       Float    @default(0)
  qualityScore     Float    @default(5)
  startDate        DateTime
  endDate          DateTime?
  schedule         String?  // JSON: [{day: 0-6, startTime: "HH:MM", endTime: "HH:MM"}]
  unbilledAmount   Float    @default(0)
  lastBilledAt     DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  keywords         AdKeyword[]
  impressions      AdImpression[]
  clicks           AdClick[]
  billingCycles    AdBillingCycle[]

  @@index([businessId, status])
}

model AdKeyword {
  id         String     @id @default(cuid())
  campaignId String
  campaign   AdCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  keyword    String
  createdAt  DateTime   @default(now())

  @@index([keyword])
  @@unique([campaignId, keyword])
}

model AdImpression {
  id         String     @id @default(cuid())
  campaignId String?    // null for organic impressions
  campaign   AdCampaign? @relation(fields: [campaignId], references: [id])
  businessId String
  query      String
  position   Int
  type       String     // "sponsored" | "organic"
  sessionId  String?
  createdAt  DateTime   @default(now())

  @@index([campaignId, createdAt])
  @@index([businessId, createdAt])
}

model AdClick {
  id          String     @id @default(cuid())
  campaignId  String?    // null for organic clicks
  campaign    AdCampaign? @relation(fields: [campaignId], references: [id])
  businessId  String
  query       String
  position    Int
  type        String     // "sponsored" | "organic"
  cpcCharged  Float      @default(0) // 0 for organic
  billed      Boolean    @default(false)
  sessionId   String?
  createdAt   DateTime   @default(now())

  @@index([campaignId, billed])
  @@index([businessId, createdAt])
}

model AdBillingCycle {
  id              String     @id @default(cuid())
  campaignId      String
  campaign        AdCampaign @relation(fields: [campaignId], references: [id])
  amount          Float
  clickCount      Int
  paystackRef     String?    @unique
  status          String     @default("PENDING")
  // PENDING | SUCCESS | FAILED
  createdAt       DateTime   @default(now())
  settledAt       DateTime?

  @@index([campaignId, createdAt])
}
```

### Additions to Existing Models

```prisma
// Add to User model:
searchHistory  SearchHistory[]

// Add to Business model:
adCampaigns    AdCampaign[]
```

### FTS5 Virtual Table (Raw SQL Migration)

```sql
-- Migration: create FTS5 index
CREATE VIRTUAL TABLE IF NOT EXISTS business_fts USING fts5(
  businessId UNINDEXED,
  name,
  category,
  description,
  tags,
  city,
  state,
  tokenize = 'unicode61'
);

-- Populate from existing businesses
INSERT INTO business_fts (businessId, name, category, description, tags, city, state)
SELECT id, name, category, COALESCE(description,''), COALESCE(tags,''), city, state
FROM Business WHERE isActive = 1;

-- Triggers to keep FTS5 in sync
CREATE TRIGGER business_fts_insert AFTER INSERT ON Business BEGIN
  INSERT INTO business_fts(businessId, name, category, description, tags, city, state)
  VALUES (new.id, new.name, new.category, COALESCE(new.description,''),
          COALESCE(new.tags,''), new.city, new.state);
END;

CREATE TRIGGER business_fts_update AFTER UPDATE ON Business BEGIN
  DELETE FROM business_fts WHERE businessId = old.id;
  INSERT INTO business_fts(businessId, name, category, description, tags, city, state)
  VALUES (new.id, new.name, new.category, COALESCE(new.description,''),
          COALESCE(new.tags,''), new.city, new.state);
END;

CREATE TRIGGER business_fts_delete AFTER DELETE ON Business BEGIN
  DELETE FROM business_fts WHERE businessId = old.id;
END;
```

**PostgreSQL migration path**: Replace FTS5 virtual table with `tsvector` columns and GIN indexes. The `SearchService` abstracts the raw query behind a provider interface so only the SQL string changes.

---

## Search Ranking Algorithm

### Relevance Score Formula

```
RelevanceScore(business, query) =
    (name_match_count × 3) +
    (category_match_count × 2) +
    (description_match_count × 1) +
    (tags_match_count × 1) +
    (city_match_count × 1) +
    (state_match_count × 1) +
    ProximityBoost(distance_km) +
    RatingTiebreaker(rating)
```

Where:
- `ProximityBoost(d) = max(0, 10 - d)` — adds up to 10 points for businesses within 10 km
- `RatingTiebreaker(r) = r × 0.001` — a tiny fractional boost so equal-score businesses sort by rating without overriding relevance

### FTS5 Query Execution

```sql
-- Weighted BM25 via FTS5 rank column (lower rank = better match in FTS5)
SELECT
  b.id, b.name, b.category, b.description, b.city, b.state,
  b.rating, b.reviewCount, b.lat, b.lng, b.openingTime, b.closingTime,
  b.logo, b.phone, b.website, b.whatsapp, b.isVerified,
  -- FTS5 bm25 with field weights: name=3, category=2, desc=1, tags=1, city=1, state=1
  bm25(business_fts, 3, 2, 1, 1, 1, 1) AS ftsRank
FROM business_fts
JOIN Business b ON b.id = business_fts.businessId
WHERE business_fts MATCH ? AND b.isActive = 1
ORDER BY ftsRank  -- FTS5 bm25 returns negative values; lower = better
LIMIT 100;
```

The `ftsRank` (negative BM25) is then converted to a positive `relevanceScore`, proximity boost is added, and results are sorted descending.

### Final Sort Order

1. Sponsored results (sorted by `Ad_Rank` descending) — top 3 maximum
2. Organic results (sorted by `relevanceScore` descending, then `rating` descending as tiebreaker)

---

## Ad Auction Algorithm

### Eligibility Checks (run per auction)

An `AdCampaign` is eligible if ALL of the following are true:
1. `status === 'ACTIVE'`
2. `dailySpent < dailyBudget` (daily budget not exhausted)
3. `monthlyBudget === null || monthlySpent < monthlyBudget` (monthly budget not exhausted)
4. `startDate <= now` and `(endDate === null || endDate >= now)`
5. Schedule check: `isWithinSchedule(campaign.schedule, now)` returns `true`
6. At least one keyword matches the search query (case-insensitive, partial match)

### Ad_Rank Computation

```
Ad_Rank = CPC_Bid × Quality_Score
```

### Auction Selection

1. Filter all campaigns to eligible set.
2. Sort eligible campaigns by `Ad_Rank` descending; break ties by `Quality_Score` descending.
3. Select top 3 as sponsored results.
4. Assign positions 1, 2, 3 to the selected campaigns.

### Schedule Check

```typescript
function isWithinSchedule(
  schedule: ScheduleEntry[] | null,
  now: Date
): boolean {
  if (!schedule || schedule.length === 0) return true; // 24/7 if no schedule
  const nigeriaTime = toNigeriaTime(now); // UTC+1
  const dayOfWeek = nigeriaTime.getDay(); // 0=Sun, 6=Sat
  const timeStr = formatHHMM(nigeriaTime);
  return schedule.some(
    (entry) =>
      entry.day === dayOfWeek &&
      timeStr >= entry.startTime &&
      timeStr < entry.endTime
  );
}
```

---

## Quality Score Computation

### Formula

```
Quality_Score = clamp(
  (KeywordRelevance × 0.4) +
  (ProfileCompleteness × 0.3) +
  (CTRScore × 0.3),
  1, 10
)
```

### Component Definitions

**KeywordRelevance (0–10)**
- For each keyword in the campaign, compute Jaccard similarity between the keyword tokens and the union of the business's `category` + `description` tokens.
- `KeywordRelevance = min(10, averageJaccard × 10 × 2)` — scaled so a 50% overlap scores 10.

**ProfileCompleteness (0–10)**
- Score 2 points each for: `logo` present, `description` present (≥50 chars), `phone` present, `address` present, `openingTime` + `closingTime` both present.
- Maximum 10 points.

**CTRScore (0–10)**
- If `totalImpressions < 100`: use default CTR of 2% → `CTRScore = 2.0`
- Otherwise: `CTR = (totalClicks / totalImpressions) × 100`
- `CTRScore = min(10, CTR × 2)` — a 5% CTR scores 10.

### Recomputation Schedule

Quality scores are recomputed every 24 hours by a background job (`QualityScoreJob`). The job iterates all `ACTIVE` campaigns and updates `qualityScore` in the `AdCampaign` table.

---

## Background Job Design

All background jobs run as Node.js cron tasks, bootstrapped in a Next.js route handler that is called by a cron service (e.g., Vercel Cron, or a self-hosted cron hitting `/api/cron/[job]`).

| Job | Schedule | Description |
|---|---|---|
| `daily-budget-reset` | `0 0 * * *` (midnight UTC+1) | Resets `dailySpent = 0` for all campaigns |
| `monthly-budget-reset` | `0 0 1 * *` (1st of month, midnight UTC+1) | Resets `monthlySpent = 0`, re-activates `BUDGET_EXHAUSTED` campaigns |
| `quality-score-recompute` | `0 2 * * *` (2 AM daily) | Recomputes `qualityScore` for all active campaigns |
| `billing-cycle-check` | `0 * * * *` (hourly) | Triggers Paystack charge when `unbilledAmount >= 1000` or 7 days elapsed |
| `trending-refresh` | `*/30 * * * *` (every 30 min) | Aggregates last-24h queries, caches top 10 in memory/Redis |

### Cron Route Pattern

```
src/app/api/cron/
  daily-budget-reset/route.ts
  monthly-budget-reset/route.ts
  quality-score-recompute/route.ts
  billing-cycle-check/route.ts
  trending-refresh/route.ts
```

Each route validates a `CRON_SECRET` header before executing.

---

## Error Handling

### Search Errors
- FTS5 query failure → fall back to `LIKE`-based search, log error, return results with degraded ranking.
- Impression/click persistence failure → log error, return 200 to client (non-blocking per Requirement 9.5).

### Ad Auction Errors
- Budget deduction race condition → use a database transaction with optimistic locking (`UPDATE AdCampaign SET dailySpent = dailySpent + ? WHERE id = ? AND dailySpent + ? <= dailyBudget`). If the update affects 0 rows, the campaign is exhausted and the click is not charged.
- Paystack charge failure → set all campaigns for the business to `PAYMENT_FAILED`, send email notification, log the failed billing cycle.

### Autocomplete Errors
- If the autocomplete query exceeds 300 ms SLA, return an empty array rather than a timeout error (fail-open).

### General API Errors
- All API routes return structured JSON errors: `{ error: string, code: string }`.
- 400 for validation errors, 401 for unauthenticated, 403 for unauthorised, 500 for server errors.

---

## Testing Strategy

### Unit Tests (Jest + ts-jest)

Focus on pure functions:
- `HaversineService.distance()` — symmetry, zero distance for identical coords
- `QualityScoreService.compute()` — clamping to [1,10], default CTR for <100 impressions
- `AdAuctionService.selectWinners()` — top-3 selection, tiebreaker by Quality_Score
- `SearchService.buildSnippet()` — 160-char truncation
- `isWithinSchedule()` — schedule boundary conditions
- `isOpenNow()` — open/closed determination from time strings

### Property-Based Tests (fast-check)

fast-check is the recommended PBT library for TypeScript. Each property test runs a minimum of 100 iterations.

Tag format: `// Feature: google-like-search-engine, Property N: <property_text>`

### Integration Tests (Jest + Prisma test database)

- FTS5 index sync after Business create/update/delete
- Ad auction end-to-end: create campaign → search → verify sponsored result appears
- Budget exhaustion: click until budget depleted → verify campaign excluded from auction
- Billing trigger: accumulate ₦1,000 unbilled → verify Paystack charge initiated
- Search history cap: submit 51 searches → verify only 50 retained

### E2E Tests (Playwright — optional, post-MVP)

- Full search flow: type → autocomplete → select → results page
- Campaign creation flow
- Admin revenue dashboard access control

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Weighted Relevance Ordering

*For any* search query term `q` and two businesses `A` and `B` where `q` appears only in `A`'s name (weight 3) and only in `B`'s description (weight 1), the relevance score of `A` SHALL be strictly greater than the relevance score of `B`.

**Validates: Requirements 1.3**

---

### Property 2: Rating Tiebreaker

*For any* two businesses `A` and `B` that produce identical relevance scores for a given query, if `A.rating > B.rating` then `A` SHALL appear before `B` in the result list.

**Validates: Requirements 1.4**

---

### Property 3: Proximity Boost Bounds

*For any* distance value `d >= 0`, the proximity boost `max(0, 10 - d)` SHALL satisfy: boost equals `0` when `d >= 10`, boost equals `10 - d` when `0 <= d < 10`, and boost is never negative.

**Validates: Requirements 1.5, 18.2, 18.3**

---

### Property 4: Sponsored Results Precede Organic Results

*For any* search result list containing both sponsored and organic results, every sponsored result SHALL appear at a lower index than every organic result.

**Validates: Requirements 1.6, 2.2**

---

### Property 5: Autocomplete Result Count Bound

*For any* query string of length ≥ 2, the autocomplete endpoint SHALL return a list of at most 8 suggestions.

**Validates: Requirements 3.1**

---

### Property 6: Autocomplete Prefix Ranking

*For any* query string `q` and two suggestions `A` and `B` where `A` starts with `q` (exact prefix match) and `B` contains `q` but does not start with it (partial match), `A` SHALL rank before `B` in the suggestion list.

**Validates: Requirements 3.3**

---

### Property 7: Open-Now Filter Correctness

*For any* business with `openingTime` and `closingTime` strings and any Nigeria-local time `t`, `isOpenNow(business, t)` SHALL return `true` if and only if `t` falls within the interval `[openingTime, closingTime)`.

**Validates: Requirements 4.3**

---

### Property 8: Search History Cap

*For any* authenticated user who submits more than 50 search queries, the search history store SHALL contain exactly 50 entries — the 50 most recently submitted queries — and no older entries.

**Validates: Requirements 7.2**

---

### Property 9: Trending Excludes Short Queries

*For any* set of search queries submitted in the past 24 hours, the trending searches list SHALL never include any query whose character length is less than 2.

**Validates: Requirements 8.4**

---

### Property 10: CTR Formula Precision

*For any* business with `impressions > 0` and `clicks >= 0`, the computed CTR SHALL equal `round((clicks / impressions) × 100, 2)` and SHALL be a non-negative number.

**Validates: Requirements 9.4**

---

### Property 11: Ad Campaign Validation Invariants

*For any* campaign creation request, the system SHALL reject the request if `cpcBid < 10` OR `dailyBudget < 500`. Specifically: (a) for any `cpcBid` in the range `[0, 9.99]`, creation SHALL fail; (b) for any `dailyBudget` in the range `[0, 499.99]`, creation SHALL fail.

**Validates: Requirements 10.5, 10.6**

---

### Property 12: Ad_Rank Formula

*For any* eligible ad campaign with `cpcBid` and `qualityScore`, the computed `Ad_Rank` SHALL equal `cpcBid × qualityScore` exactly (to floating-point precision).

**Validates: Requirements 11.2**

---

### Property 13: Auction Selects Top-3 by Ad_Rank

*For any* set of eligible ad campaigns, the auction SHALL select the campaigns with the 3 highest `Ad_Rank` values as sponsored results. When two campaigns share equal `Ad_Rank`, the one with the higher `qualityScore` SHALL be ranked first.

**Validates: Requirements 11.3, 11.4**

---

### Property 14: Quality Score Bounds

*For any* ad campaign with any combination of keyword relevance, profile completeness, and CTR history, the computed `Quality_Score` SHALL always be in the closed interval `[1, 10]`.

**Validates: Requirements 12.1**

---

### Property 15: Default CTR for Low-Impression Campaigns

*For any* ad campaign with fewer than 100 total impressions, the CTR component used in Quality_Score computation SHALL be exactly 2% (i.e., `CTRScore = 2.0`), regardless of actual click count.

**Validates: Requirements 12.2**

---

### Property 16: Budget Deduction Accuracy

*For any* click event on a sponsored result with `cpcBid = b`, the campaign's `dailySpent` SHALL increase by exactly `b` and `unbilledAmount` SHALL increase by exactly `b`.

**Validates: Requirements 13.1**

---

### Property 17: Ad Schedule Boundary Correctness

*For any* campaign schedule (a list of day-of-week + time-range entries) and any Nigeria-local datetime `dt`, `isWithinSchedule(schedule, dt)` SHALL return `true` if and only if `dt`'s day-of-week and time-of-day fall within at least one scheduled entry's window.

**Validates: Requirements 16.2**

---

### Property 18: Haversine Symmetry and Zero Distance

*For any* two coordinate pairs `(lat1, lng1)` and `(lat2, lng2)`, the Haversine distance SHALL satisfy: (a) `distance(A, B) == distance(B, A)` (symmetry); (b) `distance(A, A) == 0` (zero distance for identical coordinates); (c) `distance(A, B) >= 0` for all inputs (non-negativity).

**Validates: Requirements 18.2**

---

### Property 19: Search Result Serialisation Round-Trip

*For any* valid `SearchResult` object, serialising it to JSON and deserialising it SHALL produce an object whose `id`, `name`, `category`, `city`, `state`, `rating`, `reviewCount`, and `isSponsored` fields are identical to the original. Optional fields with `null` values SHALL be serialised as `null` (not omitted).

**Validates: Requirements 19.2, 19.3, 19.4**

---

### Property 20: Click Event CPC Round-Trip Precision

*For any* valid `ClickEvent` with `cpcCharged` expressed to 2 decimal places, serialising the event to JSON and deserialising it SHALL produce a `cpcCharged` value equal to the original to 2 decimal places.

**Validates: Requirements 20.3**

---

### Property 21: Event ID Uniqueness

*For any* sequence of impression and click events generated by the system, no two events in the sequence SHALL share the same `eventId`.

**Validates: Requirements 20.4**

---

### Property 22: Organic Results Page Size Bound

*For any* search query and any page number, the count of organic results returned on a single page SHALL never exceed 10.

**Validates: Requirements 2.4**
