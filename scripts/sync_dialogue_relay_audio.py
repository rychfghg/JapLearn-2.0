"""Build content-addressed conversation clips using the existing Sumi/Haru voices.

Requires edge-tts >=7.3.1. Existing clips are never overwritten. A checksum
manifest makes changed scripts generate new files instead of reusing stale IDs.
"""
import asyncio
import hashlib
import json
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/audio/dialogue-relay'
VOICES = {'sumi': 'ja-JP-NanamiNeural', 'haru': 'ja-JP-KeitaNeural'}

async def main():
    scenes = json.loads((ROOT / 'app/dialogueRelayExchanges.json').read_text(encoding='utf-8'))
    semaphore = asyncio.Semaphore(3)
    async def generate(scene, index, speaker, text):
        voice = VOICES['haru' if speaker == 'haru' else 'sumi']
        digest = hashlib.sha256((voice + '\n' + text).encode()).hexdigest()[:20]
        filename = f'conversation-{digest}.mp3'
        target = OUT / filename
        async with semaphore:
            if not target.exists() or target.stat().st_size < 1000:
                for attempt in range(3):
                    try:
                        await edge_tts.Communicate(text, voice).save(str(target))
                        if target.stat().st_size < 1000:
                            raise RuntimeError('Incomplete clip')
                        break
                    except Exception:
                        if attempt == 2:
                            raise
                        await asyncio.sleep(2)
        key = f'choice-{scene}' if speaker == 'choice' else f'connected-{scene}-{index}-{speaker}'
        return {'id': key, 'text': text,
                'voice': voice, 'file': filename,
                'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
    tasks = [generate(scene, i, speaker, row[position])
             for scene, turns in scenes.items() for i, row in enumerate(turns)
             for speaker, position in [('sumi', 0), ('haru', 2), ('followup', 4)]]
    revisions = json.loads((ROOT / 'app/dialogueRelayChoiceRevisions.json').read_text(encoding='utf-8'))
    tasks += [generate(id, 0, 'choice', row['japanese']) for id, row in revisions.items() if 'japanese' in row]
    rows = await asyncio.gather(*tasks)
    (OUT / 'conversation-manifest.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    lines = ['// Generated from dialogueRelayExchanges.json; do not reuse clips by old IDs.',
             'const audio: Record<string, any> = {']
    lines += [f"  '{r['id']}': require('../assets/audio/dialogue-relay/{r['file']}')," for r in rows]
    lines += ['};', 'export default audio;', '']
    (ROOT / 'app/relayConversationAudio.ts').write_text('\n'.join(lines), encoding='utf-8')
    print(f'Generated and verified {len(rows)} text/voice entries.')

if __name__ == '__main__':
    asyncio.run(main())
