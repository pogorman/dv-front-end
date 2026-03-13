"""
Generate user-guide.pdf from hardcoded content.
Uses fpdf2 -- no external dependencies beyond what's already installed.

Usage: python scripts/generate-user-guide-pdf.py
Output: docs/pdf/user-guide.pdf
"""

from fpdf import FPDF
import os


def sanitize_text(text):
    """Replace Unicode characters that Helvetica cannot render."""
    return (
        text
        .replace("\u2014", "--")    # em dash
        .replace("\u2013", "-")     # en dash
        .replace("\u2018", "'")     # left single quote
        .replace("\u2019", "'")     # right single quote
        .replace("\u201c", '"')     # left double quote
        .replace("\u201d", '"')     # right double quote
        .replace("\u2026", "...")   # ellipsis
        .replace("\u2192", "->")   # right arrow
        .replace("\u2022", "-")    # bullet
        .replace("\u2003", " ")    # em space
    )


# -- Color palette (boom! brand) ---------------------------------------------
BRAND   = (74, 158, 255)
NAVY    = (10, 14, 24)
ACCENT  = (74, 158, 255)
DARK    = (40, 40, 40)
MED     = (90, 90, 90)
LIGHT   = (130, 130, 130)
WHITE   = (255, 255, 255)
ROW_ALT = (241, 245, 249)
ROW_WHT = (255, 255, 255)
TABLE_HEADER_BG = (15, 20, 35)
TABLE_HEADER_FG = (255, 255, 255)
DIVIDER = (200, 210, 220)
GRAY_BG = (248, 249, 250)
CODE_BG = (243, 244, 246)
CODE_BORDER = (220, 220, 220)
QUOTE_BG = (248, 249, 252)
QUOTE_BORDER = (74, 158, 255)

RED     = (248, 113, 113)
PURPLE  = (167, 139, 250)
AMBER   = (245, 158, 11)
CYAN    = (34, 211, 238)
GREEN   = (61, 214, 140)
LIME    = (132, 204, 22)


class UserGuidePDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="Letter")
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*LIGHT)
        self.cell(0, 6, sanitize_text("boom! -- User Guide"), align="L")
        self.cell(0, 6, f"Page {self.page_no()}", align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*DIVIDER)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-18)
        self.set_draw_color(*DIVIDER)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.set_font("Helvetica", "", 7)
        self.set_text_color(*LIGHT)
        self.ln(3)
        self.cell(0, 4, sanitize_text("Confidential | March 2026"), align="C")

    # -- Helpers --------------------------------------------------------------
    def section_title(self, text):
        self.ln(4)
        self.set_font("Helvetica", "B", 15)
        self.set_text_color(*NAVY)
        self.cell(0, 9, sanitize_text(text), new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*ACCENT)
        self.set_line_width(0.6)
        self.line(self.l_margin, self.get_y(), self.l_margin + 50, self.get_y())
        self.set_line_width(0.2)
        self.ln(5)

    def subsection_title(self, text):
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*ACCENT)
        self.cell(0, 7, sanitize_text(text), new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_text(self, text, bold_lead=None):
        text = sanitize_text(text)
        if bold_lead:
            self.set_font("Helvetica", "B", 9.5)
            self.set_text_color(*DARK)
            self.write(5.5, sanitize_text(bold_lead) + " ")
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*DARK)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet(self, text, bold_lead=None, indent=8):
        text = sanitize_text(text)
        x = self.get_x()
        self.set_x(x + indent)
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*MED)
        dash_w = self.get_string_width("- ")
        self.write(5.5, "- ")
        if bold_lead:
            self.set_font("Helvetica", "B", 9.5)
            self.set_text_color(*DARK)
            self.write(5.5, sanitize_text(bold_lead) + "  ")
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*DARK)
        old_l = self.l_margin
        self.l_margin = x + indent + dash_w
        self.multi_cell(self.w - self.r_margin - self.get_x(), 5.5, text)
        self.l_margin = old_l
        self.ln(1)

    def numbered_item(self, number, text, bold_lead=None, indent=8):
        x = self.get_x()
        self.set_x(x + indent)
        self.set_font("Helvetica", "B", 9.5)
        self.set_text_color(*ACCENT)
        num_str = f"{number}. "
        num_w = self.get_string_width(num_str)
        self.write(5.5, num_str)
        if bold_lead:
            self.set_text_color(*DARK)
            self.write(5.5, sanitize_text(bold_lead) + "  ")
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*DARK)
        old_l = self.l_margin
        self.l_margin = x + indent + num_w
        self.multi_cell(self.w - self.r_margin - self.get_x(), 5.5, sanitize_text(text))
        self.l_margin = old_l
        self.ln(1)

    def styled_table(self, headers, rows, col_widths, row_height=6, font_size=7.5):
        self.set_font("Helvetica", "B", font_size)
        self.set_fill_color(*TABLE_HEADER_BG)
        self.set_text_color(*TABLE_HEADER_FG)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], row_height + 1, sanitize_text(h), border=0, align="C", fill=True)
        self.ln()
        self.set_font("Helvetica", "", font_size)
        for r_idx, row in enumerate(rows):
            bg = ROW_ALT if r_idx % 2 == 0 else ROW_WHT
            self.set_fill_color(*bg)
            for i, val in enumerate(row):
                self.set_text_color(*DARK)
                self.cell(col_widths[i], row_height, sanitize_text(val), border=0,
                          align="C" if i > 0 else "L", fill=True)
            self.ln()

    def callout_box(self, title, text, height=None):
        pad = 5
        box_w = self.w - self.l_margin - self.r_margin
        inner_w = box_w - pad * 2
        self.set_font("Helvetica", "B", 11)
        title_h = 7
        self.set_font("Helvetica", "", 10)
        body_h = self.multi_cell(inner_w, 6, sanitize_text(text), dry_run=True, output="HEIGHT")
        total_h = height or (pad + title_h + 2 + body_h + pad)
        self.set_fill_color(*GRAY_BG)
        self.set_draw_color(*ACCENT)
        box_y = self.get_y()
        self.rect(self.l_margin, box_y, box_w, total_h, "FD")
        self.set_xy(self.l_margin + pad, box_y + pad)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*NAVY)
        self.cell(0, title_h, sanitize_text(title))
        self.set_xy(self.l_margin + pad, box_y + pad + title_h + 2)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*DARK)
        self.multi_cell(inner_w, 6, sanitize_text(text))
        self.set_y(box_y + total_h + 4)

    def blockquote(self, text):
        text = sanitize_text(text)
        y_start = self.get_y()
        self.set_x(self.l_margin + 6)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(*MED)
        cell_w = self.w - self.l_margin - self.r_margin - 12
        self.multi_cell(cell_w, 5, text)
        y_end = self.get_y()
        self.set_draw_color(*QUOTE_BORDER)
        self.set_line_width(0.8)
        self.line(self.l_margin + 3, y_start, self.l_margin + 3, y_end)
        self.set_line_width(0.2)
        self.ln(2)

    def horizontal_rule(self):
        self.ln(2)
        self.set_draw_color(*DIVIDER)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)


