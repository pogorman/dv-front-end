# My Work — Architecture

**Application Name:** My Work
**Version:** 0.1.0
**Last Updated:** April 2026

---

## 1. High-Level Architecture

My Work is a React single-page application (SPA) hosted on Azure Static Web Apps. It connects to Microsoft Dataverse via the Web API for all data operations and embeds a Copilot Studio agent for conversational AI assistance.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │              My Work React SPA                          │  │
│   │                                                       │  │
│   │   ┌─────────────┐  ┌──────────┐  ┌───────────────┐  │  │
│   │   │  AppShell    │  │  Pages   │  │ CopilotChat   │  │  │
│   │   │  (sidebar +  │  │  (CRUD)  │  │ (Bot Framework│  │  │
│   │   │   top bar)   │  │          │  │  Web Chat)    │  │  │
│   │   └──────┬───────┘  └────┬─────┘  └──────┬────────┘  │  │
│   │          │               │               │            │  │
│   │          │        ┌──────▼──────┐  ┌─────▼─────────┐ │  │
│   │          │        │ dataverse   │  │ Direct Line   │ │  │
│   │          │        │ Service.ts  │  │ + SSO token   │ │  │
│   │          │        └──────┬──────┘  └──────┬────────┘ │  │
│   └──────────┼───────────────┼────────────────┼──────────┘  │
│              │               │                │              │
└──────────────┼───────────────┼────────────────┼──────────────┘
               │               │                │
        ┌──────▼───────┐  ┌───▼────────┐  ┌───▼──────────────┐
        │  Azure AD     │  │ Dataverse  │  │ Copilot Studio   │
        │  (MSAL)       │  │ Web API    │  │ Agent            │
        │               │  │ v9.2       │  │ (Bot Framework)  │
        └──────────────┘  └────────────┘  └──────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 19 + TypeScript | Component-based SPA |
| Component Library | Fluent UI v9 | Microsoft design system |
| Authentication | MSAL.js (@azure/msal-react) | Azure AD OAuth 2.0 / OIDC |
| Routing | React Router v7 | Client-side navigation |
| Backend Data | Microsoft Dataverse Web API | OData v4 REST API |
| AI Assistant | Copilot Studio + Bot Framework Web Chat | Conversational agent |
| Hosting | Azure Static Web Apps | Global CDN, auto SSL |
| Font | Inter (Google Fonts) | All UI text |
| Styling | Griffel (makeStyles) | CSS-in-JS, component-scoped |

---

## 3. Authentication Flow

```
┌──────────────┐         ┌────────────────┐
│ User visits  │         │ MSAL checks    │
│ My Work        ├────────►│ session cache   │
└──────────────┘         └───────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
               HAS TOKEN    NO TOKEN    INTERACTION
                    │            │        REQUIRED
                    ▼            ▼            │
          ┌────────────────┐ ┌──────────┐    │
          │ TokenProvider  │ │ Login    │    │
          │ Setup          │ │ Page     │◄───┘
          │ acquires token │ │ "Sign in │
          │ sets provider  │ │ with MS" │
          └────────┬──────┘ └──────────┘
                   │
                   ▼
          ┌────────────────┐
          │ AppShell +     │
          │ Route Pages    │
          │ (full app)     │
          └────────────────┘
```

1. `App.tsx` creates a `PublicClientApplication` instance from MSAL config
2. `MsalProvider` wraps the entire component tree
3. `AuthenticatedTemplate` / `UnauthenticatedTemplate` conditionally render:
   - **Unauthenticated** -> Login page with "Sign in with Microsoft" button
   - **Authenticated** -> `TokenProviderSetup` -> `AppShell` with all routes
4. `TokenProviderSetup` waits for `InteractionStatus.None`, then calls `setTokenProvider()`:
   - Tries `acquireTokenSilent` first (cached/refreshed token)
   - Falls back to `acquireTokenPopup` if interaction is required
5. Once the token provider is set, all child components can make authenticated Dataverse API calls

### Token Scopes

| Scope | Used For |
|-------|----------|
| `https://og-dv.crm.dynamics.com/.default` | All Dataverse Web API calls |
| `api://3c6a1f01.../mcs-read-scope` | Copilot Studio SSO token exchange |

---

## 4. Security Architecture

### Authentication Controls

- Azure AD single-tenant authentication required for all access
- MSAL.js handles OAuth 2.0 authorization code flow with PKCE
- Tokens stored in session storage (cleared on tab close)
- Silent token refresh with popup fallback

