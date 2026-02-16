# O'G Central

Internal business tool - React SPA that interfaces with Microsoft Dataverse via Web API.

**App Name:** O'G Central

## Tech Stack

- **React 19** with TypeScript
- **Fluent UI v9** (@fluentui/react-components) for UI components
- **MSAL** (@azure/msal-react) for Azure AD authentication
- **React Router v7** for navigation
- **Dataverse Web API** for backend data

## Project Structure

```
src/
├── auth/           # MSAL configuration (msalConfig.ts)
├── components/     # Shared components
│   ├── AppShell.tsx         # Sidebar nav (sectioned) + theme toggle
│   ├── CopilotChat.tsx      # Floating Copilot Studio chat widget
│   └── NotesTimeline.tsx    # Shared notes component with file attachments
├── public/images/  # Static images (banner-bg.png for dashboard, og_logo_white.png for chat widget)
├── context/        # React context providers (ThemeContext for dark/light mode)
├── pages/          # Route pages
│   ├── Dashboard.tsx        # Stats tiles (Accounts, Contacts, Projects, Open Tasks) + Action Items & Ideas sections + pinned notes sidebar
│   ├── Accounts.tsx         # CRUD + view dialog with related records (contacts, activities, tasks, impacts, ideas, summaries, notes)
│   ├── Contacts.tsx         # CRUD + view dialog with related ideas
│   ├── Activities.tsx       # High-Value Activities CRUD
│   ├── Tasks.tsx            # Action Items CRUD (DataGrid) + task status + view dialog with notes timeline
│   ├── Impacts.tsx          # Impacts CRUD
│   ├── Ideas.tsx            # Ideas CRUD with category dropdown + view dialog with notes timeline
│   ├── Projects.tsx         # Projects CRUD + view dialog with notes timeline
│   ├── MeetingSummaries.tsx # Meeting Summaries CRUD
│   └── Login.tsx            # Unauthenticated login page
├── services/       # API layer (dataverseService.ts)
├── types/          # TypeScript interfaces (index.ts)
└── utils/          # Helper functions (formatDate.ts, pinnedNotes.ts)
```

## Commands

```bash
npm start     # Dev server at localhost:3000
npm run build # Production build
npm test      # Run tests
```

## Dataverse Entities

The app works with these Dataverse tables:

| App Concept | Dataverse Table | Key Fields |
|-------------|-----------------|------------|
| Accounts | `accounts` | accountid, name, parentaccountid (self-lookup) |
| Contacts | `contacts` | contactid, firstname, lastname, emailaddress1, telephone1, jobtitle, parentcustomerid (account lookup) |
| High-Value Activities | `tdvsp_hvas` | tdvsp_hvaid, tdvsp_name, tdvsp_description, tdvsp_date, tdvsp_Customer (account lookup) |
| Action Items | `tdvsp_actionitems` | tdvsp_actionitemid, tdvsp_name, tdvsp_date, tdvsp_description (5000 chars), tdvsp_taskstatus (choice), tdvsp_Customer (account lookup), createdon |
| Impacts | `tdvsp_impacts` | tdvsp_impactid, tdvsp_name, tdvsp_date, tdvsp_description, tdvsp_Customer (account lookup) |
| Ideas | `tdvsp_ideas` | tdvsp_ideaid, tdvsp_name, tdvsp_description, tdvsp_category (choice), tdvsp_Account (account lookup), tdvsp_Contact (contact lookup) |
| Projects | `tdvsp_projects` | tdvsp_projectid, tdvsp_name, tdvsp_description, tdvsp_Account (account lookup) |
| Meeting Summaries | `tdvsp_meetingsummaries` | tdvsp_meetingsummaryid, tdvsp_name, tdvsp_date, tdvsp_summary, tdvsp_Account (account lookup) |
| Annotations (Notes) | `annotations` | annotationid, subject, notetext, createdon, objectid (polymorphic lookup), filename, mimetype, documentbody (base64 file), isdocument |

Custom tables use the `tdvsp_` prefix (publisher prefix).

### Idea Categories (Choice Field)

Values: 468510000 (Copilot Studio), 468510001 (Canvas Apps), 468510002 (Model-Driven Apps), 468510003 (Power Automate), 468510004 (Power Pages), 468510005 (Azure), 468510006 (AI General), 468510007 (App General), 468510008 (Other)

### Task Status (Choice Field)

Values: 468510000 (Recognized/Pondering), 468510001 (In Progress), 468510002 (Pending Communication), 468510003 (On Hold), 468510004 (Wrapping Up), 468510005 (Complete)

## Key Features

- **Sidebar Navigation** - Organized into sections with subtle dividers:
  - Dashboard (top)
  - O'G's Data: Action Items, Projects, Meeting Summaries, Ideas
  - Impact: High-Value Activities, Impacts
  - Core: Accounts, Contacts
