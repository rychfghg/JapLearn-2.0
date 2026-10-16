"""Exact-phrase Expression Match recordings, using the existing Nanami preset."""
import asyncio,hashlib,json
from pathlib import Path
import edge_tts
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/audio/expression-match'
async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    rows=json.loads((ROOT/'data/expressionMatchMedia.json').read_text(encoding='utf-8'))
    semaphore=asyncio.Semaphore(3)
    async def build(row):
        text=row['japanese'];voice='ja-JP-NanamiNeural'
        digest=hashlib.sha256((voice+'\n'+text).encode()).hexdigest()[:20]
        filename=f'phrase-{digest}.mp3';target=OUT/filename
        async with semaphore:
            if not target.exists() or target.stat().st_size<1000:
                for attempt in range(3):
                    try:
                        await edge_tts.Communicate(text,voice).save(str(target))
                        if target.stat().st_size<1000:raise RuntimeError('Incomplete audio')
                        break
                    except Exception:
                        if attempt==2:raise
                        await asyncio.sleep(2)
        return {'key':row['key'],'text':text,'voice':voice,'file':filename,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
    clips=await asyncio.gather(*(build(row) for row in rows))
    (OUT/'manifest.json').write_text(json.dumps(clips,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    mapping=['// Generated exact-phrase assets. No positional or unrelated clip fallback.','const audio:Record<string,any>={']
    mapping += [f"  {json.dumps(r['text'],ensure_ascii=False)}:require('../assets/audio/expression-match/{r['file']}')," for r in clips]
    mapping += ['};','export default audio;','']
    (ROOT/'services/expressionMatchAudio.ts').write_text('\n'.join(mapping),encoding='utf-8')
    print(f'Generated and mapped {len(clips)} exact-phrase recordings.')
if __name__=='__main__':asyncio.run(main())
