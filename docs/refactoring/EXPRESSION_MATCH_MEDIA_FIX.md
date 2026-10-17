# Expression Match media repair

Scope: repair media and answer cues without changing the drag-and-match teaching flow.

- Generate 60 exact Japanese phrase recordings using `ja-JP-NanamiNeural`, the
  existing project voice preset. The manifest records text, voice and file checksum.
- Look up bundled recordings by the actual Japanese answer, not a numeric index.
- Use the shared native audio loader, stop stale recordings on navigation and
  selection, and show retry feedback rather than silently swallowing playback errors.
- Allocate balanced top/bottom target positions once per run, with a fresh shuffle
  on replay. Hints and audio renders do not move targets or alter correctness.
- Do not use a universal wave image for the correct target and bow image for the
  alternative. Missing pictures show an honest neutral placeholder, not an answer cue.
- Levels 1, 2 and 3 each receive 40 separate illustrated scenes, one for each target
  of their 20 questions (120 pictures total). Art was generated with the built-in image-generation tool, not
  an API-key CLI. Original generated PNGs are preserved in the workspace output
  folder; compressed WebP copies are bundled for app/offline use.
- Match artwork to the exact phrase and scenario pair. Teacher-edited scenarios
  must not accidentally inherit unrelated built-in pictures.

Run `node scripts/check_expression_match.cjs` for content/checksum and selection
checks and `node scripts/check_expression_match_level3.cjs` for all three levels.
Listening tests and Android/browser visual/playback tests are still needed.
No deployment, APK request or OTA publication is included in this change.