### Application Security

- No backend server -- all API calls go directly to Dataverse with user's delegated token
- Dataverse enforces row-level security based on the authenticated user
- No secrets in source code (Direct Line secret is the sole `.env` variable)
- SPA fallback routing handled by Azure Static Web Apps (no server-side routes to protect)

### Copilot Agent Security

- Direct Line secret exchanged for short-lived conversation token immediately
- SSO token scoped to bot's custom API -- cannot access Dataverse
- User identity passed from MSAL account to bot context
- File uploads disabled in Web Chat

---

## 5. Data Architecture

### Dataverse Environment

- **Environment URL:** `https://og-dv.crm.dynamics.com`
- **API Endpoint:** `https://og-dv.crm.dynamics.com/api/data/v9.2`
- **Publisher Prefix:** `tdvsp_` (for custom tables)

### Entity Relationship Diagram

```
                    ┌──────────────┐
                    │   accounts   │◄──────────────────────────────┐
                    │              │                                │
                    │  accountid   │◄── parentaccountid (self)     │
                    │  name        │                                │
                    └──────┬───────┘                                │
                           │                                        │
          ┌────────────────┼────────────────┬──────────────────┐   │
          │                │                │                  │   │
          ▼                ▼                ▼                  ▼   │
   ┌─────────────┐  ┌───────────┐  ┌──────────────┐  ┌────────────┴──┐
   │  contacts   │  │  impacts  │  │ action items │  │   projects    │
   │             │  │           │  │              │  │               │
   │ contactid   │  │ impactid  │  │ actionitemid │  │  projectid    │
   │ firstname   │  │ name      │  │ name         │  │  name         │
   │ lastname    │  │ desc      │  │ date         │  │  desc         │
   │ email       │  │ date      │  │ desc         │  │               │
   │ phone       │  │           │  │ taskstatus   │  └───────┬───────┘
   │ jobtitle    │  └───────────┘  │ priority     │          │
   └──────┬──────┘                 │ tasktype     │          │
          │                        └──────┬───────┘          │
          │                               │                  │
          │    ┌──────────────────────┐   │                  │
          │    │ meeting summaries    │   │                  │
          │    │                      │   │                  │
          │    │ meetingsummaryid     │   │                  │
          │    │ name                 │   │                  │
          │    │ date                 │   │                  │
          │    │ summary              │   │                  │
          │    └──────────────────────┘   │                  │
          │                               │                  │
          ▼                               ▼                  ▼
   ┌──────────────┐               ┌──────────────┐
   │    ideas     │               │ annotations  │ (polymorphic)
   │              │               │              │
   │ ideaid       │               │annotationid  │──► accounts
   │ name         │               │subject       │──► action items
   │ desc         │               │notetext      │──► ideas
   │ category     │               │filename      │──► projects
   │ priority     │               │documentbody  │
   │              │               │isdocument    │
   │ ◄── account  │               └──────────────┘
   │ ◄── contact  │
   │ ◄── project  │
   └──────────────┘

Notes: Ideas and Meeting Summaries both have a `tdvsp_Project` lookup to the projects table.
```

### Table Reference

| Entity | Dataverse Table | Primary Key | Lookup to Account |
|--------|----------------|-------------|-------------------|
| Accounts | `accounts` | `accountid` | `parentaccountid` (self) |
| Contacts | `contacts` | `contactid` | `parentcustomerid` |
| Action Items | `tdvsp_actionitems` | `tdvsp_actionitemid` | `tdvsp_Customer` |
| Impacts | `tdvsp_impacts` | `tdvsp_impactid` | `tdvsp_Customer` |
| Ideas | `tdvsp_ideas` | `tdvsp_ideaid` | `tdvsp_Account` + `tdvsp_Contact` + `tdvsp_Project` |
| Projects | `tdvsp_projects` | `tdvsp_projectid` | `tdvsp_Account` |
| Meeting Summaries | `tdvsp_meetingsummaries` | `tdvsp_meetingsummaryid` | `tdvsp_Account` + `tdvsp_Project` |
| Notes / Attachments | `annotations` | `annotationid` | `objectid` (polymorphic) |

### OData API Patterns

**Reading data with expanded lookups:**
```
GET /accounts?$select=accountid,name&$expand=parentaccountid($select=accountid,name)&$orderby=name asc&$top=100
```

**Creating records with lookup binding:**
```json
POST /tdvsp_actionitems
{
  "tdvsp_name": "Follow up on proposal",
  "tdvsp_date": "2026-02-16",
  "tdvsp_Customer@odata.bind": "/accounts(guid-here)"
}
```