def build_pdf():
    pdf = UserGuidePDF()
    pdf.set_margins(20, 20, 20)

    # ====================================================================
    # COVER PAGE
    # ====================================================================
    pdf.add_page()
    pdf.set_fill_color(*NAVY)
    pdf.rect(0, 0, pdf.w, 100, "F")

    pdf.set_y(30)
    pdf.set_font("Helvetica", "B", 36)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 16, "boom!", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 16)
    pdf.set_text_color(*BRAND)
    pdf.cell(0, 10, "User Guide", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(70)
    pdf.set_draw_color(*BRAND)
    pdf.set_line_width(0.4)
    pdf.line(pdf.w * 0.3, pdf.get_y(), pdf.w * 0.7, pdf.get_y())
    pdf.set_line_width(0.2)

    pdf.set_y(78)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(160, 185, 210)
    pdf.cell(0, 7, "March 2026", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(110)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*MED)
    pdf.multi_cell(0, 6.5, sanitize_text(
        "How to use boom! -- your internal business management tool for "
        "accounts, contacts, tasks, ideas, impacts, projects, and meeting summaries."
    ), align="C")

    # ====================================================================
    # GETTING STARTED
    # ====================================================================
    pdf.add_page()
    pdf.section_title("1. Getting Started")

    pdf.numbered_item(1, "Navigate to ohgeesolutions.com in your browser")
    pdf.numbered_item(2, 'Click "Sign in with Microsoft" and authenticate with your organizational account')
    pdf.numbered_item(3, "You will land on the Dashboard showing an overview of your data")

    pdf.callout_box(
        "Tip",
        "boom! uses your Azure AD credentials -- no separate account needed. "
        "Your session persists until you close the browser tab."
    )

    # ====================================================================
    # NAVIGATION
    # ====================================================================
    pdf.section_title("2. Navigation")

    pdf.body_text(
        "The sidebar (left) organizes pages into sections. Click the chevron at the top "
        "to collapse/expand it. The current page is highlighted in blue."
    )

    cw = [30, 75, 65]
    pdf.styled_table(
        ["Section", "Pages", "Icons"],
        [
            ["(Top)", "dashboard", "Home"],
            ["activity", "tasks, ideas, impacts", "CheckboxChecked, Lightbulb, Flash"],
            ["core", "accounts, contacts, projects, summaries", "Building, Person, Briefcase, People"],
            ["(Bottom)", "about this site", "Info"],
        ],
        cw,
    )

    pdf.ln(3)
    pdf.body_text(
        "At the bottom of the sidebar you'll find your avatar, name, and a Sign out button."
    )

    # ====================================================================
    # DASHBOARD
    # ====================================================================
    pdf.section_title("3. Dashboard")

    pdf.body_text(
        "The dashboard is your home base. Everything is visible at a glance, and most "
        "actions can be performed without leaving the page."
    )

    pdf.subsection_title("Quick Create Bar")
    pdf.body_text(
        "The top bar has pill-style buttons for creating any record type: action item, idea, "
        "impact, account, contact, project, or summary. Click a button, fill the inline form, "
        "and save -- you stay on the dashboard. Save buttons show a spinner while saving."
    )

    pdf.subsection_title("Parking Lot")
    pdf.body_text(
        "A full-width strip below the quick create bar with a lime green left border and car "
        "icon. Bookmark items from dashboard lists to park them here for quick access. Max 5 "
        "items. Click action items/ideas to open inline view dialogs; other types navigate to "
        "their list page. Click X to remove."
    )

    pdf.subsection_title("Ideas Strip")
    pdf.body_text(
        "A purple-accented horizontal strip showing all ideas as 160px tiles. Each tile shows "
        "name and category. Click to open the view/edit dialog inline."
    )

    pdf.subsection_title("Personal Strip")
    pdf.body_text(
        "A cyan-accented strip showing all non-complete personal action items as tiles. Shows "
        'name, date, and "Top Priority" label. Click to open inline.'
    )

    pdf.subsection_title("Work Card")
    pdf.body_text(
        "Full-width tile grid showing all non-complete work action items. 4 tiles per row. "
        "Top priority items appear first. Each tile shows name, date, account, and badges "
        'for "Top Priority" or "Overdue". Click to open inline.'
    )

    pdf.subsection_title("Right Sidebar (Pinned Notes)")
    pdf.body_text(
        "The right sidebar (260px, collapsible) shows pinned notes. Toggle with the button in "
        "the quick create bar. Notes pinned from any entity appear here with a preview and "
        "attachment indicator. Click to expand."
    )

    # ====================================================================
    # WORKING WITH RECORDS
    # ====================================================================
    pdf.section_title("4. Working with Records")

    pdf.subsection_title("Creating a Record")
    pdf.body_text("From any entity page:")
    pdf.numbered_item(1, "Navigate to the page (e.g., tasks)")
    pdf.numbered_item(2, 'Click the "New" button in the top-right')
    pdf.numbered_item(3, "Fill in the form fields and click Save")
    pdf.ln(2)
    pdf.body_text("Or use the Quick Create bar on the Dashboard to create any record type inline.")

    pdf.subsection_title("Viewing a Record")
    pdf.body_text(
        "Click the name of any record (shown as a blue link) to open its view dialog. "
        "View dialogs show all details plus related records where applicable."
    )

    pdf.subsection_title("Editing a Record")
    pdf.numbered_item(1, "Open the view dialog by clicking the record name")
    pdf.numbered_item(2, "Click Edit -- fields switch inline from read-only to editable")
    pdf.numbered_item(3, "Modify fields and click Save (button disables with spinner)")
    pdf.numbered_item(4, "Click Cancel to discard changes and return to view mode")

    pdf.subsection_title("Deactivating a Record")
    pdf.body_text(
        "Click the trash icon in grid actions or on dashboard tiles and confirm. Records are "
        "deactivated (hidden from lists) rather than permanently deleted."
    )

    # ====================================================================
    # ENTITY PAGES
    # ====================================================================
    pdf.section_title("5. Entity Pages")

    pdf.subsection_title("Accounts")
    pdf.body_text(
        "Track customer accounts with optional parent account relationships. View dialog shows "
        "a 3-column layout: contacts + action items + ideas | impacts + summaries | notes timeline."
    )

    pdf.subsection_title("Contacts")
    pdf.body_text(
        "Manage contacts linked to accounts. View dialog shows contact details plus related ideas."
    )

    pdf.subsection_title("Tasks (Action Items)")
    pdf.body_text(
        "Task management with status, priority, and type (work/personal). View dialog shows "
        "details plus notes timeline."
    )
    pdf.bullet("Status: Recognized/Pondering -> In Progress -> Pending Communication -> On Hold -> Wrapping Up -> Complete")
    pdf.bullet("Priority: Low | Eh | Top priority | High")

    pdf.subsection_title("Ideas")
    pdf.body_text(
        "Idea pipeline with technology categorization (Copilot Studio, Canvas Apps, Model-Driven Apps, "
        "Power Automate, Power Pages, Azure, AI General, App General, Other). View dialog shows details "
        "plus notes timeline."
    )

    pdf.subsection_title("Projects")
    pdf.body_text("Project tracking linked to accounts. View dialog shows details plus notes timeline.")

    pdf.subsection_title("Impacts")
    pdf.body_text("Track business impacts with date and account. Simple view dialog without notes.")

    pdf.subsection_title("Meeting Summaries")
    pdf.body_text("Meeting documentation with 5000-char summary support. Wider dialog for text.")

    # ====================================================================
    # NOTES & ATTACHMENTS
    # ====================================================================
    pdf.section_title("6. Notes & Attachments")

    pdf.body_text("Notes are available on accounts, action items, ideas, and projects.")

    pdf.numbered_item(1, "Open a record's view dialog to see its Notes Timeline (right column)")
    pdf.numbered_item(2, "Type a note and click Add Note")
    pdf.numbered_item(3, "Click Attach to add a file (stored as base64 in Dataverse)")
    pdf.numbered_item(4, "Click the pin icon to pin a note to the dashboard")
    pdf.numbered_item(5, "Click the download icon on an attached file to download it")
    pdf.numbered_item(6, "Click the delete icon to permanently remove a note")

    # ====================================================================
    # THEME & COPILOT
    # ====================================================================
    pdf.section_title("7. Theme & Copilot")

    pdf.subsection_title("Theme Toggle")
    pdf.body_text(
        "Use the sun/moon toggle in the top bar to switch between light and dark mode. "
        "Your preference is saved and persists across sessions. On first visit, the app "
        "respects your system preference."
    )

    pdf.subsection_title("Copilot Assistant")
    pdf.body_text(
        "Click the rocket icon button (bottom-right corner) to open the AI chat panel. "
        "The assistant connects via SSO -- no additional sign-in needed. Close and reopen "
        "to continue the same conversation. The chat adapts to your current theme."
    )

    # ====================================================================
    # TIPS
    # ====================================================================
    pdf.section_title("8. Tips & Shortcuts")

    pdf.bullet("Use the sidebar for quick navigation. Collapsed mode shows icons with tooltips.", bold_lead="Navigation")
    pdf.bullet("All entity pages support ?new=true in the URL to auto-open the create dialog.", bold_lead="Quick create")
    pdf.bullet("Tasks and Ideas support ?view=<id> to link directly to a record's view dialog.", bold_lead="Deep links")
    pdf.bullet("Bookmark items from dashboard lists for quick access (max 5).", bold_lead="Parking lot")
    pdf.bullet("Pin important notes to the dashboard sidebar so they're always visible.", bold_lead="Pin notes")

    # ====================================================================
    # OUTPUT
    # ====================================================================
    out_dir = os.path.join(os.path.dirname(__file__), "..", "docs", "pdf")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "user-guide.pdf")
    pdf.output(out_path)
    print(f"PDF generated: {os.path.abspath(out_path)}")


if __name__ == "__main__":
    build_pdf()
