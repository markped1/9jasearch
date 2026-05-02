# Requirements Document

## Introduction

Eagle Search Naija is a Nigerian business directory that needs to evolve into a fully operational search engine modelled after Google — delivering a Google-quality search experience on the frontend and a self-sustaining Pay-Per-Click (PPC) ad revenue system on the backend.

The existing app uses Next.js 16, React 19, TypeScript, Prisma ORM with SQLite, NextAuth v5, and Paystack for payments. It already has Business, User, Review, Payment, AnalyticsEvent, and Appointment models. The current search is a basic SQL `LIKE` query with no ranking, no ad system, and no full-text indexing.

This feature transforms Eagle Search Naija into a platform where:
- Users experience Google-style ranked search results, autocomplete, filters, knowledge panels, and pagination.
- Businesses can create ad campaigns, bid on keywords, set budgets, and track performance.
- Admins can monitor total ad revenue, impressions, clicks, and platform health.

---

## Glossary

- **Search_Engine**: The Eagle Search Naija search system responsible for indexing, ranking, and returning business results.
- **Search_Index**: The pre-computed, full-text searchable data store built from Business records.
- **Relevance_Score**: A numeric value computed by the Search_Engine that determines the organic ranking of a Business result.
- **Ad_System**: The Pay-Per-Click advertising platform that manages campaigns, bids, budgets, and billing.
- **Ad_Campaign**: A business-owned advertising unit containing keyword targets, bid amounts, budget limits, and scheduling rules.
- **Ad_Rank**: The numeric value computed as `(CPC_Bid × Quality_Score)` that determines sponsored result placement.
- **Quality_Score**: A 1–10 score assigned to an Ad_Campaign based on keyword relevance, business profile completeness, and click-through rate history.
- **CPC**: Cost-Per-Click — the amount a business is charged each time a user clicks a sponsored result.
- **Impression**: A single instance of a search result (organic or sponsored) being displayed to a user.
- **Click**: A single instance of a user selecting a search result link.
- **CTR**: Click-Through Rate — the ratio of Clicks to Impressions for a result.
- **Daily_Budget**: The maximum amount in Nigerian Naira (NGN) an Ad_Campaign may spend in a single calendar day.
- **Monthly_Budget**: The maximum amount in NGN an Ad_Campaign may spend in a single calendar month.
- **Keyword**: A word or phrase that a business targets so their Ad_Campaign appears when users search for that term.
- **Autocomplete_Service**: The component that returns search suggestions as a user types into the search box.
- **Knowledge_Panel**: The business information card displayed alongside search results for a specific business query.
- **Search_History**: The record of past search queries made by an authenticated user.
- **Trending_Searches**: A ranked list of the most frequently submitted search queries within a rolling 24-hour window.
- **Snippet**: The short text excerpt shown beneath a business name in a search result, summarising the business description and address.
- **Pagination**: The mechanism that divides search results into discrete numbered pages.
- **Filter**: A user-selectable constraint that narrows search results by category, location, rating, open status, or distance.
- **Business_Owner**: A User with role `BUSINESS` who owns one or more Business records.
- **Admin**: A User with role `ADMIN` who manages the platform.
- **Paystack**: The third-party payment processor used to charge businesses for ad spend.
- **Ad_Dashboard**: The Business_Owner-facing interface for creating and managing Ad_Campaigns.
- **Revenue_Dashboard**: The Admin-facing interface showing platform-wide ad revenue metrics.

---

## Requirements

---

### Requirement 1: Full-Text Search Index

**User Story:** As a user, I want search results to be ranked by relevance rather than simple text matching, so that the most useful businesses appear at the top.

#### Acceptance Criteria

