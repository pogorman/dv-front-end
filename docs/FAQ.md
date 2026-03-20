# My Work — Frequently Asked Questions

**Last Updated:** March 2026

---

## General

### What is My Work?

My Work is an internal business management tool built as a React SPA. It provides a unified interface for managing customer accounts, contacts, action items, projects, ideas, impacts, and meeting summaries -- all backed by Microsoft Dataverse.

### Who is My Work for?

My Work is built for a Microsoft technical seller who needs to track customer relationships, action items, and ideas in a single place. It's also a reference architecture and sales demo for enterprise customers evaluating React + Dataverse + Copilot Studio.

### Where is My Work hosted?

Azure Static Web Apps with a custom domain at ohgeesolutions.com. Global CDN distribution with automatic SSL.

---

## Authentication

### How do I sign in?

Click "Sign in with Microsoft" on the login page. My Work uses Azure AD (MSAL) with your organizational account. No separate credentials needed.

### Why do I have to sign in again after closing the tab?

Tokens are stored in session storage, which is cleared when the browser tab closes. This is a security choice -- open a new tab and sign in again.

### Does My Work support multiple tenants?

No. My Work is configured for a single Azure AD tenant. Multi-tenant access would require configuration changes to the MSAL setup.

---

## Data

### Where is my data stored?

All data is stored in Microsoft Dataverse (formerly Common Data Service). The app connects to the Dataverse Web API at `https://og-dv.crm.dynamics.com/api/data/v9.2`.

### What happens when I "delete" a record?

Records are deactivated (statecode set to 1), not permanently deleted. They're hidden from all lists and views but still exist in Dataverse. Notes/annotations are the exception -- those are actually deleted.

### Is there a limit to how many records I can see?

Queries are capped at 100 records (`$top=100`). Pagination is not currently implemented. If you have more than 100 records of a given type, only the first 100 will appear.

### How are file attachments stored?

Files are stored as base64-encoded data in Dataverse's `annotations` table. This means large files increase the record size in Dataverse. Keep attachments reasonable in size.

---

## Dashboard

### What is the parking lot?

A bookmarking feature on the dashboard. Click the bookmark icon on any item to "park" it for quick access. Up to 5 items can be parked at a time. Parked items are stored in your browser's localStorage -- they're per-browser, not per-user in Dataverse.

### What are pinned notes?

Notes from accounts, action items, ideas, or projects that you've pinned to the dashboard sidebar. They show a preview with entity type label and attachment indicator. Like the parking lot, pins are stored in localStorage.

### Why don't I see the right sidebar?

The right sidebar only appears when you have pinned notes. If you have no pinned notes, it's hidden. You can also toggle it with the button in the quick create bar.

### How do I see full details for a dashboard tile?

Hover over any tile (work, ideas, or parking lot) for about half a second. A tooltip with an arrow appears showing the full details that get truncated on the small tile -- name, description, date, account, status, priority (for work tiles) or category and contact (for idea tiles). You can also click the tile to open the full view/edit dialog.

### How is the dashboard sorted?

- **Action items:** By date ascending (past/overdue first, then nearest upcoming)
- **Ideas:** By created date descending (newest first)
- **Work/Personal strips:** Same as action items -- date ascending

---

## Copilot Chat

### How do I open the AI chat?

Click the rocket icon button in the bottom-right corner of any page.

### Do I need to sign in separately for the chat?

No. The chat uses SSO (Single Sign-On) -- it automatically exchanges your Azure AD token with the Copilot Studio agent. No additional sign-in is needed.

### Can the chat access my Dataverse data?

The SSO token given to the bot is scoped to the bot's custom API only. It cannot directly access Dataverse data. The bot has its own knowledge sources and capabilities configured in Copilot Studio.

### What if the chat isn't responding?

The Direct Line connection may have timed out. Close the chat panel and reopen it to establish a new connection. If the issue persists, the Copilot Studio agent may be experiencing issues.

---

## Theme & Design

### How do I switch between dark and light mode?

Use the sun/moon toggle in the top bar. Your preference is saved to localStorage and persists across sessions.

### What font does My Work use?

Inter, loaded via Google Fonts. It's set as both the base font and monospace font in the Fluent UI theme tokens.

### What's the design language?

Subtle 1px borders over shadows, 8px border-radius cards, lowercase monospace section headers with letter-spacing. Entity pages use accent-colored 3px left borders on DataGrid cards. The brand palette is based on #4a9eff blue.

---

## Development

### How do I run My Work locally?

```bash
npm install
echo "REACT_APP_COPILOT_DIRECT_LINE_SECRET=your-secret" > .env
npm start
# App runs at http://localhost:3000
```

### How do I deploy?

```bash
npm run build
npx @azure/static-web-apps-cli deploy ./build \
  --deployment-token "<token>" --env production
```

Get the deployment token with:
```bash
az staticwebapp secrets list --name dv-front-end \
  --resource-group rg-og-dv-spa-etc \
  --query "properties.apiKey" -o tsv
```

### How do I add a new entity page?

1. Define the TypeScript interface in `src/types/index.ts`
2. Add CRUD functions in `src/services/dataverseService.ts`
3. Create the page component in `src/pages/`
4. Add the route in `App.tsx`
5. Add the nav item in `AppShell.tsx`
6. Update the `pageTitles` record in `AppShell.tsx`

### What's the `tdvsp_` prefix?

That's the Dataverse publisher prefix for custom tables in this environment. All custom entities use it (e.g., `tdvsp_actionitems`, `tdvsp_ideas`).

---

## Known Limitations

- **No offline support** -- requires an active internet connection for all operations
- **100-record cap** -- no pagination for large datasets
- **Session storage tokens** -- cleared on tab close; re-auth required in new tabs
- **Direct Line secret in bundle** -- compiled into JavaScript at build time; exchanged for a conversation token before use
- **localStorage features** -- parking lot and pinned notes are per-browser, not synced across devices
