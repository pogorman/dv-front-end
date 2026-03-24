# My Work

Internal business tool - React SPA that interfaces with Microsoft Dataverse via Web API.

**App Name:** My Work

## Tech Stack

- **React 19** with TypeScript
- **Fluent UI v9** (@fluentui/react-components) for UI components
- **MSAL** (@azure/msal-react) for Azure AD authentication
- **React Router v7** for navigation
- **Dataverse Web API** for backend data
- **Font**: Inter everywhere (loaded via Google Fonts, set as both `fontFamilyBase` and `fontFamilyMonospace` in theme tokens)
- **Theme**: Custom `ogBrand` palette based on `#4a9eff` blue. Dark theme (`ogDarkTheme`) and light theme (`ogLightTheme`) with comprehensive token overrides in `App.tsx`. Design language: subtle 1px borders over shadows, 8px border-radius cards, lowercase monospace section headers with letter-spacing.

## Project Structure

```
src/
├── auth/           # MSAL configuration (msalConfig.ts)
├── components/     # Shared components
│   ├── AppShell.tsx         # Sidebar nav (sectioned) + theme toggle
│   ├── CopilotChat.tsx      # Floating Copilot Studio chat widget
│   └── NotesTimeline.tsx    # Shared notes component with file attachments
├── public/images/  # Static images (banner-bg.png for dashboard, og_logo_white.png for chat header)
├── context/        # React context providers (ThemeContext for dark/light mode, NotificationContext for toast notifications)
├── pages/          # Route pages
│   ├── Dashboard.tsx        # Quick create bar, Projects strip, Work cards, Parking Lot, inline view/edit dialogs, collapsible right sidebar (tabbed Ideas + Pinned Notes)
│   ├── Accounts.tsx         # CRUD (DataGrid + tile view toggle) + page header + inline edit view dialog with related records (contacts, tasks, impacts, ideas, summaries, notes)
│   ├── Contacts.tsx         # CRUD (DataGrid + tile view toggle) + page header + inline edit view dialog with related ideas
│   ├── Tasks.tsx            # Action Items CRUD (DataGrid + tile view toggle) + task status/priority/type + inline edit view dialog with notes timeline
│   ├── Impacts.tsx          # Impacts CRUD (DataGrid + tile view toggle) + page header + inline edit view dialog
│   ├── Ideas.tsx            # Ideas CRUD (DataGrid + tile view toggle) + page header + category badges + inline edit view dialog with notes timeline
│   ├── Projects.tsx         # Projects CRUD (DataGrid + tile view toggle) + page header + inline edit view dialog with notes timeline
│   ├── MeetingSummaries.tsx # Meeting Summaries CRUD (DataGrid + tile view toggle) + page header + inline edit view dialog
│   ├── Personal.tsx         # Personal action items (tile grid + list view toggle) + page header + search + view/edit dialog with notes timeline
│   ├── Activities.tsx       # (ORPHANED — not routed) High-Value Activities CRUD, kept for potential future use
│   ├── About.tsx            # About this site info page
│   └── Login.tsx            # Unauthenticated login page
├── services/       # API layer (dataverseService.ts)
├── types/          # TypeScript interfaces (index.ts)
└── utils/          # Helper functions (formatDate.ts, pinnedNotes.ts, parkingLot.ts)
docs/
├── README.md                # Documentation index
├── ARCHITECTURE.md          # System design, auth flow, data architecture, deployment
├── USER-GUIDE.md            # End-user guide
├── FAQ.md                   # Frequently asked questions
├── HOW-I-WAS-BUILT.md      # Build narrative with prompts, decisions, lessons
├── SOLUTION_DOCUMENT.md     # Comprehensive technical reference
└── pdf/                     # Generated PDFs (from scripts/)
scripts/
├── generate-architecture-pdf.py     # -> docs/pdf/architecture.pdf
├── generate-user-guide-pdf.py       # -> docs/pdf/user-guide.pdf
├── generate-faq-pdf.py              # -> docs/pdf/faq.pdf
└── generate-how-i-was-built-pdf.py  # -> docs/pdf/how-i-was-built.pdf
bruno/              # Bruno API collection (Dataverse Web API requests)
├── environments/   # Dataverse environment config (baseUrl, token, entity IDs)
├── Accounts/       # Account CRUD requests
├── Contacts/       # Contact CRUD requests
├── Action Items/   # Action Item CRUD requests (includes choice field docs)
├── Ideas/          # Idea CRUD requests (includes category docs)
├── Impacts/        # Impact CRUD requests
├── Projects/       # Project CRUD requests
├── Meeting Summaries/ # Meeting Summary CRUD requests
├── Annotations/    # Notes CRUD + file download requests
└── Related Records/   # By-account and by-contact queries
```

