"""
Generate how-i-was-built.pdf from hardcoded content.
Uses fpdf2 -- no external dependencies beyond what's already installed.

Usage: python scripts/generate-how-i-was-built-pdf.py
Output: docs/pdf/how-i-was-built.pdf
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
QUOTE_BORDER = (74, 158, 255)

RED     = (248, 113, 113)
PURPLE  = (167, 139, 250)
AMBER   = (245, 158, 11)
CYAN    = (34, 211, 238)
GREEN   = (61, 214, 140)


class HowBuiltPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="Letter")
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*LIGHT)
        self.cell(0, 6, sanitize_text("boom! -- How I Was Built"), align="L")
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

    def phase_box(self, phase_num, title, prompt, result, decision):
        """Draw a phase block with prompt pattern, result, and key decision."""
        # Phase header
        self.ln(2)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(*ACCENT)
        self.cell(0, 8, sanitize_text(f"Phase {phase_num}: {title}"),
                  new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

        # Prompt pattern
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*MED)
        self.cell(0, 5, "Prompt pattern:", new_x="LMARGIN", new_y="NEXT")
        self.blockquote(prompt)

        # Result
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*MED)
        self.cell(0, 5, "Result:", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*DARK)
        self.multi_cell(0, 5.5, sanitize_text(result))
        self.ln(1)

        # Key decision
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*MED)
        self.cell(0, 5, "Key decision:", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*DARK)
        self.multi_cell(0, 5.5, sanitize_text(decision))
        self.ln(3)

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


def build_pdf():
    pdf = HowBuiltPDF()
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
    pdf.cell(0, 10, "How I Was Built", align="C", new_x="LMARGIN", new_y="NEXT")

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
        "The story of how boom! was built -- from first prompt to production app. "
        "A React SPA built through conversations with Claude Code."
    ), align="C")

    # ====================================================================
    # THE SHORT VERSION
    # ====================================================================
    pdf.add_page()
    pdf.section_title("The Short Version")

    pdf.body_text(
        "boom! is a React single-page application built almost entirely through "
        "conversations with Claude Code. The human (O'G) provided direction, design taste, "
        "and Dataverse domain knowledge. Claude wrote the code, built the components, and "
        "iterated on the design. The result is an internal business tool that manages "
        "customer data in Microsoft Dataverse with a custom UI, dark/light theming, and "
        "an embedded Copilot Studio AI assistant."
    )

    pdf.callout_box(
        "Bottom Line",
        "One person + one AI coding assistant = a production React app with 7 entity pages, "
        "a feature-rich dashboard, notes with attachments, dark/light theming, Azure AD auth, "
        "and an embedded AI chat widget. No team. No sprints. Just conversations."
    )

    # ====================================================================
    # THE STACK DECISION
    # ====================================================================
    pdf.section_title("The Stack Decision")

    pdf.subsection_title("Why React + Dataverse?")
    pdf.body_text(
        "O'G is a Microsoft technical seller. The data already lived in Dataverse -- accounts, "
        "contacts, tasks, ideas, impacts, projects, meeting summaries. The question was: build "
        "a custom front-end or keep using model-driven apps?"
    )
    pdf.body_text(
        "The answer: build a custom React SPA. It serves double duty -- a real daily-driver "
        "tool and a reference architecture for enterprise customers evaluating "
        "React + Dataverse + Azure Static Web Apps."
    )

    pdf.subsection_title("Why Fluent UI v9?")
    pdf.body_text(
        "Microsoft's own design system. Consistent with the platform story, and the DataGrid "
        "component handles tabular data patterns well. The entire app uses Fluent UI -- no "
        "mixing of component libraries."
    )

    pdf.subsection_title("Why Azure Static Web Apps?")
    pdf.body_text(
        "Zero server management, global CDN, automatic SSL, SPA routing built in. For a "
        "client-side-only app that talks directly to Dataverse, there's no need for a "
        "backend server."
    )

    # ====================================================================
    # HOW IT WAS BUILT (PHASES)
    # ====================================================================
    pdf.section_title("How It Was Built")

    pdf.phase_box(
        1, "Foundation",
        "Create a React SPA with MSAL authentication that connects to Dataverse Web API",
        "App.tsx with provider hierarchy (MSAL -> Theme -> Fluent -> Router), "
        "dataverseService.ts with the apiRequest helper, msalConfig.ts with Azure AD settings.",
        "Token provider pattern -- TokenProviderSetup gates the entire app until the "
        "Dataverse token is ready. Every API call gets a fresh token."
    )

    pdf.phase_box(
        2, "Entity Pages",
        "Add a Tasks page with DataGrid showing all action items, with create/edit/view dialogs",
        "7 entity pages (Accounts, Contacts, Tasks, Ideas, Projects, Impacts, Meeting "
        "Summaries) all following the same conventions.",
        "Inline edit pattern -- view dialogs double as edit dialogs via an isEditing toggle. "
        "No separate edit page or modal."
    )

    pdf.phase_box(
        3, "Dashboard",
        "Build a dashboard with quick create, work/personal sections, and bookmarking",
        "Quick create bar + parking lot strip + ideas strip + personal strip + work tile "
        "grid + right sidebar with pinned notes.",
        "Inline view/edit dialogs on the dashboard -- clicking an action item or idea opens "
        "its full dialog without navigating away."
    )

    pdf.phase_box(
        4, "Design System",
        "Custom brand palette, Inter font, dark theme as primary experience",
        "ogBrand palette based on #4a9eff, Inter everywhere, subtle 1px borders, lowercase "
        "monospace headers, accent-colored DataGrid left borders.",
        "Each entity type gets its own accent color (red tasks, purple ideas, amber impacts, "
        "etc.). Cards: 8px radius, 1px border, no shadow."
    )

    pdf.phase_box(
        5, "Copilot Integration",
        "Add a floating chat widget connected to Copilot Studio via Direct Line with SSO",
        "CopilotChat.tsx with Bot Framework Web Chat, SSO token exchange middleware, "
        "rocket icon button.",
        "SSO token exchange so users never see a sign-in card. Rocket icon matches the "
        "favicon. Direct Line secret in .env, exchanged for conversation token at runtime."
    )

    pdf.phase_box(
        6, "Notes & Attachments",
        "Add a notes timeline to accounts, tasks, ideas, and projects with file attachments and pinning",
        "Shared NotesTimeline component with add/delete/pin/download capabilities.",
        "Polymorphic annotations table in Dataverse -- one table handles notes for all entity "
        "types via the objectid lookup."
    )

    # ====================================================================
    # DESIGN PRINCIPLES
    # ====================================================================
    pdf.section_title("Design Principles")

    pdf.body_text("These emerged through building, not from a design doc:")

    pdf.bullet(
        "Edit in place, create from the dashboard, view details in dialogs. "
        "Minimize page transitions.",
        bold_lead="Inline over navigate."
    )
    pdf.bullet(
        "All records set statecode to 1 instead of being deleted. Fetch queries filter "
        "by statecode eq 0. Annotations are the exception.",
        bold_lead="Deactivate, don't delete."
    )
    pdf.bullet(
        "Nav labels, panel titles, section headers. The app has a deliberate "
        "lowercase aesthetic.",
        bold_lead="Lowercase everything."
    )
    pdf.bullet(
        "Subtle 1px borders define surfaces. No drop shadows, no floating cards.",
        bold_lead="Borders over shadows."
    )
    pdf.bullet(
        "Every save/update/deactivate shows a spinner and disables the button. "
        "Toast notifications on success/error.",
        bold_lead="Save feedback."
    )

    # ====================================================================
    # TOOLS USED
    # ====================================================================
    pdf.section_title("Tools Used")

    cw = [45, 125]
    pdf.styled_table(
        ["Tool", "Role"],
        [
            ["Claude Code", "Primary developer -- wrote all application code"],
            ["VS Code", "Editor (via Claude Code CLI)"],
            ["npm", "Package management"],
            ["React 19", "UI framework"],
            ["TypeScript", "Type safety"],
            ["Fluent UI v9", "Component library"],
            ["MSAL.js", "Azure AD authentication"],
            ["Dataverse Web API", "Backend data"],
            ["Azure Static Web Apps", "Hosting"],
            ["Copilot Studio", "AI assistant agent"],
            ["Bot Framework Web Chat", "Chat widget"],
            ["Inter (Google Fonts)", "Typography"],
        ],
        cw,
    )

    # ====================================================================
    # LESSONS LEARNED
    # ====================================================================
    pdf.section_title("Lessons Learned")

    pdf.bullet(
        'Dataverse field names don\'t match display names. "Task Priority" is tdvsp_priority, '
        "not tdvsp_taskpriority. An invalid field in $select returns a 400 and the whole "
        "list appears empty.",
        bold_lead="1. Field name gotcha."
    )

    pdf.bullet(
        "Gating the app behind TokenProviderSetup prevents any API call from firing before "
        "auth is ready. Every call gets a fresh token -- no stale token bugs.",
        bold_lead="2. Token provider pattern."
    )

    pdf.bullet(
        "One dialog with an isEditing toggle is less code and better UX than separate view/edit "
        "modes. But you must reset isEditing and editingId when the dialog closes.",
        bold_lead="3. Inline edit simplicity."
    )

    pdf.bullet(
        "Fine for a single-user tool but wouldn't scale to multi-device. Could be moved "
        "to Dataverse user settings if needed.",
        bold_lead="4. localStorage is per-browser."
    )

    pdf.bullet(
        "The secret is in the JavaScript bundle. Exchanging it immediately for a conversation "
        "token limits exposure. Acceptable for an internal tool.",
        bold_lead="5. Direct Line secrets in SPAs."
    )

    pdf.bullet(
        "Getting surface colors, borders, and text contrast right in dark mode takes more "
        "iteration than light mode. The ogDarkTheme tokens required comprehensive overrides.",
        bold_lead="6. Dark theme is harder."
    )

    # ====================================================================
    # OUTPUT
    # ====================================================================
    out_dir = os.path.join(os.path.dirname(__file__), "..", "docs", "pdf")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "how-i-was-built.pdf")
    pdf.output(out_path)
    print(f"PDF generated: {os.path.abspath(out_path)}")


if __name__ == "__main__":
    build_pdf()
