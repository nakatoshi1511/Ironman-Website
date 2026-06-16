# Mockup Screenshot Export

This project uses a Chrome DevTools Protocol export for the mockup screenshots. This is more reliable than taking one full-page screenshot and cropping it afterward, because Chrome captures each `.mockup` section directly from the rendered page.

## When To Use

Use this workflow whenever the four hero mockups need to be exported again as high-resolution PNG files.

## Prerequisites

1. Start the local server from the project root:

```powershell
& "C:\Users\radem\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -m http.server 4173 --bind 127.0.0.1
```

2. Make sure the mockups are available at:

```text
http://127.0.0.1:4173/mockups/
```

## Export Command

Run this from the project root:

```powershell
& "C:\Users\radem\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" .\tools\export-mockup-screenshots.js
```

The script exports all `.mockup` sections into:

```text
mockup-screenshots/
```

## Output Files

The expected files are:

```text
variante-1-sponsor-editorial.png
variante-2-kona-performance.png
variante-3-regional-precision.png
variante-4-image-first-minimal.png
_export-meta.json
```

The PNG files are exported with a device scale factor of `2`, using a `1920x1600` viewport.

## Notes

- Chrome is launched headless with a temporary profile inside `mockup-screenshots/_chrome-profile`.
- The temporary profile is deleted after export.
- If Chrome is not installed in a standard location, set `CHROME_PATH` before running the script.
- If the local server URL changes, set `MOCKUP_URL`.
- If the debug port is busy, set `CHROME_DEBUG_PORT`.