## Commands

```bash
npm start     # Dev server at localhost:3000 (PORT=3000 set in .env)
npm run build # Production build
npm test      # Run tests
```

## Dataverse Entities

The app works with these Dataverse tables:

| App Concept | Dataverse Table | Key Fields |
|-------------|-----------------|------------|
| Accounts | `accounts` | accountid, name, parentaccountid (self-lookup) |
| Contacts | `contacts` | contactid, firstname, lastname, emailaddress1, telephone1, jobtitle, parentcustomerid (account lookup) |
| Action Items | `tdvsp_actionitems` | tdvsp_actionitemid, tdvsp_name, tdvsp_date, tdvsp_description (5000 chars), tdvsp_taskstatus (choice), tdvsp_priority (choice), tdvsp_tasktype (choice), tdvsp_Customer (account lookup), createdon |
| Impacts | `tdvsp_impacts` | tdvsp_impactid, tdvsp_name, tdvsp_date, tdvsp_description, tdvsp_Customer (account lookup) |
| Ideas | `tdvsp_ideas` | tdvsp_ideaid, tdvsp_name, tdvsp_description, tdvsp_category (choice), tdvsp_Account (account lookup), tdvsp_Contact (contact lookup) |
| Projects | `tdvsp_projects` | tdvsp_projectid, tdvsp_name, tdvsp_description, tdvsp_Account (account lookup) |
| Meeting Summaries | `tdvsp_meetingsummaries` | tdvsp_meetingsummaryid, tdvsp_name, tdvsp_date, tdvsp_summary, tdvsp_Account (account lookup) |
| High-Value Activities | `tdvsp_hvas` | tdvsp_hvaid, tdvsp_name, tdvsp_description, tdvsp_date, tdvsp_Customer (account lookup) — **orphaned**: API functions & type exist but page not routed |
| Annotations (Notes) | `annotations` | annotationid, subject, notetext, createdon, objectid (polymorphic lookup), filename, mimetype, documentbody (base64 file), isdocument |

Custom tables use the `tdvsp_` prefix (publisher prefix).

### Idea Categories (Choice Field)

Values: 468510000 (Copilot Studio), 468510001 (Canvas Apps), 468510002 (Model-Driven Apps), 468510003 (Power Automate), 468510004 (Power Pages), 468510005 (Azure), 468510006 (AI General), 468510007 (App General), 468510008 (Other)

### Task Status (Choice Field)

Values: 468510000 (Recognized/Pondering), 468510001 (In Progress), 468510002 (Pending Communication), 468510003 (On Hold), 468510004 (Wrapping Up), 468510005 (Complete)

### Task Priority (Choice Field)

Values: 468510000 (Low... but on deck for sure), 468510001 (Eh... Get to it when you can), 468510002 (Top priority... no kidding!), 468510003 (High... next in line after top priority...)

**Dropdown display order** (controlled by `taskPriorityOrder` in `src/types/index.ts`): Low, Eh, High, Top Priority (ascending severity, top priority last).

### Task Type (Choice Field)

Values: 468510000 (Personal), 468510001 (Work)

## Key Features

- **Sidebar Navigation** (168px expanded, 48px collapsed) - Collapsible with toggle button. All labels lowercase. Organized into sections with subtle dividers:
  - dashboard (top, Home icon)
  - activity: tasks (CheckboxChecked), ideas (LightbulbFilament), personal (Home), impacts (Flash)
  - core: accounts (Building), contacts (Person), projects (Briefcase), summaries (PeopleTeam)
  - about this site (bottom, Info icon)
  - User area at bottom with avatar, name, Sign out button
