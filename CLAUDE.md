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
├── auth/           # MSAL configuration
├── components/     # Shared components (AppShell)
├── pages/          # Route pages (Dashboard, Accounts, Activities, etc.)
├── services/       # API layer (dataverseService.ts)
├── types/          # TypeScript interfaces
└── utils/          # Helper functions (formatDate)
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
| Accounts | `accounts` | accountid, name |
| Customers | `contacts` | contactid, firstname, lastname, emailaddress1, telephone1, jobtitle |
| High-Value Activities | `tdvsp_hvas` | tdvsp_hvaid, tdvsp_name, tdvsp_description, tdvsp_date, tdvsp_Customer (lookup) |
| Action Items | `tdvsp_actionitems` | tdvsp_actionitemid, tdvsp_name, tdvsp_date, tdvsp_Customer (lookup) |
| Impacts | `tdvsp_impacts` | tdvsp_impactid, tdvsp_name, tdvsp_date, tdvsp_description, tdvsp_Customer (lookup) |

Custom tables use the `tdvsp_` prefix (publisher prefix).

## Coding Conventions

- **Keep it simple** - minimal abstractions, straightforward code
- Use functional components with hooks
- Fluent UI components for all UI elements
- TypeScript interfaces in `src/types/index.ts`
- API calls go through `dataverseService.ts`
- Dataverse lookups use `@odata.bind` syntax for relationships

## Authentication Flow

1. App wraps in `MsalProvider`
2. Unauthenticated users see Login page
3. On login, MSAL acquires token for Dataverse scope
4. Token provider is set in dataverseService for API calls

## Git Workflow

- Commit freely with descriptive messages
- Branch naming: feature/*, fix/*, chore/*

## Azure Deployment

**Azure Static Web App:** `dv-front-end`
**Resource Group:** `rg-og-dv-spa-etc`
**Custom Domain:** ohgeesolutions.com

```bash
# Get deployment token (requires az login first)
az staticwebapp secrets list --name dv-front-end --resource-group rg-og-dv-spa-etc --query "properties.apiKey" -o tsv

# Build and deploy manually (if needed)
npm run build
# Then use Azure CLI or SWA CLI to deploy the build folder
```