1. THE Search_Engine SHALL maintain a Search_Index that stores pre-tokenised, weighted fields for each active Business record, including name (weight 3), category (weight 2), description (weight 1), tags (weight 1), city (weight 1), and state (weight 1).
2. WHEN a Business record is created, updated, or deactivated, THE Search_Engine SHALL update the Search_Index entry for that Business within 5 seconds.
3. WHEN a user submits a search query, THE Search_Engine SHALL compute a Relevance_Score for each candidate Business by summing weighted term-frequency matches across indexed fields.
4. WHEN two Business records have equal Relevance_Score, THE Search_Engine SHALL rank the Business with the higher `rating` value first.
5. WHEN a Business has `lat` and `lng` coordinates and the user's coordinates are known, THE Search_Engine SHALL apply a proximity boost that increases Relevance_Score by `max(0, 10 - distance_km)` points.
6. THE Search_Engine SHALL return search results sorted by Ad_Rank first (sponsored), then by Relevance_Score descending (organic).
7. WHEN the search query is empty, THE Search_Engine SHALL return results ordered by proximity (if coordinates are available), then by `rating` descending.

---

### Requirement 2: Search Results Page

**User Story:** As a user, I want a dedicated search results page that looks and works like Google, so that I can quickly scan and navigate to relevant businesses.

#### Acceptance Criteria

1. WHEN a user submits a search query, THE Search_Engine SHALL render a dedicated `/search` results page within 1 second on a standard broadband connection.
2. THE Search_Engine SHALL display sponsored Business results at the top of the results page, each labelled with a visible "Sponsored" badge.
3. THE Search_Engine SHALL display organic Business results below sponsored results, each showing: business name as a clickable link, category, city and state, star rating, review count, and a Snippet of up to 160 characters.
4. THE Search_Engine SHALL display a maximum of 10 organic results per page.
5. THE Search_Engine SHALL display Pagination controls showing page numbers 1 through N, a "Previous" button, and a "Next" button, where N is `ceil(total_organic_results / 10)`.
6. WHEN a user clicks a page number, THE Search_Engine SHALL load the corresponding results page without a full browser reload.
7. THE Search_Engine SHALL display the total result count (e.g., "About 142 results") at the top of the results list.
8. WHEN no results are found, THE Search_Engine SHALL display a "No results found" message and suggest related categories or nearby businesses.

---

### Requirement 3: Search Autocomplete

**User Story:** As a user, I want search suggestions to appear as I type, so that I can find what I need faster without completing my full query.

#### Acceptance Criteria

1. WHEN a user types 2 or more characters into the search input, THE Autocomplete_Service SHALL return up to 8 suggestions within 300 milliseconds.
2. THE Autocomplete_Service SHALL generate suggestions from: matching Business names, matching category names, and recent Trending_Searches that match the typed prefix.
3. THE Autocomplete_Service SHALL rank suggestions by: exact prefix match first, then partial match, then Trending_Searches frequency.
4. WHEN a user selects an autocomplete suggestion, THE Search_Engine SHALL immediately execute a search for that suggestion.
5. WHEN a user presses the Escape key while the suggestion list is visible, THE Autocomplete_Service SHALL dismiss the suggestion list without submitting a search.
6. THE Autocomplete_Service SHALL debounce input events with a 150-millisecond delay before issuing a suggestion request.

---

### Requirement 4: Search Filters

**User Story:** As a user, I want to filter search results by category, location, rating, open status, and distance, so that I can narrow results to exactly what I need.

#### Acceptance Criteria

1. THE Search_Engine SHALL provide a filter panel containing: Category (multi-select from existing Business categories), Location (city or state text input), Minimum Rating (1–5 star selector), Open Now (boolean toggle), and Maximum Distance in km (slider: 1–100 km, requires user coordinates).
2. WHEN a user applies one or more filters, THE Search_Engine SHALL re-execute the search with those constraints and update the results page within 1 second.
3. WHEN the "Open Now" filter is active, THE Search_Engine SHALL exclude Business records whose `openingTime`–`closingTime` range does not include the current local time in Nigeria (UTC+1).
4. WHEN the Maximum Distance filter is active and the user's coordinates are unavailable, THE Search_Engine SHALL display a prompt asking the user to enable location access.
5. WHEN a user clears all filters, THE Search_Engine SHALL restore the unfiltered results for the current query.
6. THE Search_Engine SHALL reflect active filters as visible chips or tags above the results list so users can see and remove individual filters.