- **Page Title Icons** - Each page's top bar title shows the matching Fluent UI filled icon (in its accent color) to the left of the page name. Icon-to-color mapping defined in `pageIcons` in `AppShell.tsx`.
- **DataGrid List View Pattern** - All 7 entity pages (Tasks, Ideas, Impacts, Accounts, Contacts, Projects, MeetingSummaries) use Fluent UI `DataGrid` inside a `Card` wrapper with: `padding: "0px"`, `overflow: "hidden"`, accent-colored 3px left border, page header with filled icon + lowercase monospace title. Each grid has sortable columns, colored `renderBadge` pills for choice fields (status, priority, category, dates, accounts), clickable name links that open view dialogs, and edit/deactivate action buttons. Accent colors: Tasks=#f87171, Ideas=#a78bfa, Impacts=#f59e0b, Accounts=#4a9eff, Contacts=#22d3ee, Projects=#4a9eff, Summaries=#3dd68c.
- **Account View Dialog** - Shows account details plus all related records in a 3-column layout: (Contacts, Action Items, Ideas) | (Impacts, Meeting Summaries) | (Notes timeline). Each section has inline "Add" buttons.
- **Contact View Dialog** - Shows contact details plus related Ideas.
- **Parent Account** - Accounts can have a parent account set via dropdown in new/edit form.
- **Dark/Light Theme** - Toggle in the top bar, persisted to localStorage, respects system preference on first visit. Uses ThemeContext provider wrapping the app.
- **Dashboard** - Four vertical columns layout filling the viewport height. Quick create buttons in a compact title bar row at the top. Columns left to right: Parking Lot | Work (flex: 2) | Projects | Ideas. Each column is a bordered card with accent-colored 3px left border, header (icon + title + count), and scrollable content area. All items are vertical card lists within their column. Clicking any action item, idea, or project opens an inline view/edit dialog on the dashboard (no navigation). Layout:
  1. **quick create bar** - Compact row of monospace chip-style pill buttons at top: task, idea, impact, account, contact, project, summary (each opens inline dialog, stays on dashboard). Save buttons disable with spinner during save.
  2. **parking lot column** (lime green `#84cc16` accent, `VehicleCarParking24Filled` icon) — vertical scrollable list of parked items. Max 5 items (`MAX_PARKED_ITEMS` in `parkingLot.ts`). Items can be parked from work/ideas columns via car icon. Clicking action items/ideas opens inline view dialog; other entity types navigate. X button removes. Shows count in header.
  3. **work/personal column** (flex: 2) — vertical scrollable list of action items. Header has a small "w" / "p" toggle pill to switch between work (red `#f87171` accent, `Briefcase24Filled` icon) and personal (cyan `#22d3ee` accent, `Home24Filled` icon) items. Uses `workFilter` state (`"work"` | `"personal"`). Personal items filter: `tdvsp_tasktype === 468510000`. Top priority first, then rest. Each card shows name (2-line clamp), date + account, priority/status pill badges, park/deactivate action buttons. Sorted by `tdvsp_date` asc. Shows count in header.
  4. **projects column** (blue `#4a9eff` accent, `Briefcase24Regular` icon) — vertical scrollable list of all projects with name and account. Click opens inline view/edit dialog with NotesTimeline. Shows count in header.
  5. **ideas column** (purple `#a78bfa` accent, `LightbulbFilament24Filled` icon) — vertical scrollable list of all ideas with name, category badge, account, park/deactivate actions. Click opens inline view dialog. Shows count in header.
  - **tile tooltips** — All dashboard items show rich Fluent UI `Tooltip` on hover (400ms delay, `withArrow`). Work items show name/description/date/account/status/priority. Project items show name/description/account. Parking lot items show name/entity type.
  - **drag-to-park** — Items in Work, Projects, and Ideas columns can be dragged to the Parking Lot column. Uses HTML5 drag/drop API. Parking lot column shows lime green highlight on drag over. Uses `isDragOverParking` state and `dragCounter` ref for nested element handling.
  - **column reorder** — All dashboard column items (parking lot, work/personal, projects, ideas) can be reordered within their column via drag-and-drop. Custom order persisted to localStorage per column (`og-dash-work-order`, `og-dash-personal-order`, `og-dash-project-order`, `og-dash-idea-order`). Parking lot reorder uses `reorderParkedItems()` in `parkingLot.ts`. Visual drop indicator (colored box-shadow line) shows insertion point. Helper function `applyColumnOrder()` sorts items by stored order. `orderVersion` state triggers re-render after reorder. New items not in stored order appear at the end.
- **About this site** - Simple info page showing platform, backend, authentication, UI framework, and domain.
- **Auto-open Dialogs** - All entity pages support `?new=true` query parameter to auto-open the new record dialog. Tasks (`/tasks?view=<id>`), Ideas (`/ideas?view=<id>`), and Projects (`/projects?view=<id>`) also support `?view=<id>` to auto-open the view dialog for a specific record.
- **Dashboard Inline View Dialogs** - Clicking action items, ideas, or projects anywhere on the dashboard columns opens a 70vw view/edit dialog directly on the dashboard with NotesTimeline. Same inline edit pattern as entity pages (isEditing toggle, Edit/Save/Cancel buttons). No navigation away from dashboard.
- **Notes Timeline** - Shared `NotesTimeline` component used by Accounts, Action Items, Ideas, and Projects. Features:
  - Add notes with optional file attachments (stored as base64 in Dataverse)
  - Download attached files
  - Delete notes (actual deletion, not deactivation)
