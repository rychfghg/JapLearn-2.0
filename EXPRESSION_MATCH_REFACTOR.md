# Expression Match context refactor

- Retains the two-target matching game, all three image sets, exact-phrase audio and balanced answer positions.
- Both full situation captions remain visible and screen-reader labelled. They establish intent and relationship when an illustration cannot show an abstract distinction (formal request, gratitude, past apology).
- Missing or identical normalized captions are excluded before a round. This is a structural guard, not an automated judgment of Japanese pragmatics. Instructor review of complete image/caption pairs remains necessary, especially expressions that can fit many contexts.
- Every fourth question is a labelled caption-only context check (5 in a 20-question round). This reduces direct picture dependence, but reused captions and hints still make this supported practice, not proof of independent mastery or transfer to a new situation.
- Failed images offer retry and the full accessible caption. Image failure and retry never increment mistakes or submit answers. The learner can still answer from the captions. Questions no longer require image URLs to be eligible.
- Japanese is shown above Romaji in the draggable phrase. Tap-to-answer supplements dragging.
- Each level opens with explicit Start/Continue instructions, including scoring and caption-only questions. Restart and Play Again reopen those instructions.
- Three-dot menu pauses audio/input, resumes, saves and returns, or asks for confirmation before restarting. Restart resets only the current run, never submits unfinished work as a completed attempt, and preserves past completed attempts.
- Account-scoped local checkpoints include question IDs to keep the loaded sequence stable when possible. Existing server checkpoint synchronization is retained. Leaving during answer feedback saves the next unanswered question, avoiding duplicate scoring on resume. Cross-device sequence equivalence still depends on published content and the server's index-only checkpoint contract.
- Header shows earned/possible points. Every game popup shows level, earned/possible points and correct/total matches; stars are in popups rather than the header. Popup content can scroll on short screens.

Validation: run `node scripts/check_expression_match_refactor.cjs`. These are asset, pure-logic and source-wiring checks, not a substitute for real-device dragging, image failure, screen-reader and pause/resume testing. No backend schema changes, deployment or OTA publication included.