---

### Requirement 5: Knowledge Panel

**User Story:** As a user, I want to see a detailed business information card when I search for a specific business by name, so that I can get key details without clicking through to the full profile.

#### Acceptance Criteria

1. WHEN a search query matches a single Business name with a Relevance_Score above 8, THE Search_Engine SHALL display a Knowledge_Panel alongside the results list.
2. THE Knowledge_Panel SHALL display: business name, logo or cover image, category, star rating with review count, full address, phone number, website link (if present), WhatsApp link (if present), opening and closing times, and a "Get Directions" link.
3. WHEN the Business has active Offers, THE Knowledge_Panel SHALL display up to 3 active offers.
4. WHEN the Business has ServiceItems, THE Knowledge_Panel SHALL display up to 5 services with prices.
5. THE Knowledge_Panel SHALL include a "Write a Review" button that navigates authenticated users to the review form and prompts unauthenticated users to log in.

---

### Requirement 6: "People Also Search For" Suggestions

**User Story:** As a user, I want to see related search suggestions at the bottom of results, so that I can discover relevant businesses I might not have thought to search for.

#### Acceptance Criteria

1. THE Search_Engine SHALL display a "People Also Search For" section at the bottom of every results page containing 4 to 8 related query suggestions.
2. THE Search_Engine SHALL derive related suggestions from: co-occurring search terms in Search_History, sibling categories of the matched Business category, and city/state variants of the current query.
3. WHEN a user clicks a related suggestion, THE Search_Engine SHALL execute a new search for that suggestion.

---

### Requirement 7: Search History

**User Story:** As a logged-in user, I want my past searches to be saved, so that I can quickly repeat recent searches.

#### Acceptance Criteria

1. WHEN an authenticated user submits a search query, THE Search_Engine SHALL persist the query text, timestamp, and user ID to the Search_History store.
2. THE Search_Engine SHALL retain a maximum of 50 Search_History entries per user, discarding the oldest entry when the limit is exceeded.
3. WHEN an authenticated user focuses the search input with an empty value, THE Search_Engine SHALL display up to 5 most recent Search_History entries as suggestions.
4. WHEN an authenticated user selects a Search_History entry, THE Search_Engine SHALL execute a search for that query.
5. WHEN an authenticated user clicks "Clear History", THE Search_Engine SHALL delete all Search_History entries for that user.
6. THE Search_Engine SHALL store Search_History entries only for authenticated users; unauthenticated users SHALL NOT have their queries persisted.

---

### Requirement 8: Trending Searches

**User Story:** As a user, I want to see what other people are searching for, so that I can discover popular businesses and categories.

#### Acceptance Criteria

1. THE Search_Engine SHALL compute Trending_Searches by aggregating all search queries submitted within the past 24 hours and ranking them by frequency descending.
2. THE Search_Engine SHALL expose a maximum of 10 Trending_Searches on the homepage and in the Autocomplete_Service.
3. THE Search_Engine SHALL refresh the Trending_Searches list every 30 minutes.
4. THE Search_Engine SHALL exclude queries containing fewer than 2 characters from Trending_Searches computation.

---

### Requirement 9: Search Analytics (Impressions and Clicks)

**User Story:** As a business owner, I want to know how many times my listing appeared in search results and how many users clicked it, so that I can measure my visibility.

#### Acceptance Criteria

1. WHEN a Business result is rendered on a search results page, THE Search_Engine SHALL record an Impression event containing: business ID, search query, result position, result type (sponsored or organic), and timestamp.
2. WHEN a user clicks a Business result link, THE Search_Engine SHALL record a Click event containing: business ID, search query, result position, result type, and timestamp.
3. THE Search_Engine SHALL make Impression and Click counts available to the Business_Owner via the business analytics dashboard, aggregated by day, week, and month.
4. THE Search_Engine SHALL compute and display CTR for each Business result in the analytics dashboard as `(total_clicks / total_impressions) × 100`, rounded to 2 decimal places.
5. IF an Impression or Click event cannot be persisted due to a database error, THEN THE Search_Engine SHALL log the failure and continue serving the search result without interrupting the user experience.

