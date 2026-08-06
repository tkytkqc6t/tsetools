Offline usage and packaging
===========================

This project can run fully offline or on an intranet. Follow these steps to prepare packages on a machine with internet access, then transfer them to the offline host.

1) On a machine with internet access, download wheel files:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip download -r requirements.txt -d packages
```

2) Transfer the `packages` folder and the project files to the offline machine (USB, internal network share, etc.).

3) On the offline machine, create and activate a virtualenv and install from the local packages:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install --no-index --find-links ./packages -r requirements.txt
```

4) Run the server locally (default binds to localhost):

```powershell
python server.py
```

5) To expose on the LAN (intranet), set environment variables before running. Example — bind to all interfaces and disable debug mode:

```powershell
$env:TS_TOOLS_HOST = '0.0.0.0'
$env:TS_TOOLS_PORT = '5000'
$env:TS_TOOLS_DEBUG = '0'
python server.py
```

Security notes:
- Do not run with `TS_TOOLS_DEBUG=1` on network-exposed hosts.
- Consider running behind a reverse proxy with TLS if sensitive data is transferred.

Vendor frontend assets (for offline HTML)
---------------------------------------

The web UI references several CDN-hosted assets (Tailwind, CodeMirror, Diff, and Google Fonts). For fully offline use, download these files and place them under `static/vendor` with the filenames below:

- `tailwind.min.js` (cdn.tailwindcss.com build)
- `codemirror.min.css`
- `eclipse.min.css` (CodeMirror theme)
- `codemirror.min.js`
- `mode-sql.min.js`
- `matchbrackets.min.js`
- `placeholder.min.js`
- `diff.min.js`
- `fonts.css` (optional — defines `@font-face` for Figtree and Inter if you include local font files)

Once these files exist in `static/vendor`, the page will attempt to load CDN versions first and automatically fall back to the local copies when offline.

Tip: Use your browser's DevTools Network tab to verify which files are loaded and to confirm offline fallback behavior.
