# My Work — User Guide

**Application Name:** My Work
**URL:** ohgeesolutions.com
**Last Updated:** March 2026

---

## Getting Started

1. Navigate to **ohgeesolutions.com** in your browser
2. Click **"Sign in with Microsoft"** and authenticate with your organizational account
3. You will land on the **Dashboard** showing an overview of your data

---

## Navigation

The **sidebar** (left) organizes pages into sections. Click the chevron at the top to collapse/expand it. The current page is highlighted in blue.

| Section | Pages | Icon |
|---------|-------|------|
| *(Top)* | dashboard | Home |
| **activity** | tasks, personal, ideas, meetings | CheckboxChecked, Home, LightbulbFilament, PeopleTeam |
| **core** | accounts, contacts, projects, impacts | Building, Person, Briefcase, Flash |
| *(Bottom)* | about this site | Info |

At the bottom of the sidebar you'll find your avatar, name, and a **Sign out** button.

---

## Dashboard

The dashboard is your home base. Everything is visible at a glance, and most actions can be performed without leaving the page.

### Quick Create Bar

The top bar has pill-style buttons for creating any record type: task, personal, learning, idea, meeting, account, contact, project, or impact. The task/personal/learning buttons each pre-set the task type. Click a button, fill the inline form, and save -- you stay on the dashboard the whole time. Save buttons show a spinner and disable while saving to prevent duplicates.

### Parking Lot

The first column (lime green accent, car icon). Bookmark any item from the dashboard to "park" it here for quick access. Up to 5 items can be parked. Click an action item or idea tile to open its view dialog inline; other entity types navigate to their list page. Click X to remove an item. You can also **drag items** from the Work, Projects, or Ideas columns directly into the Parking Lot.

### Work Column

The widest column (flex: 2) showing action items filtered by type. Each card shows name, date, account, and colored pill badges for priority and status. Click to open the view/edit dialog inline. A small **w/p/l toggle** in the column header lets you switch between work (red accent), personal (cyan accent), and learning (purple accent) action items.

### Projects Column

Blue-accented column listing all projects with name and account. Click to open the view/edit dialog inline on the dashboard (with notes timeline).

### Ideas Column

Purple-accented column listing all ideas with name, category badge, and account. Click to open the view/edit dialog inline.

### Drag-and-Drop

Dashboard columns support drag-and-drop:
- **Drag to park:** Drag any item from the Work, Projects, or Ideas columns into the Parking Lot to bookmark it.
- **Reorder within a column:** Drag items up or down within any column to customize their order. Your custom order is saved to localStorage and persists across sessions.

### Tile Tooltips

Hover over any dashboard tile (work, projects, or parking lot) for about half a second and a rich tooltip appears with an arrow showing the full details that get truncated on the small tiles. Work tile tooltips show the full name, description, date, account, status, and priority. Project tile tooltips show name, description, and account. Parking lot tile tooltips show the full name and entity type.

### Priority Dots (Tile Color-Coding)

Hover over any tile on the dashboard (work, ideas, projects, parking lot) and colored dots appear in the top-right corner. Click a dot to set a visual priority color:

- **Clear** (empty circle) -- remove the color
- **Blue** -- Low priority
- **Orange** -- Eh priority
- **Red** -- High priority
- **Dark Red** -- Top priority

For work items and ideas, this actually updates the priority field in Dataverse. For projects and parking lot items, the color is visual-only and stored in your browser. Priority dots also appear on tile views of the Tasks, Ideas, Personal, and Projects entity pages.

---

## Working with Records

### Creating a Record

**From any entity page:**
1. Navigate to the page (e.g., tasks)
2. Click the **"New"** button in the top-right
3. Fill in the form fields and click **Save**

**From the dashboard:**
- Use the quick create bar at the top -- click the entity type button, fill the form, and save

### Viewing a Record

Click the **name** of any record (shown as a blue link) to open its view dialog. View dialogs show all details plus related records where applicable.

### Editing a Record

1. Open the view dialog by clicking the record name
2. Click **Edit** -- fields switch inline from read-only to editable
3. Modify the fields and click **Save** (button disables with a spinner while saving)
4. Click **Cancel** to discard changes and return to view mode

### Deactivating a Record

- Click the **trash icon** in the grid actions or on dashboard tiles
- Confirm the deactivation in the dialog
- Records are deactivated (hidden from lists) rather than permanently deleted

---

## Entity Pages

All 8 entity pages have a **list/tile view toggle** in the toolbar switching between a DataGrid (list) and 220px tile cards. Your preference is persisted to localStorage per page.

### Accounts

Track customer accounts with optional parent account relationships. The view dialog shows a 3-column layout with all related records: contacts, action items, ideas, impacts, meeting summaries, and a notes timeline.

### Contacts

Manage contact records linked to accounts. The view dialog shows contact details plus related ideas.

### Tasks (Action Items)

Task management with status, priority, and type tracking. Supports work/personal/learning categorization. The view dialog shows details plus a notes timeline.

**Filter:** A Work/Personal/Learning/All dropdown (defaults to Work) filters action items by task type.

**Status workflow:** Recognized/Pondering -> In Progress -> Pending Communication -> On Hold -> Wrapping Up -> Complete

**Priority options (dropdown order):** Low... but on deck for sure | Eh... Get to it when you can | High... next in line after top priority... | Top priority... no kidding!

### Personal

Dedicated page for personal action items (task type = Personal). Features a page header with Home icon and a search box for filtering by name. The view/edit dialog includes a notes timeline.

### Ideas

Idea pipeline with technology categorization (Copilot Studio, Canvas Apps, Model-Driven Apps, Power Automate, Power Pages, Azure, AI General, App General, Other), priority setting, and optional project association. View dialog shows details plus a notes timeline.

### Projects

Project tracking linked to accounts. View dialog shows details plus a notes timeline.

### Impacts

Track business impacts with date and account association. Simple view dialog without notes.

### Meeting Summaries

Meeting documentation with extended text support (5000 char max) and optional project association. Wider dialog to accommodate summary text.

---

## Notes & Attachments

Notes are available on **accounts**, **action items**, **ideas**, and **projects**.

1. Open a record's view dialog to see its **Notes Timeline** (right column)
2. Type a note and click **Add Note**
3. Click **Attach** to add a file (stored as base64 in Dataverse)
4. Click the **pin icon** on a note to pin it to the dashboard
5. Click the **download icon** on an attached file to download it
6. Click the **delete icon** to permanently remove a note

---

## Theme Toggle

Use the **sun/moon toggle** in the top bar to switch between light and dark mode. Your preference is saved and persists across sessions. On first visit, the app respects your system preference.

---

## Copilot Assistant

Click the **rocket icon button** (bottom-right corner) to open the AI chat panel. The assistant connects via SSO -- no additional sign-in needed. Close and reopen the panel to continue the same conversation. The chat adapts to your current theme.

**Reset conversation:** Click the **reset button** (circular arrow icon) in the chat header to clear the current conversation and start fresh. This tears down the Direct Line connection and establishes a new one.

---

## Tips

- **Quick navigation:** Use the sidebar to jump between pages. Collapsed mode shows icons with tooltips.
- **Keyboard shortcut:** All entity pages support `?new=true` in the URL to auto-open the create dialog.
- **Deep links:** Tasks, Ideas, and Projects support `?view=<id>` to link directly to a specific record's view dialog.
- **Parking lot:** Bookmark frequently-referenced items from dashboard lists for quick access (max 5).
- **Pin notes:** Pin important notes to the dashboard sidebar so they're always visible.
