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
├── components/     # Shared components (AppShell with sidebar nav + theme toggle)
├── context/        # React context providers (ThemeContext for dark/light mode)
├── pages/          # Route pages
│   ├── Dashboard.tsx        # Stats tiles (Accounts, Contacts, Ideas, Tasks, Overdue) + recent lists
│   ├── Accounts.tsx         # CRUD + view dialog with related records (contacts, activities, tasks, impacts, ideas, summaries, notes)
│   ├── Contacts.tsx         # CRUD + view dialog with related ideas
│   ├── Activities.tsx       # High-Value Activities CRUD
│   ├── Tasks.tsx            # Action Items CRUD
│   ├── Impacts.tsx          # Impacts CRUD
│   ├── Ideas.tsx            # Ideas CRUD with category dropdown
│   ├── MeetingSummaries.tsx # Meeting Summaries CRUD
│   └── Login.tsx            # Unauthenticated login page
├── services/       # API layer (dataverseService.ts)
├── types/          # TypeScript interfaces (index.ts)
└── utils/          # Helper functions (formatDate.ts)
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
| Action Items | `tdvsp_actionitems` | tdvsp_actionitemid, tdvsp_name, tdvsp_date, tdvsp_Customer (account lookup) |
| Impacts | `tdvsp_impacts` | tdvsp_impactid, tdvsp_name, tdvsp_date, tdvsp_description, tdvsp_Customer (account lookup) |
| Ideas | `tdvsp_ideas` | tdvsp_ideaid, tdvsp_name, tdvsp_description, tdvsp_category (choice), tdvsp_Account (account lookup), tdvsp_Contact (contact lookup) |
| Meeting Summaries | `tdvsp_meetingsummaries` | tdvsp_meetingsummaryid, tdvsp_name, tdvsp_date, tdvsp_summary, tdvsp_Account (account lookup) |
| Annotations (Notes) | `annotations` | annotationid, subject, notetext, createdon, objectid (polymorphic lookup) |

Custom tables use the `tdvsp_` prefix (publisher prefix).

### Idea Categories (Choice Field)

Values: 468510000 (Copilot Studio), 468510001 (Canvas Apps), 468510002 (Model-Driven Apps), 468510003 (Power Automate), 468510004 (Power Pages), 468510005 (Azure), 468510006 (AI General), 468510007 (App General), 468510008 (Other)

## Key Features

- **Account View Dialog** - Shows account details plus all related records in a 3-column layout: (Contacts, Action Items, Ideas) | (HVAs, Impacts, Meeting Summaries) | (Notes timeline). Each section has inline "Add" buttons.
- **Contact View Dialog** - Shows contact details plus related Ideas.
- **Parent Account** - Accounts can have a parent account set via dropdown in new/edit form.
- **Dark/Light Theme** - Toggle in the top bar, persisted to localStorage, respects system preference on first visit. Uses ThemeContext provider wrapping the app.
- **Dashboard** - Stat tiles for Accounts, Contacts, Ideas, Open Tasks, Overdue. Section cards for Recent Ideas and Action Items.

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
