"""
Generate architecture.pdf from hardcoded content.
Uses fpdf2 -- no external dependencies beyond what's already installed.

Usage: python scripts/generate-architecture-pdf.py
Output: docs/pdf/architecture.pdf
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
BRAND   = (74, 158, 255)     # #4a9eff
NAVY    = (10, 14, 24)       # dark cover bg
ACCENT  = (74, 158, 255)     # same as brand
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

# Entity accent colors
RED     = (248, 113, 113)    # #f87171 tasks
PURPLE  = (167, 139, 250)    # #a78bfa ideas
AMBER   = (245, 158, 11)     # #f59e0b impacts
CYAN    = (34, 211, 238)     # #22d3ee contacts
GREEN   = (61, 214, 140)     # #3dd68c summaries


class ArchitecturePDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="Letter")
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*LIGHT)
        self.cell(0, 6, sanitize_text("boom! -- Architecture"), align="L")
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
        content_x = self.get_x()
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
        self.set_draw_color(*DIVIDER)
        self.rect(self.l_margin, y_start, block_w, block_h, "FD")
        self.set_font("Courier", "", 7)
        self.set_text_color(*DARK)
        self.set_xy(self.l_margin + padding, y_start + padding)
        for line in lines:
            self.set_x(self.l_margin + padding)
            self.cell(block_w - padding * 2, line_h, line)
            self.ln(line_h)
        self.set_y(y_start + block_h + 3)

    def color_swatch(self, name, color, hex_code, x, y):
        """Draw a small color swatch with label."""
        self.set_fill_color(*color)
        self.rect(x, y, 6, 6, "F")
        self.set_xy(x + 8, y)
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(*DARK)
        self.cell(25, 6, sanitize_text(name))
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*MED)
        self.cell(20, 6, hex_code)


def build_pdf():
    pdf = ArchitecturePDF()
    pdf.set_margins(20, 20, 20)

    # ====================================================================
    # COVER PAGE
    # ====================================================================
    pdf.add_page()
    pdf.set_fill_color(*NAVY)
    pdf.rect(0, 0, pdf.w, 120, "F")

    pdf.set_y(35)
    pdf.set_font("Helvetica", "B", 36)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 16, "boom!", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 16)
    pdf.set_text_color(*BRAND)
    pdf.cell(0, 10, "Architecture", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(80)
    pdf.set_draw_color(*BRAND)
    pdf.set_line_width(0.4)
    pdf.line(pdf.w * 0.3, pdf.get_y(), pdf.w * 0.7, pdf.get_y())
    pdf.set_line_width(0.2)

    pdf.set_y(90)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(160, 185, 210)
    pdf.cell(0, 7, "System Design | March 2026", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(140)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*MED)
    pdf.multi_cell(0, 6.5, sanitize_text(
        "React 19 SPA with Fluent UI v9, MSAL authentication, "
        "Dataverse Web API backend, and embedded Copilot Studio agent. "
        "Hosted on Azure Static Web Apps at ohgeesolutions.com."
    ), align="C")

    # ====================================================================
    # 1. HIGH-LEVEL ARCHITECTURE
    # ====================================================================
    pdf.add_page()
    pdf.section_title("1. High-Level Architecture")

    pdf.body_text(
        "boom! is a React single-page application (SPA) hosted on Azure Static Web Apps. "
        "It connects to Microsoft Dataverse via the Web API for all data operations and embeds "
        "a Copilot Studio agent for conversational AI assistance."
    )

    pdf.code_block(
        "Browser\n"
        "  +-- boom! React SPA\n"
        "  |     +-- AppShell (sidebar + top bar)\n"
        "  |     +-- Pages (CRUD for 7 entities)\n"
        "  |     +-- CopilotChat (Bot Framework Web Chat)\n"
        "  |     +-- dataverseService.ts (API layer)\n"
        "  |     +-- Direct Line + SSO token\n"
        "  |\n"
        "  +-- Azure AD (MSAL) ---- authentication\n"
        "  +-- Dataverse Web API --- data (OData v4)\n"
        "  +-- Copilot Studio ----- AI assistant"
    )

    # ====================================================================
    # 2. TECHNOLOGY STACK
    # ====================================================================
    pdf.section_title("2. Technology Stack")

    cw = [40, 50, 85]
    pdf.styled_table(
        ["Layer", "Technology", "Purpose"],
        [
            ["UI Framework", "React 19 + TypeScript", "Component-based SPA"],
            ["Components", "Fluent UI v9", "Microsoft design system"],
            ["Auth", "MSAL.js (@azure/msal-react)", "Azure AD OAuth 2.0 / OIDC"],
            ["Routing", "React Router v7", "Client-side navigation"],
            ["Backend", "Dataverse Web API", "OData v4 REST API"],
            ["AI Assistant", "Copilot Studio + Web Chat", "Conversational agent"],
            ["Hosting", "Azure Static Web Apps", "Global CDN, auto SSL"],
            ["Font", "Inter (Google Fonts)", "All UI text"],
            ["Styling", "Griffel (makeStyles)", "CSS-in-JS, component-scoped"],
        ],
        cw,
    )

    # ====================================================================
    # 3. AUTHENTICATION FLOW
    # ====================================================================
    pdf.section_title("3. Authentication Flow")

    pdf.body_text(
        "The app uses MSAL.js for Azure AD authentication with the authorization code flow "
        "and PKCE. Tokens are stored in session storage (cleared on tab close)."
    )

    pdf.subsection_title("Flow")

    pdf.bullet("App.tsx creates a PublicClientApplication from MSAL config")
    pdf.bullet("MsalProvider wraps the entire component tree")
    pdf.bullet("Unauthenticated users see Login page with 'Sign in with Microsoft' button")
    pdf.bullet("Authenticated users pass through TokenProviderSetup, which gates children until the token provider is ready")
    pdf.bullet("Token provider tries acquireTokenSilent first, falls back to acquireTokenPopup")
    pdf.bullet("Once set, all child components can make authenticated Dataverse API calls")

    pdf.subsection_title("Token Scopes")

    cw2 = [85, 85]
    pdf.styled_table(
        ["Scope", "Used For"],
        [
            ["https://og-dv.crm.dynamics.com/.default", "All Dataverse Web API calls"],
            ["api://3c6a1f01.../mcs-read-scope", "Copilot Studio SSO exchange"],
        ],
        cw2,
    )

    # ====================================================================
    # 4. SECURITY ARCHITECTURE
    # ====================================================================
    pdf.section_title("4. Security Architecture")

    pdf.subsection_title("Authentication Controls")
    pdf.bullet("Azure AD single-tenant authentication required for all access")
    pdf.bullet("MSAL.js handles OAuth 2.0 authorization code flow with PKCE")
    pdf.bullet("Tokens stored in session storage (cleared on tab close)")
    pdf.bullet("Silent token refresh with popup fallback")

    pdf.subsection_title("Application Security")
    pdf.bullet("No backend server -- all API calls go directly to Dataverse with user's delegated token")
    pdf.bullet("Dataverse enforces row-level security based on the authenticated user")
    pdf.bullet("No secrets in source code (Direct Line secret is the sole .env variable)")
    pdf.bullet("SPA fallback routing handled by Azure Static Web Apps")

    pdf.subsection_title("Copilot Agent Security")
    pdf.bullet("Direct Line secret exchanged for short-lived conversation token immediately")
    pdf.bullet("SSO token scoped to bot's custom API -- cannot access Dataverse")
    pdf.bullet("User identity passed from MSAL account to bot context")
    pdf.bullet("File uploads disabled in Web Chat")

    # ====================================================================
    # 5. DATA ARCHITECTURE
    # ====================================================================
    pdf.add_page()
    pdf.section_title("5. Data Architecture")

    pdf.subsection_title("Dataverse Environment")
    pdf.bullet("Environment URL: https://og-dv.crm.dynamics.com", bold_lead="URL")
    pdf.bullet("API Endpoint: https://og-dv.crm.dynamics.com/api/data/v9.2", bold_lead="API")
    pdf.bullet("Publisher Prefix: tdvsp_ (for custom tables)", bold_lead="Prefix")

    pdf.subsection_title("Table Reference")

    cw3 = [30, 42, 38, 38]
    pdf.styled_table(
        ["Entity", "Dataverse Table", "Primary Key", "Account Lookup"],
        [
            ["Accounts", "accounts", "accountid", "parentaccountid (self)"],
            ["Contacts", "contacts", "contactid", "parentcustomerid"],
            ["Action Items", "tdvsp_actionitems", "tdvsp_actionitemid", "tdvsp_Customer"],
            ["Impacts", "tdvsp_impacts", "tdvsp_impactid", "tdvsp_Customer"],
            ["Ideas", "tdvsp_ideas", "tdvsp_ideaid", "tdvsp_Account"],
            ["Projects", "tdvsp_projects", "tdvsp_projectid", "tdvsp_Account"],
            ["Summaries", "tdvsp_meetingsummaries", "tdvsp_meetingsummaryid", "tdvsp_Account"],
            ["Notes", "annotations", "annotationid", "objectid (poly)"],
        ],
        cw3,
    )

    pdf.subsection_title("OData API Patterns")

    pdf.body_text("Reading data with expanded lookups:")
    pdf.code_block(
        "GET /accounts?$select=accountid,name\n"
        "  &$expand=parentaccountid($select=accountid,name)\n"
        "  &$orderby=name asc&$top=100"
    )

    pdf.body_text("Creating records with lookup binding:")
    pdf.code_block(
        'POST /tdvsp_actionitems\n'
        '{\n'
        '  "tdvsp_name": "Follow up on proposal",\n'
        '  "tdvsp_date": "2026-02-16",\n'
        '  "tdvsp_Customer@odata.bind": "/accounts(guid)"\n'
        '}'
    )

    pdf.body_text("Deactivation (soft delete):")
    pdf.code_block(
        'PATCH /tdvsp_actionitems(guid)\n'
        '{ "statecode": 1 }'
    )

    # ====================================================================
    # 6. COMPONENT ARCHITECTURE
    # ====================================================================
    pdf.section_title("6. Component Architecture")

    pdf.subsection_title("Provider Hierarchy")
    pdf.code_block(
        "MsalProvider                <- Azure AD context\n"
        "  +-- ThemeProvider          <- Dark/light mode context\n"
        "       +-- FluentProvider    <- Fluent UI theme tokens\n"
        "            +-- BrowserRouter\n"
        "                 +-- AuthenticatedTemplate\n"
        "                 |    +-- TokenProviderSetup\n"
        "                 |         +-- Routes (AppShell + pages)\n"
        "                 +-- UnauthenticatedTemplate\n"
        "                      +-- LoginPage"
    )

    pdf.subsection_title("Key Components")
    cw4 = [35, 55, 80]
    pdf.styled_table(
        ["Component", "File", "Purpose"],
        [
            ["AppShell", "components/AppShell.tsx", "Sidebar nav + top bar + content"],
            ["CopilotChat", "components/CopilotChat.tsx", "Floating AI chat widget"],
            ["NotesTimeline", "components/NotesTimeline.tsx", "Notes with attachments + pinning"],
            ["ThemeContext", "context/ThemeContext.tsx", "Dark/light mode + localStorage"],
            ["dataverseService", "services/dataverseService.ts", "Centralized API (37 functions)"],
        ],
        cw4,
    )

    pdf.subsection_title("API Service Layer")
    pdf.body_text(
        "All Dataverse calls route through a single apiRequest helper. It acquires a fresh "
        "bearer token on every call, sets OData headers, and returns parsed JSON. 37 exported "
        "functions cover CRUD for all 7 entities plus annotations and related records."
    )

    # ====================================================================
    # 7. DEPLOYMENT
    # ====================================================================
    pdf.section_title("7. Deployment Architecture")

    cw5 = [40, 55, 55]
    pdf.styled_table(
        ["Resource", "Type", "Resource Group"],
        [
            ["dv-front-end", "Azure Static Web App", "rg-og-dv-spa-etc"],
            ["ohgeesolutions.com", "Custom domain", "Managed by SWA"],
        ],
        cw5,
    )

    pdf.ln(3)
    pdf.body_text(
        "Azure Static Web Apps handles SPA fallback routing, HTTPS enforcement, "
        "global CDN distribution, and automatic SSL certificate management."
    )

    pdf.subsection_title("Build and Deploy")
    pdf.code_block(
        "# Build\n"
        "npm run build\n"
        "\n"
        "# Deploy\n"
        "npx @azure/static-web-apps-cli deploy ./build \\\n"
        '  --deployment-token "<token>" --env production'
    )

    # ====================================================================
    # 8. COPILOT INTEGRATION
    # ====================================================================
    pdf.section_title("8. Copilot Studio Integration")

    pdf.body_text(
        "The app includes a floating AI chat widget (rocket icon, bottom-right) connected to "
        "a Microsoft Copilot Studio agent via Direct Line with SSO token exchange."
    )

    pdf.subsection_title("SSO Token Exchange Flow")
    pdf.bullet("App acquires Azure AD token for the bot's custom scope")
    pdf.bullet("Bot sends signin/tokenExchange invoke activity")
    pdf.bullet("Web Chat store middleware intercepts and posts token back")
    pdf.bullet("Bot validates token and establishes authenticated context")
    pdf.bullet("No manual sign-in card or popup shown to the user")

    # ====================================================================
    # 9. DESIGN SYSTEM
    # ====================================================================
    pdf.section_title("9. Design System")

    pdf.subsection_title("Brand")
    pdf.bullet("Brand palette: ogBrand based on #4a9eff blue", bold_lead="Color")
    pdf.bullet("Inter everywhere via Google Fonts", bold_lead="Font")
    pdf.bullet("Dark surfaces: #0a0c10 bg, #12151c surface1, #1a1e28 surface2", bold_lead="Dark theme")
    pdf.bullet("Subtle 1px borders preferred over shadows", bold_lead="Borders")
    pdf.bullet("8px borderRadius, lowercase monospace section headers", bold_lead="Cards")

    pdf.subsection_title("Entity Accent Colors")
    cw6 = [35, 25, 30]
    pdf.styled_table(
        ["Entity", "Color", "Hex"],
        [
            ["Tasks", "Red", "#f87171"],
            ["Ideas", "Purple", "#a78bfa"],
            ["Impacts", "Amber", "#f59e0b"],
            ["Accounts", "Blue", "#4a9eff"],
            ["Contacts", "Cyan", "#22d3ee"],
            ["Projects", "Blue", "#4a9eff"],
            ["Summaries", "Green", "#3dd68c"],
        ],
        cw6,
    )

    # ====================================================================
    # OUTPUT
    # ====================================================================
    out_dir = os.path.join(os.path.dirname(__file__), "..", "docs", "pdf")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "architecture.pdf")
    pdf.output(out_path)
    print(f"PDF generated: {os.path.abspath(out_path)}")


if __name__ == "__main__":
    build_pdf()
