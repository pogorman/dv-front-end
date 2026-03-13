# boom! — User Guide

**Application Name:** boom!
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
| **activity** | tasks, ideas, impacts | CheckboxChecked, LightbulbFilament, Flash |
| **core** | accounts, contacts, projects, summaries | Building, Person, Briefcase, PeopleTeam |
| *(Bottom)* | about this site | Info |

At the bottom of the sidebar you'll find your avatar, name, and a **Sign out** button.

---

## Dashboard

The dashboard is your home base. Everything is visible at a glance, and most actions can be performed without leaving the page.

### Quick Create Bar

The top bar has pill-style buttons for creating any record type: action item, idea, impact, account, contact, project, or summary. Click a button, fill the inline form, and save -- you stay on the dashboard the whole time. Save buttons show a spinner and disable while saving to prevent duplicates.

### Parking Lot

A full-width strip below the quick create bar with a lime green left border and car icon. Bookmark any item from the dashboard lists to "park" it here for quick access. Up to 5 items can be parked at a time. Click an action item or idea tile to open its view dialog inline; other entity types navigate to their list page. Click X to remove an item.

### Ideas Strip

A purple-accented horizontal strip showing all your ideas as tiles (160px wide). Each tile shows the idea name and category. Click to open the view/edit dialog inline on the dashboard.

### Personal Strip

A cyan-accented horizontal strip showing all non-complete personal action items as tiles. Each tile shows the name, date, and "Top Priority" label if applicable. Click to open the view/edit dialog inline.

### Work Card

A full-width tile grid showing all non-complete work action items. Tiles are arranged 4 per row. Top priority items appear first, then the rest -- all in a single unified grid. Each tile shows name, date, account, and badges for "Top Priority" or "Overdue". Click to open the view/edit dialog inline.

### Right Sidebar (Pinned Notes)

The right sidebar (260px, collapsible) shows pinned notes. Toggle it with the button in the quick create bar. Notes pinned from any entity appear here with an entity type label, 3-line preview, and attachment indicator. Click to expand in a dialog.

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

### Accounts

Track customer accounts with optional parent account relationships. The view dialog shows a 3-column layout with all related records: contacts, action items, ideas, impacts, meeting summaries, and a notes timeline.

### Contacts

Manage contact records linked to accounts. The view dialog shows contact details plus related ideas.

### Tasks (Action Items)

Task management with status, priority, and type tracking. Supports work/personal categorization. The view dialog shows details plus a notes timeline.

**Status workflow:** Recognized/Pondering -> In Progress -> Pending Communication -> On Hold -> Wrapping Up -> Complete

**Priority options:** Low... but on deck for sure | Eh... Get to it when you can | Top priority... no kidding! | High... next in line after top priority...

### Ideas

Idea pipeline with technology categorization (Copilot Studio, Canvas Apps, Model-Driven Apps, Power Automate, Power Pages, Azure, AI General, App General, Other). View dialog shows details plus a notes timeline.

### Projects

Project tracking linked to accounts. View dialog shows details plus a notes timeline.

### Impacts

Track business impacts with date and account association. Simple view dialog without notes.

### Meeting Summaries

Meeting documentation with extended text support (5000 char max). Wider dialog to accommodate summary text.

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

---

## Tips

- **Quick navigation:** Use the sidebar to jump between pages. Collapsed mode shows icons with tooltips.
- **Keyboard shortcut:** All entity pages support `?new=true` in the URL to auto-open the create dialog.
- **Deep links:** Tasks and Ideas support `?view=<id>` to link directly to a specific record's view dialog.
- **Parking lot:** Bookmark frequently-referenced items from dashboard lists for quick access (max 5).
- **Pin notes:** Pin important notes to the dashboard sidebar so they're always visible.
