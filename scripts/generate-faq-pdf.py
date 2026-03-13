"""
Generate faq.pdf from hardcoded content.
Uses fpdf2 -- no external dependencies beyond what's already installed.

Usage: python scripts/generate-faq-pdf.py
Output: docs/pdf/faq.pdf
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
Q_COLOR = (74, 158, 255)      # question color = brand blue


class FaqPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="Letter")
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*LIGHT)
        self.cell(0, 6, sanitize_text("boom! -- Frequently Asked Questions"), align="L")
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

    def question(self, text):
        self.ln(2)
        self.set_font("Helvetica", "B", 10.5)
        self.set_text_color(*Q_COLOR)
        self.multi_cell(0, 6, sanitize_text("Q: " + text))
        self.ln(1)

    def answer(self, text):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*DARK)
        self.multi_cell(0, 5.5, sanitize_text(text))
        self.ln(3)

    def body_text(self, text):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*DARK)
        self.multi_cell(0, 5.5, sanitize_text(text))
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

    def code_block(self, text):
        text = sanitize_text(text)
        lines = text.split("\n")
        line_h = 3.8
        padding = 4
        block_w = self.w - self.l_margin - self.r_margin
        block_h = len(lines) * line_h + padding * 2
        if self.get_y() + block_h > self.h - 25:
            self.add_page()
        y_start = self.get_y()
        self.set_fill_color(*CODE_BG)
        self.set_draw_color(*CODE_BORDER)
        self.rect(self.l_margin, y_start, block_w, block_h, "FD")
        self.set_font("Courier", "", 7)
        self.set_text_color(*DARK)
        self.set_xy(self.l_margin + padding, y_start + padding)
        for line in lines:
            self.set_x(self.l_margin + padding)
            self.cell(block_w - padding * 2, line_h, line)
            self.ln(line_h)
        self.set_y(y_start + block_h + 3)

    def horizontal_rule(self):
        self.ln(1)
        self.set_draw_color(*DIVIDER)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(3)


def build_pdf():
    pdf = FaqPDF()
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
    pdf.cell(0, 10, "Frequently Asked Questions", align="C", new_x="LMARGIN", new_y="NEXT")

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
        "Common questions about boom! -- setup, authentication, data, "
        "dashboard features, Copilot chat, theming, and development."
    ), align="C")

    # ====================================================================
    # GENERAL
    # ====================================================================
    pdf.add_page()
    pdf.section_title("General")

    pdf.question("What is boom!?")
    pdf.answer(
        "boom! is an internal business management tool built as a React SPA. It provides a "
        "unified interface for managing customer accounts, contacts, action items, projects, "
        "ideas, impacts, and meeting summaries -- all backed by Microsoft Dataverse."
    )

    pdf.question("Who is boom! for?")
    pdf.answer(
        "boom! is built for a Microsoft technical seller who needs to track customer "
        "relationships, action items, and ideas in a single place. It also serves as a "
        "reference architecture and sales demo for enterprise customers evaluating "
        "React + Dataverse + Copilot Studio."
    )

    pdf.question("Where is boom! hosted?")
    pdf.answer(
        "Azure Static Web Apps with a custom domain at ohgeesolutions.com. "
        "Global CDN distribution with automatic SSL."
    )

    # ====================================================================
    # AUTHENTICATION
    # ====================================================================
    pdf.section_title("Authentication")

    pdf.question("How do I sign in?")
    pdf.answer(
        'Click "Sign in with Microsoft" on the login page. boom! uses Azure AD (MSAL) '
        "with your organizational account. No separate credentials needed."
    )

    pdf.question("Why do I have to sign in again after closing the tab?")
    pdf.answer(
        "Tokens are stored in session storage, which is cleared when the browser tab "
        "closes. This is a security choice -- open a new tab and sign in again."
    )

    pdf.question("Does boom! support multiple tenants?")
    pdf.answer(
        "No. boom! is configured for a single Azure AD tenant. Multi-tenant access "
        "would require configuration changes to the MSAL setup."
    )

    # ====================================================================
    # DATA
    # ====================================================================
    pdf.section_title("Data")

    pdf.question("Where is my data stored?")
    pdf.answer(
        "All data is stored in Microsoft Dataverse (formerly Common Data Service). "
        "The app connects to the Dataverse Web API at "
        "https://og-dv.crm.dynamics.com/api/data/v9.2."
    )

    pdf.question('What happens when I "delete" a record?')
    pdf.answer(
        "Records are deactivated (statecode set to 1), not permanently deleted. "
        "They're hidden from all lists and views but still exist in Dataverse. "
        "Notes/annotations are the exception -- those are actually deleted."
    )

    pdf.question("Is there a limit to how many records I can see?")
    pdf.answer(
        "Queries are capped at 100 records ($top=100). Pagination is not currently "
        "implemented. If you have more than 100 records of a given type, only the "
        "first 100 will appear."
    )

    pdf.question("How are file attachments stored?")
    pdf.answer(
        "Files are stored as base64-encoded data in Dataverse's annotations table. "
        "Large files increase the record size. Keep attachments reasonable in size."
    )

    # ====================================================================
    # DASHBOARD
    # ====================================================================
    pdf.section_title("Dashboard")

    pdf.question("What is the parking lot?")
    pdf.answer(
        "A bookmarking feature on the dashboard. Click the bookmark icon on any item "
        "to park it for quick access. Up to 5 items at a time. Stored in your browser's "
        "localStorage -- per-browser, not synced across devices."
    )

    pdf.question("What are pinned notes?")
    pdf.answer(
        "Notes from accounts, action items, ideas, or projects pinned to the dashboard "
        "sidebar. They show a preview with entity type label and attachment indicator. "
        "Like the parking lot, pins are stored in localStorage."
    )

    pdf.question("Why don't I see the right sidebar?")
    pdf.answer(
        "The right sidebar only appears when you have pinned notes. If you have no "
        "pinned notes, it's hidden. You can also toggle it with the button in the "
        "quick create bar."
    )

    pdf.question("How is the dashboard sorted?")
    pdf.answer(
        "Action items are sorted by date ascending (overdue first, then nearest upcoming). "
        "Ideas are sorted by created date descending (newest first). "
        "Work and Personal strips follow the same date-ascending order as action items."
    )

    # ====================================================================
    # COPILOT CHAT
    # ====================================================================
    pdf.section_title("Copilot Chat")

    pdf.question("How do I open the AI chat?")
    pdf.answer("Click the rocket icon button in the bottom-right corner of any page.")

    pdf.question("Do I need to sign in separately for the chat?")
    pdf.answer(
        "No. The chat uses SSO (Single Sign-On) -- it automatically exchanges your "
        "Azure AD token with the Copilot Studio agent."
    )

    pdf.question("Can the chat access my Dataverse data?")
    pdf.answer(
        "The SSO token given to the bot is scoped to the bot's custom API only. "
        "It cannot directly access Dataverse data. The bot has its own knowledge "
        "sources configured in Copilot Studio."
    )

    pdf.question("What if the chat isn't responding?")
    pdf.answer(
        "The Direct Line connection may have timed out. Close the chat panel and "
        "reopen it. If the issue persists, the Copilot Studio agent may be down."
    )

    # ====================================================================
    # THEME & DESIGN
    # ====================================================================
    pdf.section_title("Theme & Design")

    pdf.question("How do I switch between dark and light mode?")
    pdf.answer(
        "Use the sun/moon toggle in the top bar. Your preference saves to localStorage "
        "and persists across sessions."
    )

    pdf.question("What font does boom! use?")
    pdf.answer(
        "Inter, loaded via Google Fonts. It's set as both the base font and monospace "
        "font in the Fluent UI theme tokens."
    )

    pdf.question("What's the design language?")
    pdf.answer(
        "Subtle 1px borders over shadows, 8px border-radius cards, lowercase monospace "
        "section headers with letter-spacing. Entity pages use accent-colored 3px left "
        "borders on DataGrid cards. Brand palette based on #4a9eff blue."
    )

    # ====================================================================
    # DEVELOPMENT
    # ====================================================================
    pdf.section_title("Development")

    pdf.question("How do I run boom! locally?")
    pdf.code_block(
        "npm install\n"
        'echo "REACT_APP_COPILOT_DIRECT_LINE_SECRET=secret" > .env\n'
        "npm start\n"
        "# App runs at http://localhost:3000"
    )

    pdf.question("How do I deploy?")
    pdf.code_block(
        "npm run build\n"
        "npx @azure/static-web-apps-cli deploy ./build \\\n"
        '  --deployment-token "<token>" --env production'
    )

    pdf.question("How do I add a new entity page?")
    pdf.bullet("Define the TypeScript interface in src/types/index.ts")
    pdf.bullet("Add CRUD functions in src/services/dataverseService.ts")
    pdf.bullet("Create the page component in src/pages/")
    pdf.bullet("Add the route in App.tsx")
    pdf.bullet("Add the nav item in AppShell.tsx")
    pdf.bullet("Update pageTitles in AppShell.tsx")

    pdf.question("What's the tdvsp_ prefix?")
    pdf.answer(
        "The Dataverse publisher prefix for custom tables in this environment. "
        "All custom entities use it (e.g., tdvsp_actionitems, tdvsp_ideas)."
    )

    # ====================================================================
    # KNOWN LIMITATIONS
    # ====================================================================
    pdf.section_title("Known Limitations")

    pdf.bullet("No offline support -- requires an active internet connection")
    pdf.bullet("100-record cap -- no pagination for large datasets")
    pdf.bullet("Session storage tokens -- cleared on tab close, re-auth required")
    pdf.bullet("Direct Line secret in bundle -- compiled into JS at build time")
    pdf.bullet("localStorage features (parking lot, pinned notes) are per-browser, not synced")

    # ====================================================================
    # OUTPUT
    # ====================================================================
    out_dir = os.path.join(os.path.dirname(__file__), "..", "docs", "pdf")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "faq.pdf")
    pdf.output(out_path)
    print(f"PDF generated: {os.path.abspath(out_path)}")


if __name__ == "__main__":
    build_pdf()
