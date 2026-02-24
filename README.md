# O'G Central

Internal business management tool built as a React SPA that interfaces with Microsoft Dataverse via Web API. Hosted on Azure Static Web Apps at **ohgeesolutions.com**.

## Tech Stack

- **React 19** with TypeScript
- **Fluent UI v9** (@fluentui/react-components)
- **MSAL** (@azure/msal-react) for Azure AD authentication
- **React Router v7** for navigation
- **Dataverse Web API** (v9.2) for backend data
- **Copilot Studio** agent via Bot Framework Web Chat
- **Azure Static Web Apps** for hosting

## Getting Started

```bash
# Install dependencies
npm install

# Create .env file (optional, for Copilot chat)
echo "REACT_APP_COPILOT_DIRECT_LINE_SECRET=your-secret" > .env

# Start dev server
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000). You must authenticate with an Azure AD account that has access to the Dataverse environment.

## Commands

```bash
npm start     # Dev server at localhost:3000
npm run build # Production build to ./build/
npm test      # Run tests
```

## Features

- **Dashboard** — Two-column layout with steel blue gradient Quick Create bar, 7 stat tiles, Work/Personal cards with top priority sections, Action Items/Ideas section cards, right sidebar with Parking Lot and Pinned Notes
- **Full CRUD** for Accounts, Contacts, Action Items, Projects, Ideas, Impacts, and Meeting Summaries
- **Inline Edit** — View dialogs toggle between read-only and editable mode; edit state resets cleanly between records
- **Save Progress** — All save/update/deactivate operations show spinner and disable buttons to prevent double-submissions
- **Parking Lot** — Bookmark any dashboard item for quick access in a persistent sidebar panel (localStorage)
- **Soft Delete** — All entities use deactivation (statecode=1) instead of hard deletion; trash icon on dashboard items shows "Are you sure?" confirmation dialog
- **Account View** with 3-column related records layout (contacts, tasks, ideas, impacts, summaries, notes)
- **Notes & Attachments** on Accounts, Action Items, Ideas, and Projects with file upload and pinning to dashboard
- **Copilot Chat** — floating AI assistant (bottom-right) connected to Copilot Studio via SSO
- **Dark/Light Theme** toggle with system preference detection and localStorage persistence
- **Collapsible Sidebar** navigation organized into sections with Fluent UI icons
- **About this site** page with app and platform info

## Project Structure

```
src/
├── auth/           # MSAL configuration
├── components/     # AppShell, CopilotChat, NotesTimeline
├── context/        # ThemeContext (dark/light mode)
├── pages/          # Route pages (Dashboard, Accounts, Contacts, etc.)
├── services/       # dataverseService.ts (Dataverse Web API layer)
├── types/          # TypeScript interfaces
└── utils/          # formatDate, pinnedNotes, parkingLot helpers
```

## Deployment

```bash
# Build and deploy to Azure Static Web Apps
npm run build
npx @azure/static-web-apps-cli deploy ./build --deployment-token "<token>" --env production
```

See [docs/SOLUTION_DOCUMENT.md](docs/SOLUTION_DOCUMENT.md) for the full technical solution document including architecture diagrams, security details, data model, and user guide.

## Documentation

- **[CLAUDE.md](CLAUDE.md)** — Coding conventions and AI assistant context
- **[docs/SOLUTION_DOCUMENT.md](docs/SOLUTION_DOCUMENT.md)** — Comprehensive solution document