**Deactivation (soft delete):**
```json
PATCH /tdvsp_actionitems(guid)
{
  "statecode": 1
}
```

**Fetching inactive records (My Board A/I toggle):**
```
GET /tdvsp_actionitems?$filter=statecode eq 1&$select=...&$orderby=...
```
Service functions `getActionItems`, `getIdeas`, and `getProjects` accept an optional `statecode` parameter (0 for active, 1 for inactive; defaults to 0). Other pages calling these functions are unaffected due to the default.

---

## 6. Application Component Architecture

### Provider Hierarchy

```
MsalProvider                    <- Azure AD context
  └─ ThemeProvider              <- Dark/light mode context
       └─ FluentProvider        <- Fluent UI theme tokens
            └─ BrowserRouter    <- Client-side routing
                 ├─ AuthenticatedTemplate
                 │    └─ TokenProviderSetup   <- Dataverse token gating
                 │         └─ Routes (AppShell + pages)
                 └─ UnauthenticatedTemplate
                      └─ LoginPage
```

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| AppShell | `components/AppShell.tsx` | Sidebar nav + top bar + main content area |
| CopilotChat | `components/CopilotChat.tsx` | Floating AI chat widget (Copilot Studio) |
| NotesTimeline | `components/NotesTimeline.tsx` | Reusable notes with attachments + pinning |
| TileColorPicker | `components/TileColorPicker.tsx` | Priority/color dot overlay for tiles |
| ThemeContext | `context/ThemeContext.tsx` | Dark/light mode state + localStorage persistence |
| dataverseService | `services/dataverseService.ts` | Centralized API layer (37 exported functions) |

### API Service Layer

All Dataverse calls route through a single `apiRequest` helper in `dataverseService.ts`:

- Acquires a fresh bearer token via the registered token provider on every call
- Sets standard OData headers (`OData-MaxVersion: 4.0`, `OData-Version: 4.0`)
- POST/PATCH requests include `Prefer: return=representation`
- Returns parsed JSON for successful responses; `null` for 204
- 37 exported functions covering CRUD for all 7 entities + annotations + related records

---

## 7. Deployment Architecture

### Azure Resources

| Resource | Type | Resource Group |
|----------|------|----------------|
| `dv-front-end` | Azure Static Web App | `rg-og-dv-spa-etc` |
| Custom domain | `ohgeesolutions.com` | Managed by Static Web Apps |

### Build and Deploy

```bash
# Build
npm run build    # react-scripts -> ./build/

# Deploy
npx @azure/static-web-apps-cli deploy ./build \
  --deployment-token "<token>" --env production
```

### Environment Variables

| Variable | Purpose | Set At |
|----------|---------|--------|
| `REACT_APP_COPILOT_DIRECT_LINE_SECRET` | Direct Line secret for Copilot chat | `.env` file (build-time) |
| `PORT` | Dev server port (defaults to 3000) | `.env` file (dev-time) |

Azure Static Web Apps handles: SPA fallback routing, HTTPS enforcement, global CDN, automatic SSL.

---

## 8. Copilot Studio Integration

### Architecture

```
CopilotChat Component
  1. User clicks rocket button
  2. Acquire SSO token (MSAL)
  3. Exchange DL secret -> conversation token
  4. Create Direct Line connection
  5. Create Web Chat store (SSO middleware)
  6. Send startConversation event
  7. Render Bot Framework Web Chat
  8. Reset button tears down connection and starts fresh
         │
         ▼
Bot Framework Direct Line
  Token endpoint: directline.botframework.com
         │
         ▼
Microsoft Copilot Studio Agent
  SSO: signin/tokenExchange invoke activity
  Greeting: startConversation event trigger
```

### SSO Token Exchange Flow

1. App acquires Azure AD token for the bot's custom scope
2. Bot sends `signin/tokenExchange` invoke activity
3. Web Chat store middleware intercepts and posts token back
4. Bot validates token and establishes authenticated context
5. No manual sign-in card or popup shown to the user

---

## 9. Design System

### Theme

- **Brand palette:** `ogBrand` based on `#4a9eff` blue
- **Font:** Inter everywhere (Google Fonts)
- **Dark theme:** `#0a0c10` bg, `#12151c` surface1, `#1a1e28` surface2
- **Borders:** `#252a36` -- subtle 1px borders preferred over shadows
- Cards: 8px borderRadius, 1px border, no boxShadow