- **Account View Dialog** - Shows account details plus all related records in a 3-column layout: (Contacts, Action Items, Ideas) | (HVAs, Impacts, Meeting Summaries) | (Notes timeline). Each section has inline "Add" buttons.
- **Contact View Dialog** - Shows contact details plus related Ideas.
- **Parent Account** - Accounts can have a parent account set via dropdown in new/edit form.
- **Dark/Light Theme** - Toggle in the top bar, persisted to localStorage, respects system preference on first visit. Uses ThemeContext provider wrapping the app.
- **Dashboard** - Quick action buttons at top open inline dialogs for creating any record type (stays on dashboard). Custom banner background image. Stat tiles for Accounts, Contacts, Projects, Open Tasks. Section cards for Action Items (left) and Ideas (right) with clickable items and subtle "New" buttons. Pinned Notes sidebar panel on the right (280px, appears when notes are pinned).
- **Auto-open Dialogs** - All entity pages support `?new=true` query parameter to auto-open the new record dialog (used by section "New" buttons, not dashboard quick actions).
- **Notes Timeline** - Shared `NotesTimeline` component used by Accounts, Action Items, Ideas, and Projects. Features:
  - Add notes with optional file attachments (stored as base64 in Dataverse)
  - Pin notes to dashboard
  - Download attached files
  - Delete notes
- **Pinned Notes** - Notes from Accounts, Action Items, Ideas, or Projects can be pinned to the Dashboard. Pinned notes show entity type label, 3-line preview, attachment indicator, click to expand in dialog. `pinnedNotes.ts` stores refs with `annotationid`, `entityName`, and `entityType`.
- **Copilot Chat** - Floating O'G logo button (bottom-right) opens chat panel connected to Copilot Studio agent. Uses `CopilotChat.tsx` with Bot Framework Web Chat. Authenticates via Direct Line secret (from `REACT_APP_COPILOT_DIRECT_LINE_SECRET` env var) and SSO token exchange (scope: `api://3c6a1f01-09c5-49c7-8be7-48c33e177432/mcs-read-scope`). Bot avatar uses O'G logo (`/images/og_logo_white.png`). Sends `startConversation` event on connect to trigger bot greeting.

## Coding Conventions

- **Keep it simple** - minimal abstractions, straightforward code
- Use functional components with hooks
- Fluent UI components for all UI elements (DataGrid for tables, Dialog for modals, Dropdown for lookups, Card for layouts)
- TypeScript interfaces in `src/types/index.ts`
- API calls go through `dataverseService.ts` using a shared `apiRequest` helper
- Dataverse lookups use `@odata.bind` syntax for setting relationships (e.g., `"parentcustomerid_account@odata.bind": "/accounts(guid)"`)
- Dataverse lookup values are read via `_fieldname_value` properties and `$expand` for navigation properties
- View dialogs open on name click, Edit dialogs open from view dialog or grid action buttons

## Authentication Flow

1. App wraps in `MsalProvider`
2. Unauthenticated users see Login page
3. On login, MSAL acquires token for Dataverse scope
4. `TokenProviderSetup` component gates children until token provider is ready
5. Token provider is set in dataverseService for all API calls

## Copilot Studio Integration

The app includes a floating chat widget (O'G logo button, bottom-right) connected to a Copilot Studio agent via Direct Line.

**Configuration:**
- Direct Line secret: stored in `.env` as `REACT_APP_COPILOT_DIRECT_LINE_SECRET` (baked into build at compile time)
- SSO scope: `api://3c6a1f01-09c5-49c7-8be7-48c33e177432/mcs-read-scope`
- Bot avatar & button icon: `/images/og_logo_white.png`

**Azure AD App Registration Requirements:**
- Exposed API scope: `api://3c6a1f01-09c5-49c7-8be7-48c33e177432/mcs-read-scope`
- Redirect URI (Web): `https://token.botframework.com/.auth/web/redirect`
- Power Platform API permission (`https://api.powerplatform.com/.default`)

**How it works:**
1. User clicks O'G logo button (bottom-right corner)
2. Component acquires SSO token via MSAL for the bot's custom scope
3. Exchanges Direct Line secret for a conversation token
4. Creates Web Chat store with middleware that handles `signin/tokenExchange` invoke activities (SSO)
5. Sends `startConversation` event once connected to trigger bot greeting
6. Renders Bot Framework Web Chat with Direct Line connection and SSO store

## Git Workflow

- Commit freely with descriptive messages
- Branch naming: feature/*, fix/*, chore/*

## Azure Deployment

**Azure Static Web App:** `dv-front-end`
**Resource Group:** `rg-og-dv-spa-etc`
**Custom Domain:** ohgeesolutions.com

```bash
# Get deployment token (requires az login first)
"C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd" staticwebapp secrets list --name dv-front-end --resource-group rg-og-dv-spa-etc --query "properties.apiKey" -o tsv

# Build and deploy to production
npm run build
npx swa deploy ./build --deployment-token "<token>" --env production
```
