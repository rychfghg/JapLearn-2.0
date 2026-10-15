# Reply Rush v2

The timed challenge retains its six scenes, twenty decisions, existing character
art, voice clips, Romaji and story graph. Introductory practice is now a separate
one-scene library conversation with four replies and newly generated exact-script
audio using the same Sumi/Haru voice presets. Both keep the visual-novel format.

## Modes and timer

- The four-reply untimed practice is optional; confident learners can choose timed immediately.
- Mode selection opens instructions. Only Start game starts a new conversation;
  restored conversations also wait for Resume game before audio begins.
- Practice completion is not a mastery certification or accuracy threshold.
- The existing twenty-second window remains a pilot timing choice, not a
  validated proficiency standard.
- A timed question requires both rendered choices and actual completion of
  its required audio. A missing/stalled clip does not satisfy that audio gate.
- Choices are shuffled once per question and remain stable while it is active.
- Replay repeats the current question's required speaker line without changing
  the choice node or timer deadline. The countdown continues during replay;
  answering or timing out stops the replay. Replay failures are technical events.
- Backgrounding, suspended event loops, audio failures and interrupted resume
  are technical events. The affected question continues untimed, with no speed
  sample. Intentional exit-confirmation pauses also invalidate that sample.
- Audio can be retried, or the learner can read and continue untimed.

## Evidence and review

- Correct response, incorrect response, timeout and technical interruption are
  distinct records. Correctness is recomputed against the backend question bank.
- Answered accuracy excludes timeouts and technical events; no answers means
  unassessed, not zero understanding. Speed uses eligible answered questions only.
- Results expose both modes and all outcome counts. New timed rounds do not
  contribute to the backend understanding/mastery averages.
- Twenty-four text-only, untimed transfer examples cover the timed skills and
  the four short-practice skills.
  Their first responses are saved separately and never change the round score.
- Legacy records remain unchanged. V2 records carry mode, evidence, run ID and
  schema version. Offline score/review synchronization uses the existing queue.
- The short practice uses `RUSH_PRACTICE_SHORT_V3`. Backend validation accepts
  four replies for this mode and twenty for timed/legacy full practice; the
  question sets cannot be mixed. Practice history remains available but is not required.
- An unfinished legacy run is not relabeled as V2 evidence; the new flow begins
  with mode selection. Previously completed score history is retained.

## Release and verification

Deploy the backend changes before publishing the frontend/OTA: the backend
must understand the V2 fields, optional practice and review endpoint.
No deployment, APK build request or OTA publication is performed by these edits.

Automated checks cover timing gates, suspension vs timeout, separate metrics,
choice identity, audio presence, twenty-skill coverage and frontend/backend bank
agreement. Instructor review of the new transfer examples, browser audio testing,
and physical Android pause/resume testing remain necessary.