### Entity Accent Colors

| Entity | Color | Hex |
|--------|-------|-----|
| Tasks | Red | `#f87171` |
| Ideas | Purple | `#a78bfa` |
| Impacts | Amber | `#f59e0b` |
| Accounts | Blue | `#4a9eff` |
| Contacts | Cyan | `#22d3ee` |
| Projects | Blue | `#4a9eff` |
| Meetings | Green | `#3dd68c` |

### DataGrid List View Pattern

All 8 entity pages use a consistent pattern:
- Fluent UI `DataGrid` inside a `Card` wrapper
- Card: `padding: "0px"`, `overflow: "hidden"`, accent-colored 3px left border
- Page header with filled icon + lowercase monospace title
- Choice fields as colored badge pills
- Clickable name links opening view dialogs
- Edit/deactivate action buttons
- **List/tile view toggle** in each page's toolbar switching between DataGrid (list) and 220px tile cards. View preference persisted to localStorage per page.

### Dashboard (Analytics)

The home page (`/`) is an analytics/insights dashboard showing KPI cards and charts computed from action item data. It fetches all action items via `getActionItems()` and renders:

- **KPI row**: 4 cards (Total Items, Completion Rate, In Progress, High/Top Priority) with accent-colored icon badges
- **Status breakdown**: SVG donut chart with color-coded segments and legend
- **Priority distribution**: Horizontal bar chart by priority level
- **Task types**: Stacked bar + individual breakdown by type (Personal, Work, Learning)
- **Items by account**: Horizontal bar chart showing top 8 accounts

Quick create buttons in the top bar navigate to entity pages with `?new=true`. Card entrance animations use `@keyframes dashCardIn` with staggered delays, and the page has a subtle dot-grid background (`dash-bg` class).

### My Board Layout

The board page (`/board`) uses a three-column layout filling viewport height, with a collapsible horizontal parking lot bar above the columns. Quick create buttons sit in a compact title bar row at the top and open inline dialogs. Columns left to right: Work (flex: 2) | Projects | Ideas. Each column has an accent-colored 3px left border, header (icon + title + count), and scrollable content area with vertical card list. The parking lot bar spans the full width above the columns, showing 200px-wide tiles flowing horizontally with scroll; it collapses/expands via a chevron (state persisted to localStorage).

- **Work column** includes a **w/p/l/a toggle** in the header to switch between work, personal, learning, and all action items.
- **Active/inactive toggle**: Each column header has a small A/I pill. Clicking "I" fetches inactive (deactivated) records. Service functions `getActionItems`, `getIdeas`, and `getProjects` accept an optional `statecode` parameter (0|1, defaults to 0).
- **Projects and Ideas columns** have deactivate (trash) and park (car) action buttons on each tile, same pattern as work items.
- **Drag-and-drop**: Items can be dragged from Work, Projects, or Ideas columns into the Parking Lot bar (auto-expands if collapsed). All column items can be reordered within their column via drag-and-drop. Custom ordering is persisted to localStorage.
- Clicking action items, ideas, or projects opens inline view/edit dialogs on the board without navigating away.

### My Board Tile Tooltips

All board tiles use Fluent UI `Tooltip` with `withArrow` and `showDelay={400}` to reveal full record details on hover. Content varies by tile type (work tiles show description/status/priority; project tiles show description/account; parking lot tiles show entity type). Tooltip positioning is `"above"` for work tiles and `"below"` for projects and parking lot tiles.

### Tile Color-Coding / Priority Dots

Tiles across entity pages and the dashboard show colored dot pickers on hover (top-right corner). The system has two modes:

| Mode | Entities | Storage | Behavior |
|------|----------|---------|----------|
| Priority-driven | Tasks, Ideas, Personal, My Board (work + ideas) | Dataverse `tdvsp_priority` | Selecting a dot updates the priority field via API; tile bg tints from priority value |
| Visual-only | Projects, My Board (projects + parking lot) | localStorage (`og-tile-colors`) | Selecting a dot stores color locally; no Dataverse update |

**Color mapping:** clear = no priority, blue = Low (`#4a9eff`), orange = Eh (`#f59e0b`), red = High (`#f87171`), dark red = Top Priority (`#b91c1c`).

Key files: `src/utils/tileColors.ts` (color/priority mapping, localStorage persistence), `src/components/TileColorPicker.tsx` (dot picker UI), CSS rule in `index.css` (`.tile-color-picker` opacity on hover).