- **Parking Lot** - Dashboard bookmarking feature. Any record visible on the dashboard (Work, Ideas) can be "parked" via a car icon (`VehicleCar16Regular`/`VehicleCar16Filled` — filled when parked, outline when not). Parked items appear in the Parking Lot column (first column, lime green `#84cc16` accent). Max 5 items enforced by `MAX_PARKED_ITEMS` in `parkingLot.ts`. `parkingLot.ts` stores `ParkedItemRef { id, name, entityType, route }` in localStorage. Entity types: actionitem, idea, account, contact, project, impact, summary.
- **Copilot Chat** - Floating rocket icon button (bottom-right, inline SVG rocket, no background/border) opens chat panel connected to Copilot Studio agent. Note: the Copilot floating button is the only place that still uses the rocket icon; the favicon, sidebar brand icon, and login page now use a checkmark-in-circle. Uses `CopilotChat.tsx` with Bot Framework Web Chat. Authenticates via Direct Line secret (from `REACT_APP_COPILOT_DIRECT_LINE_SECRET` env var) and SSO token exchange (scope: `api://3c6a1f01-09c5-49c7-8be7-48c33e177432/mcs-read-scope`). Bot avatar uses O'G logo (`/images/og_logo_white.png`). Sends `startConversation` event on connect to trigger bot greeting. Chat header includes a clear/reset button (`ArrowReset24Regular` icon) that tears down the Direct Line connection and starts a fresh conversation.
- **Toast Notifications** - All CRUD operations show toast notifications (top-right) on success and error. Uses `NotificationContext` with Fluent UI `Toaster`. Success toasts auto-dismiss after 3s, errors after 5s.
- **Personal Page** - Dedicated page (`Personal.tsx`) for personal action items with page header (Home24Filled icon + "personal" title), search box, and list/tile view toggle (`TextBulletListLtr20Regular` / `Grid20Regular` icons). Tile view shows the existing tile grid; list view shows a DataGrid with cyan (`#22d3ee`) left border and sortable columns (date, name, status, priority, account, actions). View preference persisted to `localStorage("og-personal-view-mode")`, defaults to tiles. Includes view/edit dialog with NotesTimeline. Accessed via sidebar under activity section.
- **Tasks Filter** - Tasks page includes a Work/Personal/All filter dropdown (defaults to Work) to filter action items by task type.
- **List/Tile View Toggle** (all entity pages + Personal) - Every entity page has a list/tile view toggle in the toolbar (`TextBulletListLtr20Regular` / `Grid20Regular` icons). List view is the DataGrid. Tile view shows 220px cards with entity-specific details (name + relevant badges/fields). Tile styles: `tileGrid`, `tile`, `tileName`, `tileMeta`, `viewToggle`. View preference persisted to localStorage per page, all defaulting to `"list"`. Keys: `og-tasks-view-mode`, `og-ideas-view-mode`, `og-projects-view-mode`, `og-contacts-view-mode`, `og-impacts-view-mode`, `og-accounts-view-mode`, `og-summaries-view-mode`, `og-personal-view-mode` (Personal defaults to `"tiles"`).
- **Tile Tooltips** - All dashboard tiles (work, projects, parking lot) show rich Fluent UI `Tooltip` on hover (`showDelay={400}`, `withArrow`). Tooltips reveal full details that get truncated on small tiles: work tiles show name/description/date/account/status/priority; project tiles show name/description/account; parking lot tiles show name/entity type. Positioning varies by section (`"above"` for work, `"below"` for projects and parking lot).

## Coding Conventions