---

### Requirement 10: Ad Campaign Creation

**User Story:** As a business owner, I want to create an ad campaign by choosing keywords, setting a bid, and defining a budget, so that my business appears at the top of relevant search results.

#### Acceptance Criteria

1. WHEN a Business_Owner navigates to the Ad_Dashboard, THE Ad_System SHALL display a "Create Campaign" form.
2. THE Ad_System SHALL require the following fields to create an Ad_Campaign: campaign name, at least 1 Keyword (maximum 20), CPC bid amount in NGN (minimum ₦10), Daily_Budget in NGN (minimum ₦500), and campaign start date.
3. THE Ad_System SHALL allow the Business_Owner to optionally set: a campaign end date, a Monthly_Budget, and an ad schedule (days of week and time ranges).
4. WHEN a Business_Owner submits a valid campaign creation form, THE Ad_System SHALL create the Ad_Campaign with status `ACTIVE` and a computed initial Quality_Score.
5. IF a Business_Owner submits a campaign creation form with a CPC bid below ₦10, THEN THE Ad_System SHALL reject the submission and display the error "Minimum bid is ₦10 per click".
6. IF a Business_Owner submits a campaign creation form with a Daily_Budget below ₦500, THEN THE Ad_System SHALL reject the submission and display the error "Minimum daily budget is ₦500".
7. THE Ad_System SHALL allow a Business_Owner to create a maximum of 10 active Ad_Campaigns per Business at any one time.

---

### Requirement 11: Keyword Targeting and Ad Auction

**User Story:** As a business owner, I want my ads to appear when users search for my targeted keywords, so that I reach customers who are actively looking for what I offer.

#### Acceptance Criteria

1. WHEN a user submits a search query, THE Ad_System SHALL identify all ACTIVE Ad_Campaigns whose Keyword list contains a term that matches the query (case-insensitive, partial match allowed).
2. THE Ad_System SHALL compute Ad_Rank for each eligible Ad_Campaign as `CPC_Bid × Quality_Score`.
3. THE Ad_System SHALL select the top 3 Ad_Campaigns by Ad_Rank to display as sponsored results.
4. WHEN two Ad_Campaigns have equal Ad_Rank, THE Ad_System SHALL rank the campaign with the higher Quality_Score first.
5. THE Ad_System SHALL only enter an Ad_Campaign into the auction if the campaign's Daily_Budget has not been exhausted for the current calendar day.
6. THE Ad_System SHALL only enter an Ad_Campaign into the auction if the current time falls within the campaign's scheduled active hours (if a schedule is defined).

---

### Requirement 12: Quality Score Computation

**User Story:** As a business owner, I want my ad quality to be rewarded with better placement, so that relevant, well-maintained listings outperform low-quality high-bidders.

#### Acceptance Criteria

1. THE Ad_System SHALL compute Quality_Score on a scale of 1 to 10 using the following weighted formula: keyword relevance to business category and description (40%), business profile completeness — logo, description, phone, address, opening hours all present (30%), and historical CTR of the Ad_Campaign (30%).
2. WHEN an Ad_Campaign has fewer than 100 Impressions, THE Ad_System SHALL use a default CTR of 2% for the Quality_Score computation.
3. THE Ad_System SHALL recompute Quality_Score for each Ad_Campaign every 24 hours.
4. THE Ad_System SHALL display the current Quality_Score to the Business_Owner in the Ad_Dashboard alongside a breakdown of each contributing factor.

---

### Requirement 13: Ad Budget Management

**User Story:** As a business owner, I want my ad spend to automatically stop when I reach my daily or monthly budget, so that I never overspend.

#### Acceptance Criteria

