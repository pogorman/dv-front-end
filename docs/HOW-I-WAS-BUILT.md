# My Work — How I Was Built

**Last Updated:** March 2026

---

## The Short Version

My Work is a React single-page application built almost entirely through conversations with Claude Code. The human (O'G) provided direction, design taste, and Dataverse domain knowledge. Claude wrote the code, built the components, and iterated on the design. The result is an internal business tool that manages customer data in Microsoft Dataverse with a custom UI, dark/light theming, and an embedded Copilot Studio AI assistant.

---

## The Stack Decision

**Why React + Dataverse?**

O'G is a Microsoft technical seller. The data already lived in Dataverse (accounts, contacts, tasks, ideas, impacts, projects, meeting summaries). The question was: build a custom front-end that's cleaner and more opinionated than a model-driven app, or keep using the out-of-the-box experience?

The answer: build a custom React SPA. It serves double duty -- a real daily-driver tool and a reference architecture for enterprise customers evaluating React + Dataverse + Azure Static Web Apps.

**Why Fluent UI v9?**

Microsoft's own design system. Consistent with the platform story, and the DataGrid component handles the tabular data patterns well. The entire app uses Fluent UI components -- no mixing of component libraries.

**Why Azure Static Web Apps?**

Zero server management, global CDN, automatic SSL, SPA routing built in. For a client-side-only app that talks directly to Dataverse, there's no need for a backend server.

---

## How It Was Built

### Phase 1: Foundation

The first conversations established the core architecture:

- **Prompt pattern:** "Create a React SPA with MSAL authentication that connects to Dataverse Web API"
- **Result:** `App.tsx` with provider hierarchy (MSAL -> Theme -> Fluent -> Router), `dataverseService.ts` with the `apiRequest` helper, `msalConfig.ts` with Azure AD settings
- **Key decision:** Token provider pattern -- `TokenProviderSetup` gates the entire app until the Dataverse token is ready. Every API call gets a fresh token via the registered provider function.

### Phase 2: Entity Pages

Each entity page followed the same pattern, built one at a time:

- **Prompt pattern:** "Add a Tasks page with DataGrid showing all action items, with create/edit/view dialogs"
- **Result:** 7 entity pages (Accounts, Contacts, Tasks, Ideas, Projects, Impacts, Meeting Summaries) all following the same conventions
- **Key decision:** Inline edit pattern -- view dialogs double as edit dialogs via an `isEditing` toggle. No separate edit page or modal. This kept the code simple and the UX fast.

### Phase 3: Dashboard

The dashboard went through the most iterations:

- **Started as:** Simple card grid with counts
- **Evolved to:** Quick create bar + parking lot strip + projects strip + work tile grid + right sidebar with tabbed Ideas and Pinned Notes
- **Key decisions:**
  - Inline view/edit dialogs on the dashboard (clicking an action item, idea, or project opens its full dialog without navigating away)
  - Parking lot for bookmarking (localStorage, max 5 items)
  - Tile-based layout instead of lists (160px tiles for strips, 3-per-row grid for work)
  - Ideas moved from a main-area strip to a tabbed right sidebar (alongside pinned notes) for better use of space
  - Projects strip added to the main area, giving projects first-class dashboard visibility

### Phase 4: Design System

The visual identity emerged through iteration:

- **Started with:** Default Fluent UI theming (Microsoft blue)
- **Evolved to:** Custom `ogBrand` palette based on `#4a9eff`, Inter font everywhere, subtle 1px borders over shadows, lowercase monospace section headers, accent-colored DataGrid left borders
- **Key decisions:**
  - Dark theme as the primary experience (`#0a0c10` background)
  - Each entity type gets its own accent color (red for tasks, purple for ideas, amber for impacts, etc.)
  - Cards: 8px radius, 1px border, no box shadow, hover = bg color change (no translateY)

### Phase 5: Copilot Integration

Adding the AI assistant:

- **Prompt pattern:** "Add a floating chat widget connected to Copilot Studio via Direct Line with SSO"
- **Result:** `CopilotChat.tsx` with Bot Framework Web Chat, SSO token exchange middleware, rocket icon button
- **Key decisions:**
  - Rocket icon as the chat trigger (matches the favicon)
  - SSO token exchange so users never see a sign-in card
  - Direct Line secret in `.env` (build-time), exchanged for conversation token at runtime

### Phase 6: Notes & Attachments

The NotesTimeline component:

- **Prompt pattern:** "Add a notes timeline to accounts, tasks, ideas, and projects with file attachments and pinning"
- **Result:** Shared `NotesTimeline` component with add/delete/pin/download capabilities
- **Key decision:** Polymorphic `annotations` table in Dataverse -- one table handles notes for all entity types via the `objectid` lookup

### Phase 7: Tile Tooltips

Adding discoverability to the compact dashboard tiles:

- **Prompt pattern:** "Add Fluent UI Tooltip components on all dashboard tiles so hovering shows the full record details"
- **Result:** All work, project, and parking lot tiles wrapped with Fluent UI `Tooltip` (`withArrow`, `showDelay={400}`). Each tooltip shows the full details that get truncated on the small tile.
- **Key decisions:**
  - Work tile tooltips show name, description (4-line clamp), date, account, status, and priority
  - Project tile tooltips show name, description, and account
  - Parking lot tile tooltips show name and entity type
  - Positioning varies: `"above"` for work tiles, `"below"` for projects and parking lot to avoid overlapping content above/below
  - 400ms delay prevents tooltips from firing on casual mouse movement

### Phase 8: Dashboard Status Badges & Priority Order

Improving tile information density and dropdown UX:

- **Prompt pattern:** "Add status pill badges to dashboard work tiles and reorder priority dropdowns"
- **Result:** Work tiles now show a colored status pill badge at bottom-right (Pondering, In Progress, Pending Comm., On Hold, Wrapping Up) using the same `<span>` renderBadge-style pills as entity page DataGrids. Top Priority and Overdue indicators were also converted from Fluent UI `Badge` components to the same pill style for visual consistency. A `taskPriorityOrder` array was added to `types/index.ts` to control dropdown display order across the app.
- **Key decisions:**
  - Status badges use short labels (`statusShortLabels`) and matching colors (`statusColors`) defined in Dashboard.tsx
  - All pill badges (status, Top Priority, Overdue) now use the same consistent `<span>` style: semi-transparent colored background, 9px font, 4px border-radius
  - Priority dropdown order changed to ascending severity: Low, Eh, High, Top Priority (top priority moved to last/bottom position instead of third)
  - `taskPriorityOrder` array is the single source of truth for dropdown order, used by Tasks, Dashboard, Accounts, and Personal pages

### Phase 9: View Toggles & Chat Reset

Improving page flexibility and chat UX:

- **Prompt pattern:** "Add list/tile view toggle to Tasks and Personal pages, and a reset button to Copilot chat"
- **Result:** Tasks page now has a toolbar toggle switching between DataGrid (list) and 220px tile cards. Personal page got a page header, search box, and its own list/tile toggle (DataGrid with cyan border vs. tile grid). CopilotChat gained a reset/clear button (ArrowReset24Regular icon) in the chat header that tears down the Direct Line connection and starts a fresh conversation. Dashboard right sidebar font sizes normalized to 11px.
- **Key decisions:**
  - View mode preferences persisted to localStorage (`og-tasks-view-mode`, `og-personal-view-mode`) so users keep their preferred layout across sessions
  - Tasks defaults to list, Personal defaults to tiles — matching each page's primary use case
  - Chat reset fully tears down and rebuilds the Direct Line connection rather than just clearing messages, ensuring a clean state

### Phase 10: Universal View Toggles, Dashboard Drag-and-Drop & Work/Personal Toggle

Expanding interactivity across the app:

- **Prompt pattern:** "Add list/tile view toggle to all entity pages, drag-and-drop on the dashboard, and a work/personal toggle on the work column"
- **Result:** All 8 entity pages (Tasks, Personal, Ideas, Projects, Contacts, Impacts, Accounts, Meeting Summaries) now have a list/tile view toggle in the toolbar switching between DataGrid and 220px tile cards. Dashboard columns support drag-and-drop: items can be dragged from Work/Projects/Ideas into the Parking Lot, and items within any column can be reordered. A w/p toggle in the Work column header switches between work and personal action items.
- **Key decisions:**
  - View preference persisted to localStorage per page so each page remembers the user's choice independently
  - Drag-and-drop uses HTML5 drag events for zero-dependency implementation
  - Custom column ordering persisted to localStorage so reordering survives page refreshes
  - Work/personal toggle is a small inline button in the column header rather than a dropdown, keeping the dashboard compact

### Phase 11: Tile Color-Coding, Idea Priority & Project Lookups

Adding visual priority to tiles and expanding entity relationships:

- **Prompt pattern:** "Add colored priority dots to tiles that update Dataverse priority on click, plus new fields for ideas (priority, project) and meeting summaries (project)"
- **Result:** New `TileColorPicker` component renders 4 colored dots + clear button on tile hover (top-right corner). Two operational modes: priority-driven (Tasks, Ideas, Personal -- writes `tdvsp_priority` to Dataverse) and localStorage-driven (Projects, Parking Lot -- visual-only via `og-tile-colors`). Ideas gained `tdvsp_priority` (choice) and `tdvsp_Project` (project lookup) fields. Meeting Summaries gained `tdvsp_Project` (project lookup). All new fields wired through types, service layer, OData queries, and new/edit/view forms. `docs/SESSION-PROMPTS.md` added as a reusable prompt collection.
- **Key decisions:**
  - Tile background tints use semi-transparent RGBA colors (`rgba(..., 0.12)`) so they work in both dark and light themes
  - CSS `.tile-color-picker` rule handles hover visibility (opacity 0 -> 1) rather than React state, keeping the component simple
  - Priority dots on entity pages (Tasks, Ideas, Personal, Projects) appear on tile views only, not DataGrid rows
  - Color-to-priority mapping in `tileColors.ts` is the single source of truth for both directions (color->priority and priority->color)
  - Pages without tile colors (Accounts, Contacts, Impacts, MeetingSummaries) were intentionally excluded -- they don't have a natural priority concept

### Phase 12: Learning Task Type, Sidebar Reorg & Summaries → Meetings Rename

Adding a third task type and reorganizing navigation:

- **Prompt pattern:** "Add Learning as a third task type, reorganize the sidebar, rename summaries to meetings"
- **Result:** New `Learning` task type (468510002) added to types, Tasks page filter (Work/Personal/Learning/All), and Dashboard work column (w/p/l toggle). Sidebar reorganized: personal moved before ideas in the activity section, summaries renamed to "meetings" and moved from core to activity section. All UI labels updated from "summaries" to "meetings" (MeetingSummaries page header, search placeholder, dialogs, Accounts view dialog, Dashboard quick create/dialogs). Dashboard quick create bar now has separate task/personal/learning buttons that pre-set the task type, plus a "meeting" button replacing "summary". Work filter changed from `!== personal` to `=== work` to correctly exclude learning items.
- **Key decisions:**
  - Three dedicated quick create buttons (task/personal/learning) pre-set the `tdvsp_tasktype` field instead of requiring users to pick from a dropdown in the form
  - Dashboard work column accent color changes dynamically: red for work, cyan for personal, purple for learning
  - HatGraduation icon chosen for learning to distinguish it visually from work (Briefcase) and personal (Home)
  - "Meetings" label is more intuitive than "summaries" for the sidebar — the page component filename (`MeetingSummaries.tsx`) stays unchanged to avoid refactoring churn

---

## Design Principles

These emerged through building, not from a design doc:

1. **Inline over navigate** -- Edit in place, create from the dashboard, view details in dialogs. Minimize page transitions.
2. **Deactivate, don't delete** -- All records set `statecode: 1` instead of being deleted. Fetch queries filter by `statecode eq 0`. Annotations are the exception (actual deletion).
3. **Lowercase everything** -- Nav labels, panel titles, section headers. The app has a deliberate lowercase aesthetic.
4. **Borders over shadows** -- Subtle 1px borders define surfaces. No drop shadows, no floating cards.
5. **Save feedback** -- Every save/update/deactivate shows a spinner on the button and disables it. Toast notifications on success/error.

---

## Tools Used

| Tool | Role |
|------|------|
| Claude Code | Primary developer -- wrote all application code |
| VS Code | Editor (via Claude Code CLI) |
| npm | Package management |
| React 19 | UI framework |
| TypeScript | Type safety |
| Fluent UI v9 | Component library |
| MSAL.js | Azure AD authentication |
| Dataverse Web API | Backend data |
| Azure Static Web Apps | Hosting |
| Copilot Studio | AI assistant agent |
| Bot Framework Web Chat | Chat widget |
| Inter (Google Fonts) | Typography |

---

## Lessons Learned

1. **Dataverse field names don't match display names.** "Task Priority" is `tdvsp_priority`, not `tdvsp_taskpriority`. An invalid field in `$select` returns a 400 and the whole list appears empty.

2. **The token provider pattern is essential.** Gating the app behind `TokenProviderSetup` prevents any API call from firing before auth is ready. Every call gets a fresh token -- no stale token bugs.

3. **Inline edit is simpler than separate forms.** One dialog with an `isEditing` toggle is less code and better UX than separate view/edit modes. But you have to reset `isEditing` and `editingId` when the dialog closes, or edit state leaks between records.

4. **localStorage features (parking lot, pinned notes) are per-browser.** This is fine for a single-user tool but wouldn't scale to multi-device. If needed, these could be moved to Dataverse user settings.

5. **Direct Line secrets in SPAs are inherently visible.** The secret is in the JavaScript bundle. Exchanging it immediately for a conversation token limits the exposure, but it's not truly secret. Acceptable for an internal tool.

6. **Dark theme is harder than light theme.** Getting surface colors, borders, and text contrast right in dark mode takes more iteration than light mode. The `ogDarkTheme` tokens required comprehensive overrides.