- **Keep it simple** - minimal abstractions, straightforward code
- Use functional components with hooks
- Fluent UI components for all UI elements (DataGrid for tables, Dialog for modals, Dropdown for lookups, Card for layouts)
- **DataGrid List View Convention** (all 7 entity pages): Each page uses a `Card` with `padding: "0px"`, `overflow: "hidden"`, accent-colored 3px `borderLeft`, wrapping a Fluent UI `DataGrid` with `columnSizes` flex layout. Pages include a `pageHeader` div (icon + lowercase monospace `Subtitle1`). Choice fields render as colored `renderBadge` pills (`<span>` with semi-transparent background). Name column is a clickable link (`nameLink` style). Actions column has edit/deactivate buttons.
- TypeScript interfaces and shared constants in `src/types/index.ts` (includes `taskPriorityOrder` for dropdown display order)
- API calls go through `dataverseService.ts` using a shared `apiRequest` helper
- Dataverse lookups use `@odata.bind` syntax for setting relationships (e.g., `"parentcustomerid_account@odata.bind": "/accounts(guid)"`)
- Dataverse lookup values are read via `_fieldname_value` properties and `$expand` for navigation properties
- **Inline Edit Pattern** (all 7 entity pages + Dashboard): View dialogs open on name click; editing happens inline in the view dialog (`isEditing` state toggles fields between read-only `<Text>` and editable `<Input>`/`<Dropdown>`/`<Textarea>`). Separate "New" dialog is kept only for creating new records. Standard functions: `openEdit` sets `isEditing(true)` and populates `formData`; `buildPayload` extracts shared payload construction; `handleSaveEdit` updates record and refreshes viewed entity; `handleSaveNew` creates from the new dialog. DialogActions toggle between Edit button (view mode) and Save/Cancel (edit mode). `onOpenChange` resets `isEditing` and `editingId` when dialog closes. `openView` always resets `isEditing(false)` and `editingId(null)` to prevent edit state leaking between records. Dashboard uses `editFormData` (separate from quick-add form state) and entity-specific functions (`openViewTask`/`openEditTask`/`openViewIdea`/`openEditIdea`/`openViewProject`/`openEditProject`).
- **Deactivate Pattern** (all entity pages + Dashboard): Records are deactivated (`statecode: 1`) instead of hard-deleted. All fetch queries include `statecode eq 0` to show only active records. Annotations (notes) still use actual deletion. Service functions are named `deactivateXxx` (e.g., `deactivateActionItem`, `deactivateAccount`). Page handlers are named `handleDeactivate`. Dashboard uses a confirmation dialog for deactivation.
- **Save Progress Pattern** (all entity pages + Dashboard): Every save/update/deactivate handler uses `saving` state: `setSaving(true)` at start, `setSaving(false)` in `finally` block. Save/Deactivate buttons show `disabled={saving}` with `<Spinner size="tiny" /> Saving...` content while in progress. Prevents double-submissions and provides visual feedback. Combined with `notify()` toast calls for success/error.
- **View Toggle Pattern** (all entity pages + Personal): Every entity page has a list/tile view toggle using `localStorage` to persist the user's preference. Keys: `og-tasks-view-mode`, `og-ideas-view-mode`, `og-projects-view-mode`, `og-contacts-view-mode`, `og-impacts-view-mode`, `og-accounts-view-mode`, `og-summaries-view-mode`, `og-personal-view-mode`. All default to `"list"` except Personal which defaults to `"tiles"`. Toggle icons: `TextBulletListLtr20Regular` for list, `Grid20Regular` for tiles. Tile styles: `tileGrid`, `tile`, `tileName`, `tileMeta`, `viewToggle`.

## Authentication Flow

1. App wraps in `MsalProvider`
2. Unauthenticated users see Login page
3. On login, MSAL acquires token for Dataverse scope
4. `TokenProviderSetup` component gates children until token provider is ready
5. Token provider is set in dataverseService for all API calls

## Copilot Studio Integration

The app includes a floating chat widget (rocket icon button, bottom-right) connected to a Copilot Studio agent via Direct Line. The Copilot floating button is the only remaining use of the rocket SVG icon in the app; the favicon, sidebar brand icon, and login page all use a checkmark-in-circle icon.

**Configuration:**
- Direct Line secret: stored in `.env` as `REACT_APP_COPILOT_DIRECT_LINE_SECRET` (baked into build at compile time)
- SSO scope: `api://3c6a1f01-09c5-49c7-8be7-48c33e177432/mcs-read-scope`
- Floating button: inline SVG rocket (no background/border) — only place the rocket icon is still used
- Bot avatar & chat header icon: `/images/og_logo_white.png`

**Azure AD App Registration Requirements:**
- Exposed API scope: `api://3c6a1f01-09c5-49c7-8be7-48c33e177432/mcs-read-scope`
- Redirect URI (Web): `https://token.botframework.com/.auth/web/redirect`
- Power Platform API permission (`https://api.powerplatform.com/.default`)

**How it works:**
1. User clicks rocket icon button (bottom-right corner)
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
npx @azure/static-web-apps-cli deploy ./build --deployment-token "<token>" --env production
```