1. WHEN a Click event is recorded for a sponsored result, THE Ad_System SHALL deduct the CPC bid amount from the Ad_Campaign's remaining Daily_Budget and Monthly_Budget.
2. WHEN an Ad_Campaign's remaining Daily_Budget reaches ₦0, THE Ad_System SHALL immediately exclude that campaign from all subsequent auctions for the remainder of the calendar day.
3. WHEN an Ad_Campaign's remaining Monthly_Budget reaches ₦0, THE Ad_System SHALL immediately pause the campaign and set its status to `BUDGET_EXHAUSTED`.
4. THE Ad_System SHALL reset each Ad_Campaign's remaining Daily_Budget to the configured Daily_Budget value at midnight Nigeria time (UTC+1) each day.
5. THE Ad_System SHALL reset each Ad_Campaign's remaining Monthly_Budget to the configured Monthly_Budget value on the first day of each calendar month.
6. THE Ad_System SHALL display the remaining Daily_Budget and Monthly_Budget for each Ad_Campaign in the Ad_Dashboard, updated in real time after each click.

---

### Requirement 14: Ad Billing via Paystack

**User Story:** As a business owner, I want to be billed automatically for clicks on my ads, so that I only pay for actual user engagement.

#### Acceptance Criteria

1. THE Ad_System SHALL require a Business_Owner to add a Paystack-linked payment method before activating an Ad_Campaign.
2. WHEN an Ad_Campaign's accumulated unbilled click charges reach ₦1,000 or 7 days have elapsed since the last billing cycle (whichever comes first), THE Ad_System SHALL initiate a Paystack charge for the accumulated amount.
3. WHEN a Paystack charge succeeds, THE Ad_System SHALL record a Payment record with plan `AD_SPEND`, mark the corresponding click charges as billed, and send a billing confirmation email to the Business_Owner.
4. IF a Paystack charge fails, THEN THE Ad_System SHALL pause all Ad_Campaigns for that Business, set their status to `PAYMENT_FAILED`, and notify the Business_Owner by email.
5. THE Ad_System SHALL display a billing history table in the Ad_Dashboard showing: billing date, amount charged, number of clicks billed, and Paystack transaction reference.

---

### Requirement 15: Ad Campaign Management Dashboard

**User Story:** As a business owner, I want a dashboard to view, edit, pause, and delete my ad campaigns, so that I have full control over my advertising spend.

#### Acceptance Criteria

1. THE Ad_Dashboard SHALL display a table of all Ad_Campaigns for the authenticated Business_Owner, showing: campaign name, status, keywords, CPC bid, Daily_Budget, remaining Daily_Budget, total spend, total impressions, total clicks, CTR, and Quality_Score.
2. WHEN a Business_Owner clicks "Pause" on an ACTIVE Ad_Campaign, THE Ad_System SHALL set the campaign status to `PAUSED` and exclude it from all subsequent auctions within 5 seconds.
3. WHEN a Business_Owner clicks "Resume" on a PAUSED Ad_Campaign, THE Ad_System SHALL set the campaign status to `ACTIVE` and include it in subsequent auctions within 5 seconds.
4. WHEN a Business_Owner edits an Ad_Campaign's CPC bid or budget, THE Ad_System SHALL apply the new values to all subsequent auctions without affecting already-recorded click charges.
5. WHEN a Business_Owner deletes an Ad_Campaign, THE Ad_System SHALL set the campaign status to `DELETED` and retain all historical impression, click, and billing records for audit purposes.
6. THE Ad_Dashboard SHALL display performance charts showing daily impressions, clicks, and spend over the past 30 days for each Ad_Campaign.

---

### Requirement 16: Ad Scheduling

**User Story:** As a business owner, I want to schedule my ads to run only during specific days and hours, so that I don't waste budget when my target customers are not searching.

#### Acceptance Criteria

1. THE Ad_System SHALL allow a Business_Owner to define an ad schedule as a set of day-of-week and time-range pairs (e.g., Monday–Friday, 08:00–18:00 Nigeria time).
2. WHEN an Ad_Campaign has a defined schedule, THE Ad_System SHALL only enter it into the auction during the scheduled time windows.
3. WHEN an Ad_Campaign has no defined schedule, THE Ad_System SHALL treat it as active 24 hours a day, 7 days a week.
4. THE Ad_Dashboard SHALL display the current schedule for each Ad_Campaign and indicate whether the campaign is currently within its active window.

