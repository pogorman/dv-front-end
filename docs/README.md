# boom! — Documentation

## Docs

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, tech stack, auth flow, data architecture, deployment |
| [USER-GUIDE.md](USER-GUIDE.md) | End-user guide -- navigation, dashboard, CRUD, notes, theme, Copilot |
| [FAQ.md](FAQ.md) | Frequently asked questions -- auth, data, dashboard, chat, development |
| [HOW-I-WAS-BUILT.md](HOW-I-WAS-BUILT.md) | ELI5 build narrative -- prompts, decisions, lessons learned |
| [SOLUTION_DOCUMENT.md](SOLUTION_DOCUMENT.md) | Comprehensive technical reference (all sections) |

## PDFs

Generated from Python scripts in `scripts/`. Output to `docs/pdf/`.

```bash
python scripts/generate-architecture-pdf.py      # -> docs/pdf/architecture.pdf
python scripts/generate-user-guide-pdf.py         # -> docs/pdf/user-guide.pdf
python scripts/generate-faq-pdf.py                # -> docs/pdf/faq.pdf
python scripts/generate-how-i-was-built-pdf.py    # -> docs/pdf/how-i-was-built.pdf
```

Requires: `pip install fpdf2`
