# O'G Central — Solution Document

**Application Name:** O'G Central
**Version:** 0.1.0
**Platform:** Web (Single Page Application)
**Hosting:** Azure Static Web Apps
**Custom Domain:** ohgeesolutions.com
**Last Updated:** February 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Security Architecture](#4-security-architecture)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Data Architecture](#6-data-architecture)
7. [Application Components](#7-application-components)
8. [Page Components](#8-page-components)
9. [Copilot Studio Integration](#9-copilot-studio-integration)
10. [Deployment & Infrastructure](#10-deployment--infrastructure)
11. [Configuration Reference](#11-configuration-reference)
12. [User Guide](#12-user-guide)
13. [Development Guide](#13-development-guide)
14. [Appendix](#appendix)

---

## 1. Executive Summary

O'G Central is an internal business management tool built as a React single-page application (SPA). It provides a unified interface for managing customer accounts, contacts, action items, projects, ideas, impacts, and meeting summaries. All data is stored in and retrieved from Microsoft Dataverse via its Web API.

The application is secured with Azure Active Directory (Azure AD) authentication, themed with Microsoft's Fluent UI design system, and deployed as an Azure Static Web App. An embedded AI assistant powered by Microsoft Copilot Studio provides conversational support directly within the app.

### Key Capabilities

- **Customer Relationship Management** — Track accounts, contacts, and their relationships
- **Task & Project Management** — Manage action items with status tracking and project organization
- **Idea Pipeline** — Capture and categorize ideas across technology domains
- **Impact Tracking** — Log and track business impacts
- **Meeting Documentation** — Record and retrieve meeting summaries by account
- **Notes & Attachments** — Attach notes with file uploads to accounts, tasks, ideas, and projects
- **Parking Lot** — Bookmark any dashboard record for quick access in a persistent sidebar panel
- **AI Assistant** — Conversational Copilot Studio agent embedded in the app via SSO
- **Dark/Light Theme** — User-selectable theme with system preference detection

---

## 2. Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         End User (Browser)                         │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    O'G Central React SPA                      │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌───────────────┐  │  │
│  │  │  MSAL   │  │ Fluent   │  │  React  │  │   Copilot     │  │  │
│  │  │ React   │  │ UI v9    │  │ Router  │  │   Chat Widget │  │  │
│  │  │         │  │          │  │  v7     │  │   (Web Chat)  │  │  │
│  │  └────┬────┘  └──────────┘  └─────────┘  └───────┬───────┘  │  │
│  │       │                                           │          │  │
│  │  ┌────┴────────────────────────────────┐  ┌──────┴───────┐  │  │
│  │  │       dataverseService.ts           │  │  Direct Line │  │  │
│  │  │       (API Layer)                   │  │  Connection  │  │  │
│  │  └────┬────────────────────────────────┘  └──────┬───────┘  │  │
│  └───────┼──────────────────────────────────────────┼───────────┘  │
└──────────┼──────────────────────────────────────────┼──────────────┘
           │ HTTPS + Bearer Token                     │ HTTPS + Token
           │                                          │
┌──────────▼──────────┐  ┌──────────┐  ┌─────────────▼──────────────┐
│  Microsoft Dataverse │  │  Azure   │  │  Microsoft Bot Framework   │
│  Web API (v9.2)      │  │  AD /    │  │  (Direct Line)             │
│                      │  │  Entra   │  │                            │
│  og-dv.crm.dynamics  │  │  ID      │  │  ┌──────────────────────┐  │
│  .com/api/data/v9.2  │  │          │  │  │  Copilot Studio      │  │
│                      │  │          │  │  │  Agent                │  │
│  ┌────────────────┐  │  │          │  │  │                      │  │
│  │ accounts       │  │  │          │  │  └──────────────────────┘  │
│  │ contacts       │  │  │          │  │                            │
│  │ tdvsp_*        │  │  │          │  └────────────────────────────┘
│  │ annotations    │  │  │          │
│  └────────────────┘  │  │          │
└──────────────────────┘  └──────────┘

┌──────────────────────────────────────┐
│  Azure Static Web Apps               │
│  (dv-front-end)                       │
│  Resource Group: rg-og-dv-spa-etc     │
│  Custom Domain: ohgeesolutions.com    │
└──────────────────────────────────────┘
```

### Request Flow

1. **User opens app** → Azure Static Web App serves the built React SPA
2. **Authentication** → MSAL redirects to Azure AD for login; token is cached in `sessionStorage`
3. **Data access** → Each API call acquires a Dataverse-scoped token silently, then calls the Web API with `Bearer` auth
4. **Copilot chat** → A separate SSO token is acquired for the bot scope; the Direct Line secret is exchanged for a conversation token; Web Chat communicates with Copilot Studio

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19.x | UI rendering and component model |
| **Language** | TypeScript | 4.9.x | Type safety and developer experience |
| **UI Library** | Fluent UI v9 | 9.72.x | Microsoft design system components |
| **Icons** | @fluentui/react-icons | 2.0.x | Fluent icon set |
| **Authentication** | @azure/msal-browser + msal-react | 5.x | Azure AD / Entra ID integration |
| **Routing** | react-router-dom | 7.x | Client-side navigation |
| **AI Chat** | botframework-webchat | 4.18.x | Copilot Studio embedded chat |
| **Build Tool** | react-scripts (CRA) | 5.0.1 | Build, dev server, test runner |
| **Hosting** | Azure Static Web Apps | — | Global CDN-backed static hosting |
| **Backend** | Microsoft Dataverse | Web API v9.2 | Data storage and OData REST API |
| **Identity** | Azure AD / Entra ID | — | Enterprise SSO and token management |
| **AI Platform** | Microsoft Copilot Studio | — | Conversational AI agent |

---

## 4. Security Architecture

### Authentication Security

| Control | Implementation |
|---------|---------------|
| **Identity Provider** | Azure AD (Entra ID), tenant `125ec668-dcca-47ba-9487-0304f441b3f1` |
| **Protocol** | OAuth 2.0 / OpenID Connect via MSAL |
| **Token Storage** | `sessionStorage` (cleared when browser tab closes) |
| **Token Lifetime** | Managed by Azure AD; MSAL handles silent refresh |
| **Login Method** | Redirect-based (no popup for primary auth) |
| **Logout** | `instance.logoutRedirect()` clears session and redirects |
| **PII Logging** | Disabled — MSAL logger filters PII before console output |

### Application Security

| Control | Implementation |
|---------|---------------|
| **Transport** | HTTPS enforced (Azure Static Web Apps) |
| **CORS** | Managed by Dataverse (allows registered app origins) |
| **API Auth** | Every Dataverse call includes `Authorization: Bearer <token>` |
| **No Server-Side Code** | SPA-only — no server components, API keys stay in env vars at build time |
| **Input Handling** | React's JSX auto-escapes user content (XSS protection) |
| **Content Security** | Azure Static Web Apps default headers |

### Copilot Agent Security

| Control | Implementation |
|---------|---------------|
| **Direct Line Secret** | Stored in `.env` as `REACT_APP_COPILOT_DIRECT_LINE_SECRET`; baked into build at compile time (not exposed as a runtime API key) |
| **Token Exchange** | The Direct Line secret is exchanged server-side-equivalent for a scoped conversation token before any chat begins — the secret itself is never sent to the bot |
| **SSO Integration** | User's Azure AD token (scoped to `api://3c6a1f01-09c5-49c7-8be7-48c33e177432/mcs-read-scope`) is exchanged with the bot for authenticated context |
| **Token Exchange Flow** | When the bot sends a `signin/tokenExchange` invoke, the app responds with the user's SSO token — no manual login prompt is shown |
| **Conversation Isolation** | Each chat session gets a unique conversation token; user identity is passed from MSAL account info |
| **Upload Restriction** | File upload button is hidden in Web Chat (`hideUploadButton: true`) |

### Azure AD App Registration

| Setting | Value |
|---------|-------|
| **Client ID** | `3c6a1f01-09c5-49c7-8be7-48c33e177432` |
| **Authority** | `https://login.microsoftonline.com/125ec668-dcca-47ba-9487-0304f441b3f1` |
| **Redirect URI** | `window.location.origin` (dynamic — works in dev and production) |
| **Exposed API Scope** | `api://3c6a1f01-09c5-49c7-8be7-48c33e177432/mcs-read-scope` (for Copilot SSO) |
| **Bot Redirect URI** | `https://token.botframework.com/.auth/web/redirect` (Web platform) |
| **API Permission** | `https://api.powerplatform.com/.default` |
| **Dataverse Scope** | `https://og-dv.crm.dynamics.com/.default` |

### Secret Management

| Secret | Storage | Notes |
|--------|---------|-------|
| **MSAL Client ID** | Source code (`msalConfig.ts`) | Public client — no client secret needed for SPAs |
| **Direct Line Secret** | `.env` file → compiled into JS bundle | Exchanged for short-lived token before use; `.env` excluded from git |
| **Azure AD Tokens** | `sessionStorage` | Managed by MSAL; auto-refresh; cleared on tab close |
| **Deployment Token** | Azure CLI retrieval only | Never stored in code; used only during CI/CD deploy command |

---

## 5. Authentication & Authorization

### Login Flow

```
User opens app
    │
    ▼
┌─────────────────────┐
│ MsalProvider wraps   │
│ entire React tree    │
└─────────┬───────────┘
          │
    ┌─────▼──────┐         ┌────────────────┐
    │Authenticated│─ YES ──▶│TokenProviderSetup│
    │  Template?  │         │ acquires token   │
    └─────┬──────┘         │ sets provider    │
          │                 └────────┬────────┘
          NO                        │
          │                         ▼
    ┌─────▼──────┐         ┌────────────────┐
    │ Login Page │         │ AppShell +      │
    │ "Sign in   │         │ Route Pages     │
    │ with MS"   │         │ (full app)      │
    └────────────┘         └────────────────┘
```

1. `App.tsx` creates a `PublicClientApplication` instance from MSAL config
2. `MsalProvider` wraps the entire component tree
3. `AuthenticatedTemplate` / `UnauthenticatedTemplate` conditionally render:
   - **Unauthenticated** → `LoginPage` with "Sign in with Microsoft" button
   - **Authenticated** → `TokenProviderSetup` → `AppShell` with all routes
4. `TokenProviderSetup` waits for `InteractionStatus.None`, then calls `setTokenProvider()` with a function that:
   - Tries `acquireTokenSilent` first (cached/refreshed token)
   - Falls back to `acquireTokenPopup` if interaction is required
5. Once the token provider is set, all child components can make authenticated Dataverse API calls

### Token Scopes

| Scope | Used For |
|-------|----------|
| `https://og-dv.crm.dynamics.com/.default` | All Dataverse Web API calls |
| `api://3c6a1f01-09c5-49c7-8be7-48c33e177432/mcs-read-scope` | Copilot Studio SSO token exchange |

---

## 6. Data Architecture

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
   │  contacts   │  │tdvsp_hvas │  │tdvsp_action  │  │tdvsp_projects │
   │             │  │           │  │  items       │  │               │
   │ contactid   │  │tdvsp_hvaid│  │tdvsp_action  │  │tdvsp_projectid│
   │ firstname   │  │tdvsp_name │  │  itemid      │  │tdvsp_name     │
   │ lastname    │  │tdvsp_desc │  │tdvsp_name    │  │tdvsp_desc     │
   │ email       │  │tdvsp_date │  │tdvsp_date    │  │               │
   │ phone       │  │           │  │tdvsp_desc    │  └───────┬───────┘
   │ jobtitle    │  └───────────┘  │tdvsp_task    │          │
   └──────┬──────┘                 │  status      │          │
          │                        │tdvsp_priority│          │
   │                        │tdvsp_tasktype│          │
          │                        └──────┬───────┘          │
          │                               │                  │
          │    ┌──────────────┐           │                  │
          │    │tdvsp_impacts │           │                  │
          │    │              │           │                  │
          │    │tdvsp_impactid│           │                  │
          │    │tdvsp_name    │           │                  │
          │    │tdvsp_desc    │           │                  │
          │    │tdvsp_date    │           │                  │
          │    └──────────────┘           │                  │
          │                               │                  │
          │    ┌──────────────────────┐   │                  │
          │    │tdvsp_meeting         │   │                  │
          │    │  summaries           │   │                  │
          │    │                      │   │                  │
          │    │tdvsp_meetingsummaryid│   │                  │
          │    │tdvsp_name            │   │                  │
          │    │tdvsp_date            │   │                  │
          │    │tdvsp_summary         │   │                  │
          │    └──────────────────────┘   │                  │
          │                               │                  │
          ▼                               ▼                  ▼
   ┌──────────────┐               ┌──────────────┐
   │ tdvsp_ideas  │               │ annotations  │ (polymorphic)
   │              │               │              │
   │tdvsp_ideaid  │               │annotationid  │──► accounts
   │tdvsp_name    │               │subject       │──► tdvsp_actionitems
   │tdvsp_desc    │               │notetext      │──► tdvsp_ideas
   │tdvsp_category│               │filename      │──► tdvsp_projects
   │              │               │documentbody  │
   │ ◄── account  │               │isdocument    │
   │ ◄── contact  │               └──────────────┘
   └──────────────┘
```

### Table Reference

| Entity | Dataverse Table | Primary Key | Lookup to Account |
|--------|----------------|-------------|-------------------|
| Accounts | `accounts` | `accountid` | `parentaccountid` (self-referencing) |
| Contacts | `contacts` | `contactid` | `parentcustomerid` |
| Action Items | `tdvsp_actionitems` | `tdvsp_actionitemid` | `tdvsp_Customer` |
| Impacts | `tdvsp_impacts` | `tdvsp_impactid` | `tdvsp_Customer` |
| Ideas | `tdvsp_ideas` | `tdvsp_ideaid` | `tdvsp_Account` + `tdvsp_Contact` |
| Projects | `tdvsp_projects` | `tdvsp_projectid` | `tdvsp_Account` |
| Meeting Summaries | `tdvsp_meetingsummaries` | `tdvsp_meetingsummaryid` | `tdvsp_Account` |
| Notes / Attachments | `annotations` | `annotationid` | `objectid` (polymorphic) |

### Choice Fields

**Idea Category** (`tdvsp_category`):

| Value | Label |
|-------|-------|
| 468510000 | Copilot Studio |
| 468510001 | Canvas Apps |
| 468510002 | Model-Driven Apps |
| 468510003 | Power Automate |
| 468510004 | Power Pages |
| 468510005 | Azure |
| 468510006 | AI General |
| 468510007 | App General |
| 468510008 | Other |

**Task Status** (`tdvsp_taskstatus`):

| Value | Label |
|-------|-------|
| 468510000 | Recognized/Pondering |
| 468510001 | In Progress |
| 468510002 | Pending Communication |
| 468510003 | On Hold |
| 468510004 | Wrapping Up |
| 468510005 | Complete |

**Task Priority** (`tdvsp_priority`):

| Value | Label |
|-------|-------|
| 468510000 | Low... but on deck for sure |
| 468510001 | Eh... Get to it when you can |
| 468510002 | Top priority... no kidding! |
| 468510003 | High... next in line after top priority... |

**Task Type** (`tdvsp_tasktype`):

| Value | Label |
|-------|-------|
| 468510000 | Personal |
| 468510001 | Work |

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

**Reading lookup values:** Lookup IDs are returned as `_fieldname_value` properties (e.g., `_tdvsp_customer_value`). Navigation properties are accessed via `$expand`.

---

## 7. Application Components

### 7.1 App Entry Point (`App.tsx`)

The root component establishes the provider hierarchy:

```
MsalProvider                    ← Azure AD context
  └─ ThemeProvider              ← Dark/light mode context
       └─ FluentProvider        ← Fluent UI theme (Microsoft brand colors)
            └─ BrowserRouter    ← Client-side routing
                 ├─ AuthenticatedTemplate
                 │    └─ TokenProviderSetup   ← Dataverse token gating
                 │         └─ Routes (AppShell + pages)
                 └─ UnauthenticatedTemplate
                      └─ LoginPage
```

**Key behaviors:**
- Custom Microsoft brand color ramp (16 shades) generates both light and dark Fluent themes
- `TokenProviderSetup` blocks rendering until the token provider function is registered with `dataverseService`
- Token acquisition uses silent refresh with popup fallback

### 7.2 AppShell (`components/AppShell.tsx`)

The application shell provides the persistent layout for all authenticated pages.

**Layout:**
- **Sidebar** (left) — Collapsible (260px expanded / 56px collapsed), with brand logo, sectioned navigation, user info, and sign-out
- **Top Bar** — Page title (dynamic from route) + dark/light theme toggle
- **Main Content** — `<Outlet />` renders the active route's page component
- **Copilot Chat** — Floating button (bottom-right) rendered outside the main content flow

**Navigation Sections & Icons:**
1. **Dashboard** (top, standalone) — Home icon
2. **Core:** Accounts (Building), Contacts (Person), Projects (Briefcase), Meeting Summaries (PeopleTeam)
3. **Activity:** Action Items (CheckboxChecked), Ideas (LightbulbFilament), Impacts (Flash)
4. **About this site** (bottom) — Info icon

**Features:**
- Active route is highlighted with brand color background
- Collapsed mode shows icons only with tooltips
- User avatar with initials displayed at bottom of sidebar
- Animated collapse/expand transition (0.2s ease)

### 7.3 CopilotChat (`components/CopilotChat.tsx`)

Floating chat widget connected to a Microsoft Copilot Studio agent. See [Section 9](#9-copilot-studio-integration) for full details.

### 7.4 NotesTimeline (`components/NotesTimeline.tsx`)

Reusable notes component used by Accounts, Action Items, Ideas, and Projects.

**Props:**
| Prop | Type | Example |
|------|------|---------|
| `entityId` | `string` | The GUID of the parent record |
| `entityName` | `string` | Display name (shown when pinning) |
| `entityType` | `NoteEntityType` | `"account"`, `"actionitem"`, `"idea"`, `"project"` |
| `odataBindKey` | `string` | `"objectid_account@odata.bind"` |
| `entitySetPath` | `string` | `"/accounts"` |

**Features:**
- Lists notes for the entity in reverse-chronological order (max 50)
- Add notes with optional file attachments (stored as base64 in Dataverse `annotations`)
- Pin/unpin notes to the Dashboard
- Download attached files (base64 → Blob → download link)
- Delete notes (also unpins if pinned)
- Loading spinner and empty state

### 7.5 ThemeContext (`context/ThemeContext.tsx`)

React context provider for dark/light mode.

**Behavior:**
1. On first visit, checks `localStorage` for saved preference
2. If none, falls back to system preference (`prefers-color-scheme: dark`)
3. Defaults to light mode
4. Persists changes to `localStorage` under key `og-central-theme`
5. Provides `themeMode`, `isDark`, and `toggleTheme()` to consumers

### 7.6 Dataverse Service (`services/dataverseService.ts`)

Centralized API layer — all Dataverse Web API calls route through a single `apiRequest` helper.

**Core function:**
```typescript
async function apiRequest(endpoint: string, method: string = "GET", body?: unknown)
```

- Acquires a fresh bearer token via the registered token provider on every call
- Sets standard OData headers (`OData-MaxVersion: 4.0`, `OData-Version: 4.0`)
- POST/PATCH requests include `Prefer: return=representation` to get the created/updated record back
- Returns parsed JSON for successful responses; `null` for 204 (No Content)
- Throws descriptive errors with status code and response body

**Exported functions (37 total):**

| Category | Functions |
|----------|-----------|
| Accounts | `getAccounts`, `createAccount`, `updateAccount`, `deleteAccount` |
| Contacts | `getCustomers`, `createCustomer`, `updateCustomer`, `deleteCustomer` |
| Action Items | `getActionItems`, `createActionItem`, `updateActionItem`, `deleteActionItem` |
| Impacts | `getImpacts`, `createImpact`, `updateImpact`, `deleteImpact` |
| Ideas | `getIdeas`, `createIdea`, `updateIdea`, `deleteIdea` |
| Projects | `getProjects`, `createProject`, `updateProject`, `deleteProject` |
| Meeting Summaries | `getMeetingSummaries`, `createMeetingSummary`, `updateMeetingSummary`, `deleteMeetingSummary` |
| Annotations | `getAnnotations`, `createEntityAnnotation`, `deleteAnnotation`, `getAnnotationWithBody`, `getAnnotationsByIds` |
| Related Records | `getContactsByAccount`, `getActivitiesByAccount`, `getActionItemsByAccount`, `getImpactsByAccount`, `getIdeasByAccount`, `getMeetingSummariesByAccount`, `getProjectsByAccount`, `getIdeasByContact` |

### 7.7 Utility Functions

**`utils/formatDate.ts`** — Formats ISO date strings to `M/D/YYYY` format.

**`utils/pinnedNotes.ts`** — Manages pinned note references in `localStorage`:
- `getPinnedNoteRefs()` — Retrieves all pinned note references (with migration from old schema)
- `pinNote(annotationid, entityName, entityType)` — Adds a note to pinned list
- `unpinNote(annotationid)` — Removes a note from pinned list
- `isNotePinned(annotationid)` — Checks if a note is pinned
- Storage key: `og-central-pinned-notes`

**`utils/parkingLot.ts`** — Manages "parked" (bookmarked) item references in `localStorage`:
- `ParkedItemRef { id, name, entityType, route }` — Reference to a parked record
- `ParkedEntityType` — Union: `"actionitem" | "idea" | "account" | "contact" | "project" | "impact" | "summary"`
- `getParkedItems()` — Retrieves all parked item references
- `parkItem(ref)` — Adds an item to the parking lot (no duplicates)
- `unparkItem(id)` — Removes an item from the parking lot
- `isItemParked(id)` — Checks if an item is parked
- Storage key: `og-central-parking-lot`

### 7.8 Type Definitions (`types/index.ts`)

All TypeScript interfaces are centralized in a single file:

| Interface | Represents |
|-----------|-----------|
| `Account` | Account records with optional parent account lookup |
| `Customer` | Contact records with account lookup |
| `ActionItem` | Task records with status, priority, type, date, and account lookup |
| `Impact` | Impact records with account lookup |
| `Idea` | Idea records with category, account, and contact lookups |
| `Project` | Project records with account lookup |
| `MeetingSummary` | Meeting summary records with account lookup |
| `Annotation` | Notes with optional file attachment fields |
| `NoteEntityType` | Union type: `"account" \| "project" \| "actionitem" \| "idea"` |
| `IdeaCategory` | Numeric union type for idea category choices |
| `TaskStatus` | Numeric union type for task status choices |
| `TaskPriority` | Numeric union type for task priority choices |
| `TaskType` | Numeric union type for task type choices (Personal, Work) |

---

## 8. Page Components

All pages follow consistent patterns:
- **Fluent UI makeStyles** for scoped styles
- **useState/useEffect** for data loading
- **Search/filter** via text input
- **Dialog-based CRUD** (New, View/inline Edit, Delete)
- **Inline edit** in view dialogs — `isEditing` state toggles fields between read-only and editable; `openView` resets edit state to prevent leaking between records
- **Save progress** — `saving` state disables buttons with spinner during save/update/delete, preventing double-submissions
- **`?new=true` query parameter** to auto-open the create dialog
- **Loading spinners** and **empty states** with icons

### 8.1 Dashboard (`pages/Dashboard.tsx`)

The landing page providing an at-a-glance overview.

**Layout:** Two-column layout — `dashboardMain` (flex-grow) + `rightSidebar` (280px fixed). The right sidebar spans full height.

**Main Column (top to bottom):**
1. **Quick Create Bar** — Steel blue gradient banner (`#4682B4` → `#5A9BC9`) with white "Quick Create" label and pill buttons (Action Item, Project, Summary, Idea, Impact, Account, Contact) — create any record type without leaving the dashboard. Save buttons disable with spinner during save.
2. **Stats Grid** — 7 compact quick-launch tiles in a fixed row:
   - Accounts (blue) — total count
   - Contacts (purple) — total count
   - Projects (indigo) — total count
   - Summaries (teal) — total count
   - Action Items (green) — total count
   - Ideas (amber) — total count
   - Impacts (red) — total count
3. **Work Card** — Card with red left accent border and Briefcase icon showing all non-complete, non-personal action items. Contains a "Top Priority" sub-section (red warning icon + label) for top-priority items, followed by remaining items. Scrollable with max-height (~4 items visible). Each item shows name, due date, status, account, overdue/upcoming badge, bookmark icon, and delete icon with confirmation. Only visible when matching items exist.
4. **Personal Card** — Card with teal left accent border and Home icon showing all non-complete personal action items. Contains a "Top Priority" sub-section (red warning icon + label) for top-priority personal items, followed by remaining items. Scrollable with max-height (~4 items visible). Each item shows name, due date, status, overdue/upcoming badge, bookmark icon, and delete icon with confirmation. Only visible when incomplete personal items exist.
5. **Section Cards** (2-column grid, 180px max-height with scroll):
   - **Action Items** — Latest 8 items with due date, status, priority, and account name; badge (Overdue/Upcoming/Complete); bookmark and delete icons per item
   - **Ideas** — Latest 8 items showing name, category, account on line 1; description preview on line 2; bookmark and delete icons per item

**Right Sidebar (top to bottom):**
7. **Parking Lot Panel** — Bookmarked items for quick access. Items can be parked from any dashboard list via the bookmark icon (Bookmark16Regular/Filled). Shows entity type label and item name. Click navigates to the record; X button removes from lot. Uses `parkingLot.ts` for localStorage persistence.
8. **Pinned Notes Panel** — Appears when notes are pinned; grows to fill remaining sidebar space. Shows entity type label, date, subject, 3-line preview, attachment indicator; click to expand in dialog; unpin from dialog.

**Save Progress:** All quick-create save buttons use the `saving` state pattern — disabled with `<Spinner size="tiny" /> Saving...` while in progress, preventing double-submissions.

**Data loaded on mount:** Accounts, Contacts, Projects, Action Items, Ideas, Impacts, Meeting Summaries, Pinned Annotations, Parked Items (from localStorage)

### 8.2 Accounts (`pages/Accounts.tsx`)

Full CRUD management for customer accounts.

**Main View:** DataGrid with columns: Name (clickable), Parent Account, Actions (Edit, Delete)

**View Dialog:** Three-column layout showing all related records:
- **Column 1:** Contacts, Action Items, Ideas — each with inline "Add" buttons
- **Column 2:** Impacts, Meeting Summaries — each with inline "Add" buttons
- **Column 3:** Notes Timeline component

**Forms:** Name (required), Parent Account (dropdown of existing accounts)

### 8.3 Contacts (`pages/Contacts.tsx`)

CRUD for contact records linked to accounts.

**Main View:** DataGrid with columns: Name (clickable), Email, Phone, Job Title, Account, Actions

**View Dialog:** Contact details in a 2-column grid + Related Ideas section (full width below)

**Forms:** First Name, Last Name (required), Email, Phone, Job Title, Account (dropdown)

### 8.4 Action Items / Tasks (`pages/Tasks.tsx`)

Task management with status tracking.

**Main View:** DataGrid with columns: Date, Name (clickable), Task Status, Priority, Type, Customer, Description, Created On, Actions

**View Dialog:** Two-column layout — Details (name, description, date, status, priority, type, customer, created on) on the left, Notes Timeline on the right

**Forms:** Name (required), Date, Account (dropdown), Task Status (6-option dropdown), Priority (4-option dropdown), Task Type (Personal/Work dropdown), Description (textarea)

**Task Status Workflow:** Recognized/Pondering → In Progress → Pending Communication → On Hold → Wrapping Up → Complete

**Task Priority Options:** Low... but on deck for sure | Eh... Get to it when you can | Top priority... no kidding! | High... next in line after top priority...

### 8.5 Ideas (`pages/Ideas.tsx`)

Idea pipeline with technology categorization.

**Main View:** Responsive card grid (min 340px per card) showing name, description preview, category badge, account, and contact

**View Dialog:** Two-column layout — Details on the left, Notes Timeline on the right

**Forms:** Name (required), Category (9-option dropdown), Account (dropdown), Contact (dropdown), Description (textarea)

### 8.6 Projects (`pages/Projects.tsx`)

Project tracking with notes.

**Main View:** Responsive card grid showing name, description preview (2-line clamp), and account

**View Dialog:** Two-column layout — Details on the left, Notes Timeline on the right

**Forms:** Name (required), Account (dropdown), Description (textarea)

### 8.7 Impacts (`pages/Impacts.tsx`)

Tracking business impacts.

**Main View:** Responsive card grid with trophy icon, calendar date display, and account

**View Dialog:** Simple detail view (no notes timeline)

**Forms:** Name (required), Date (required), Account (dropdown), Description (textarea)

### 8.8 Meeting Summaries (`pages/MeetingSummaries.tsx`)

Meeting documentation with extended text support.

**Main View:** Responsive card grid with notebook icon, summary preview (150 chars), date, and account

**View Dialog:** Two-column layout — Details on the left, Summary textarea on the right

**Forms:** Name (required), Date, Account (dropdown), Summary (textarea, 5000 char max with live counter)

**Dialog width:** 700px (wider than standard to accommodate summary text)

### 8.9 About (`pages/About.tsx`)

Static informational page about the application.

**Layout:** Single card (max-width 720px) with rows showing:
- Platform (React SPA on Azure Static Web Apps)
- Backend (Microsoft Dataverse Web API)
- Authentication (Azure AD / MSAL)
- UI Framework (Fluent UI v9)
- Domain (ohgeesolutions.com)

### 8.11 Login (`pages/Login.tsx`)

Displayed to unauthenticated users.

**Layout:** Centered card on blue gradient background with:
- Shield icon
- "O'G Central" heading
- "Sign in to access your dashboard" description
- "Sign in with Microsoft" button → triggers `instance.loginRedirect(loginRequest)`

---

## 9. Copilot Studio Integration

### Overview

The app includes a floating AI chat widget (bottom-right corner) connected to a Microsoft Copilot Studio agent. This provides conversational assistance within the app without leaving the current page.

### Architecture

```
┌─────────────────────────────────────────────┐
│ CopilotChat Component                        │
│                                               │
│  1. User clicks O'G logo button               │
│  2. Acquire SSO token (MSAL)                  │
│  3. Exchange DL secret → conversation token   │
│  4. Create Direct Line connection             │
│  5. Create Web Chat store (SSO middleware)     │
│  6. Send startConversation event              │
│  7. Render Bot Framework Web Chat             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ Bot Framework Direct Line                    │
│                                               │
│  Token endpoint:                              │
│  directline.botframework.com/v3/directline/   │
│  tokens/generate                              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ Microsoft Copilot Studio Agent               │
│                                               │
│  SSO: signin/tokenExchange invoke activity    │
│  Greeting: startConversation event trigger    │
│  Avatar: /images/og_logo_white.png            │
└─────────────────────────────────────────────┘
```

### SSO Token Exchange Flow

1. App acquires Azure AD token for scope `api://3c6a1f01-09c5-49c7-8be7-48c33e177432/mcs-read-scope`
2. When the bot sends a `signin/tokenExchange` invoke activity, the Web Chat store middleware intercepts it
3. The middleware posts a `signin/tokenExchange` event back with the user's SSO token
4. The bot validates the token and establishes authenticated context
5. No manual sign-in card or popup is shown to the user

### Security Controls

- **Direct Line Secret** is compiled into the build (not a runtime secret) and is immediately exchanged for a short-lived conversation token
- **SSO token** is scoped specifically to the bot's custom API scope — it cannot access Dataverse or other resources
- **User identity** is passed from the MSAL account (localAccountId + name) to the bot
- **File uploads** are disabled in the Web Chat configuration
- **Conversation persistence** — The Direct Line connection is maintained while the panel is open; closing and reopening preserves the conversation

### Theming

The Web Chat adapts to the app's current theme:
- Background, bubble colors, send box colors, and text colors all respond to dark/light mode
- Bot avatar uses the O'G logo (`/images/og_logo_white.png`)
- User avatar shows "You" initials
- Font matches the app (`Segoe UI`)

---

## 10. Deployment & Infrastructure

### Azure Resources

| Resource | Type | Resource Group |
|----------|------|----------------|
| `dv-front-end` | Azure Static Web App | `rg-og-dv-spa-etc` |
| Custom domain | `ohgeesolutions.com` | Managed by Static Web Apps |

### Build Process

```bash
npm run build    # Creates optimized production build in ./build/
```

This runs `react-scripts build` which:
1. Compiles TypeScript
2. Bundles all JavaScript with webpack
3. Injects environment variables prefixed with `REACT_APP_`
4. Minifies and optimizes for production
5. Outputs to `./build/` directory

### Deployment Commands

```bash
# Step 1: Authenticate with Azure
az login

# Step 2: Retrieve deployment token
"C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd" staticwebapp secrets list \
  --name dv-front-end \
  --resource-group rg-og-dv-spa-etc \
  --query "properties.apiKey" -o tsv

# Step 3: Build
npm run build

# Step 4: Deploy to production
npx @azure/static-web-apps-cli deploy ./build --deployment-token "<token>" --env production
```

### Environment Variables

| Variable | Purpose | Set At |
|----------|---------|--------|
| `REACT_APP_COPILOT_DIRECT_LINE_SECRET` | Direct Line secret for Copilot chat | `.env` file (build-time) |

### Static Web App Configuration

The app is a client-side SPA. Azure Static Web Apps automatically handles:
- SPA fallback routing (all paths serve `index.html`)
- HTTPS enforcement
- Global CDN distribution
- Custom domain with automatic SSL certificate

---

## 11. Configuration Reference

### MSAL Configuration (`src/auth/msalConfig.ts`)

```typescript
{
  auth: {
    clientId: "3c6a1f01-09c5-49c7-8be7-48c33e177432",
    authority: "https://login.microsoftonline.com/125ec668-dcca-47ba-9487-0304f441b3f1",
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",    // Tokens cleared on tab close
  }
}
```

### Dataverse Configuration

```typescript
{
  baseUrl: "https://og-dv.crm.dynamics.com/api/data/v9.2"
}
```

### Login Request Scope

```typescript
{
  scopes: ["https://og-dv.crm.dynamics.com/.default"]
}
```

### Fluent UI Theme

Custom Microsoft brand color ramp with 16 shades (from `#020305` to `#E6F2FC`) used to generate both light and dark theme variants via `createLightTheme()` / `createDarkTheme()`.

---

## 12. User Guide

### Getting Started

1. Navigate to **ohgeesolutions.com** in your browser
2. Click **"Sign in with Microsoft"** and authenticate with your organizational account
3. You will land on the **Dashboard** showing an overview of your data

### Navigation

The **sidebar** (left) organizes pages into sections:

| Section | Pages |
|---------|-------|
| *(Top)* | Dashboard |
| **Core** | Accounts, Contacts, Projects, Meeting Summaries |
| **Activity** | Action Items, Ideas, Impacts |
| *(Bottom)* | About this site |

- Click the **chevron** at the top of the sidebar to collapse/expand it
- The current page is highlighted in blue

### Dashboard

- **Quick Create Bar** — Steel blue gradient banner at the top with compact buttons to create any record type without leaving the dashboard. Save buttons show a spinner and disable while saving to prevent duplicates.
- **Stat Tiles** — 7 compact quick-launch tiles (Accounts, Contacts, Projects, Summaries, Action Items, Ideas, Impacts) — click to navigate to that page
- **Work** — Card (red accent) showing all non-complete work action items, with a "Top Priority" sub-section at the top; scrollable when items exceed ~4 (only appears when work items exist)
- **Personal** — Card (teal accent) showing all non-complete personal action items, with a "Top Priority" sub-section at the top; scrollable when items exceed ~4 (only appears when personal items exist)
- **Action Items** — Shows the 8 most recent tasks with status, priority, and badges (Overdue, Upcoming, Complete); 180px scrollable area
- **Ideas** — Shows the 8 most recent ideas with category and account; 180px scrollable area
- **Quick Delete** — Every item on the dashboard (Work, Personal, Action Items, Ideas) has a trash icon for quick deletion with an "Are you sure?" confirmation dialog
- **Parking Lot** (right sidebar, top) — Bookmark any item from Work, Personal, Action Items, or Ideas cards using the bookmark icon. Parked items appear here for quick access — click to navigate, X to remove.
- **Pinned Notes** (right sidebar, bottom) — Appears when you have pinned notes; click to expand

### Working with Records

**Creating a record:**
1. Navigate to the relevant page (e.g., Action Items)
2. Click the **"New"** button in the top-right
3. Fill in the form fields and click **Save**
4. Alternatively, use the Quick Create bar on the Dashboard

**Viewing a record:**
- Click the **name** of any record (shown as a blue link) to open its view dialog
- View dialogs show all details plus related records (where applicable)

**Editing a record:**
- Open the view dialog, then click **Edit** — fields switch inline from read-only to editable
- Modify the fields and click **Save** — button disables with a spinner while saving
- Click **Cancel** to discard changes and return to view mode

**Deleting a record:**
- Click the **trash icon** in the grid/card actions
- Confirm the deletion in the dialog

### Notes & Attachments

Notes are available on **Accounts**, **Action Items**, **Ideas**, and **Projects**.

- Open a record's view dialog to see its **Notes Timeline** (right column)
- Type a note and click **Add Note**
- Click **Attach** to add a file (stored as base64 in Dataverse)
- Click the **pin icon** on a note to pin it to the Dashboard
- Click the **download icon** on an attached file to download it

### Theme Toggle

- Use the **sun/moon toggle** in the top bar to switch between light and dark mode
- Your preference is saved and persists across sessions

### Copilot Assistant

- Click the **O'G logo button** (bottom-right corner) to open the AI chat
- The assistant connects via SSO — no additional sign-in needed
- Close the panel and reopen it to continue the same conversation
- The chat adapts to your current theme (dark/light)

---

## 13. Development Guide

### Prerequisites

- **Node.js** (LTS version recommended)
- **npm** (comes with Node.js)
- **Azure AD account** with access to the Dataverse environment

### Local Development

```bash
# Install dependencies
npm install

# Create .env file with Copilot secret (optional for chat feature)
echo "REACT_APP_COPILOT_DIRECT_LINE_SECRET=your-secret-here" > .env

# Start dev server
npm start
# App runs at http://localhost:3000
```

### Project Structure

```
src/
├── auth/               # MSAL config (client ID, authority, scopes)
├── components/         # Shared components
│   ├── AppShell.tsx    # Layout shell (sidebar + top bar + main content)
│   ├── CopilotChat.tsx # Floating Copilot Studio chat widget
│   └── NotesTimeline.tsx # Reusable notes with attachments + pinning
├── context/            # React context providers
│   └── ThemeContext.tsx # Dark/light mode state and persistence
├── pages/              # Route-level page components (one per entity + About)
├── services/           # API layer
│   └── dataverseService.ts # All Dataverse Web API calls
├── types/              # TypeScript interfaces and type definitions
│   └── index.ts        # All entity interfaces + choice field types
├── utils/              # Utility functions
│   ├── formatDate.ts   # Date formatting helper
│   ├── pinnedNotes.ts  # Pinned notes localStorage management
│   └── parkingLot.ts   # Parking lot (bookmarks) localStorage management
├── App.tsx             # Root component (providers + routing)
└── index.tsx           # React DOM entry point
```

### Coding Conventions

- **Functional components** with hooks — no class components
- **Fluent UI v9** for all UI elements (DataGrid, Dialog, Dropdown, Card, etc.)
- **TypeScript interfaces** centralized in `src/types/index.ts`
- **All API calls** go through `dataverseService.ts` via the shared `apiRequest` helper
- **Dataverse lookups** use `@odata.bind` syntax for writes, `$expand` for reads
- **Minimal abstractions** — straightforward code preferred over complex patterns
- **makeStyles** for component-scoped styles (Griffel CSS-in-JS)
- **Inline Edit Pattern** — View dialogs toggle between read-only and editable mode via `isEditing` state. `openView` resets `isEditing(false)` and `editingId(null)` to prevent edit state leaking between records.
- **Save Progress Pattern** — All save/update/delete handlers use `saving` state: `setSaving(true)` at start, `setSaving(false)` in `finally`. Buttons show `disabled={saving}` with `<Spinner size="tiny" /> Saving...` to prevent double-submissions.

### Adding a New Entity Page

1. Define the TypeScript interface in `src/types/index.ts`
2. Add CRUD functions in `src/services/dataverseService.ts`
3. Create the page component in `src/pages/`
4. Add the route in `App.tsx`
5. Add the nav item in `AppShell.tsx`
6. Update the `pageTitles` record in `AppShell.tsx`

### Commands Reference

```bash
npm start     # Dev server (localhost:3000, hot reload)
npm run build # Production build (output: ./build/)
npm test      # Run test suite
```

---

## Appendix

### A. Dependencies

| Package | Purpose |
|---------|---------|
| `@azure/msal-browser` | MSAL.js browser library for Azure AD auth |
| `@azure/msal-react` | React bindings for MSAL |
| `@fluentui/react-components` | Fluent UI v9 component library |
| `@fluentui/react-icons` | Fluent UI icon set |
| `botframework-webchat` | Bot Framework Web Chat for Copilot integration |
| `react` | UI framework |
| `react-dom` | React DOM renderer |
| `react-router-dom` | Client-side routing |
| `react-scripts` | Create React App build tooling |
| `typescript` | TypeScript compiler |

### B. Browser Support

**Production:** `>0.2%`, not dead, not Opera Mini
**Development:** Latest Chrome, Firefox, Safari

### C. Known Limitations

- **Token in session storage** — Tokens are cleared when the browser tab is closed; users must re-authenticate in new tabs
- **Dataverse API limits** — Queries are capped at `$top=100`; pagination is not implemented for large datasets
- **File attachments** — Stored as base64 in Dataverse `annotations`; large files increase record size
- **Direct Line secret** — Compiled into the JavaScript bundle at build time; while exchanged for a conversation token before use, the secret is visible in the bundled source
- **No offline support** — The app requires an active internet connection for all operations
- **Single tenant** — The app is configured for a single Azure AD tenant; multi-tenant access would require configuration changes

### D. Glossary

| Term | Definition |
|------|-----------|
| **MSAL** | Microsoft Authentication Library — handles OAuth 2.0 / OIDC flows |
| **Dataverse** | Microsoft's low-code data platform (formerly Common Data Service) |
| **OData** | Open Data Protocol — RESTful API standard used by Dataverse |
| **Direct Line** | Bot Framework channel for embedding bots in custom apps |
| **SSO** | Single Sign-On — user authenticates once and is recognized across services |
| **SPA** | Single Page Application — client-side rendered web app |
| **Fluent UI** | Microsoft's design system and component library |
| **Azure Static Web Apps** | Azure hosting service for static sites with global CDN |
| **Copilot Studio** | Microsoft's platform for building conversational AI agents |