---

### Requirement 17: Admin Revenue Dashboard

**User Story:** As an admin, I want a revenue dashboard showing total ad revenue, clicks, and impressions across all businesses, so that I can monitor platform health and earnings.

#### Acceptance Criteria

1. THE Revenue_Dashboard SHALL display the following platform-wide metrics: total ad revenue (NGN) for today, this week, this month, and all time; total impressions; total clicks; platform-wide CTR; number of active Ad_Campaigns; and number of businesses with at least one Ad_Campaign.
2. THE Revenue_Dashboard SHALL display a time-series chart of daily ad revenue for the past 90 days.
3. THE Revenue_Dashboard SHALL display a leaderboard of the top 10 businesses by total ad spend for the current month.
4. THE Revenue_Dashboard SHALL display a table of all Ad_Campaigns across all businesses, filterable by status, business name, and date range.
5. WHEN an Admin clicks on a business in the Revenue_Dashboard, THE Revenue_Dashboard SHALL display that business's full campaign history, billing records, and performance metrics.
6. THE Revenue_Dashboard SHALL be accessible only to users with role `ADMIN`.

---

### Requirement 18: Location-Aware Ranking

**User Story:** As a user, I want businesses closer to me to appear higher in results, so that I find the most convenient options first.

#### Acceptance Criteria

1. WHEN a user grants location permission, THE Search_Engine SHALL retrieve the user's coordinates via the browser Geolocation API and include them in all subsequent search requests for the duration of the session.
2. WHEN user coordinates are available, THE Search_Engine SHALL compute the distance in km between the user and each Business using the Haversine formula.
3. WHEN user coordinates are available, THE Search_Engine SHALL apply the proximity boost defined in Requirement 1, Criterion 5 to the Relevance_Score of each Business.
4. THE Search_Engine SHALL display the computed distance (e.g., "2.4 km away") on each organic search result card when user coordinates are available.
5. IF the user denies location permission, THEN THE Search_Engine SHALL fall back to text-based location filtering using the Location filter field.

---

### Requirement 19: Search Result Serialisation and Round-Trip Integrity

**User Story:** As a developer, I want search result data to be correctly serialised and deserialised between the API and the frontend, so that no data is lost or corrupted in transit.

#### Acceptance Criteria

1. THE Search_Engine SHALL serialise each search result as a JSON object containing all fields defined in the Search_Index entry plus computed fields: `relevanceScore`, `distance` (nullable), `adRank` (nullable), `isSponsored` (boolean).
2. WHEN the Search_Engine serialises a search result to JSON and the frontend deserialises it, THE Search_Engine SHALL produce an object whose `id`, `name`, `category`, `city`, `state`, `rating`, `reviewCount`, and `isSponsored` fields are identical to the source Business record values.
3. FOR ALL valid search result objects, serialising then deserialising SHALL produce an object equal to the original (round-trip property).
4. IF a Business record contains a `null` value for an optional field, THEN THE Search_Engine SHALL serialise that field as `null` in the JSON response rather than omitting the key.

---

### Requirement 20: Ad Impression and Click Event Serialisation

**User Story:** As a developer, I want ad events to be reliably recorded and retrievable, so that billing and analytics are always accurate.

#### Acceptance Criteria

1. THE Ad_System SHALL serialise each Impression event as a JSON object containing: `eventId`, `campaignId`, `businessId`, `query`, `position`, `type` (`sponsored` | `organic`), `timestamp` (ISO 8601).
2. THE Ad_System SHALL serialise each Click event as a JSON object containing: `eventId`, `campaignId`, `businessId`, `query`, `position`, `type`, `timestamp` (ISO 8601), `cpcCharged` (NGN, 2 decimal places).
3. FOR ALL valid Click events, serialising then deserialising the event SHALL produce a `cpcCharged` value equal to the original CPC bid amount to 2 decimal places (round-trip property).
4. THE Ad_System SHALL assign a unique `eventId` to every Impression and Click event such that no two events share the same `eventId`.
