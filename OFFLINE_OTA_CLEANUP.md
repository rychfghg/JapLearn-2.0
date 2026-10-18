# Offline-safe OTA cleanup

No active game pictures or speech were moved to online-only storage.
Expression Match again prefers its bundled images and phrase audio.

## Preserved

- All 120 authored Expression Match pictures and 60 phrase-audio entries.
- Current Reply Coach speech, including Sumi/Haru voice variants.
- All current Dialogue Relay lines, response choices, and followups.
- Timed and practice Response Rush lines and choices.
- Teacher/admin screens and the two icon families actually used by the app.

## Archived (recoverable)

263 recordings no longer directly needed by runtime imports were transferred to:

`D:/JAPLEARN_OFFICIAL/ARCHIVED_UNUSED_ASSETS/2026-10-18-offline-ota`

They include obsolete Relay dialogue/prompts/options, Coach reactions superseded
by the verified variants, narrated transitions that are no longer spoken, and
duplicate recordings whose exact Japanese text AND voice match a retained clip.
Active IDs keep an equivalent local recording. The archive contains source
backups, checksums, and alias records in `archive-manifest.json`.

Bulk icon imports were changed to direct Ionicons/FontAwesome imports, avoiding
17 unused font assets without changing rendered icons.

The abandoned MongoDB media seeder, its test, preparation script, resource pack,
and migration notes were also archived under `aborted-online-migration`.
Already stored MongoDB media was not deleted. Local game media takes precedence.

## Verification

Android export after cleanup: 924 referenced assets plus the JS bundle (925),
versus 1,204 referenced assets plus the bundle (1,205) before cleanup.
No OTA asset-exclusion patterns or remote-only replacements are used.

Run:

```
node scripts/check_offline_ota_cleanup.cjs
node scripts/check_dialogue_relay.cjs
node scripts/check_reply_rush.cjs
node scripts/check_rush_resume.cjs
```

The first check requires a current Android export at
`dist-offline-cleanup-check` made with `expo export --platform android --dump-assetmap`.
Regenerate content/audio maps cautiously: old generators can reintroduce obsolete
requires. Always re-export and measure asset count before publishing.

The external archive is not part of the frontend Git repository; preserve it
separately. Previously committed recordings also remain recoverable from Git.
