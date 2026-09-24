"""Generate Dialogue Relay exchanges with the voices used by existing clips.

Install edge-tts, then run this script from the frontend repository root.
"""

import asyncio
import json
from pathlib import Path

import edge_tts


ROOT = Path(__file__).resolve().parents[1]
LINES = ROOT / "app" / "dialogueRelayLines.json"
OUTPUT = ROOT / "assets" / "audio" / "dialogue-relay"
VOICES = {"sumi": "ja-JP-NanamiNeural", "haru": "ja-JP-KeitaNeural"}


async def main():
    dialogues = json.loads(LINES.read_text(encoding="utf-8"))
    for scene_id, questions in dialogues.items():
        for question_index, question in enumerate(questions):
            for speaker, voice in VOICES.items():
                target = OUTPUT / f"dialogue-{scene_id}-{question_index}-{speaker}.mp3"
                if target.exists() and target.stat().st_size > 1000:
                    continue
                await edge_tts.Communicate(question[speaker], voice).save(str(target))
                if target.stat().st_size <= 1000:
                    raise RuntimeError(f"Audio was not generated: {target}")
                print(target.name)


if __name__ == "__main__":
    asyncio.run(main())
