"""Generate only the short practice's exact-script clips (edge-tts >=7.3.1).
Uses existing Sumi=Nanami and Haru=Keita voices; never overwrites old Rush audio.
"""
import asyncio,hashlib,json
from pathlib import Path
import edge_tts
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/audio/response-rush'
VOICES={'SUMI':'ja-JP-NanamiNeural','HARU':'ja-JP-KeitaNeural'}
async def main():
    scenes=json.loads((ROOT/'services/replyRushPracticeScene.json').read_text(encoding='utf-8'))
    lines=[]
    for scene in scenes:
        lines.append((f"n_{scene['id']}_opening",scene['opening']))
        for d in scene['decisions']:
            stem=f"n_{scene['id']}_{d['id']}"
            lines += [(stem+'_setup',d['setup']),(stem+'_react_timeout',d['timeout'])]
            for c in d['choices']:
                lines += [(stem+'_reply_'+c['id'],{'character':'SUMI','japanese':c['japanese']}),(stem+'_react_'+c['id'],c['reaction'])]
    semaphore=asyncio.Semaphore(3)
    async def build(id,line):
        voice=VOICES[line['character']];text=line['japanese']
        digest=hashlib.sha256((voice+'\n'+text).encode()).hexdigest()[:20]
        filename=f'practice-{digest}.mp3';target=OUT/filename
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
        return {'id':id,'text':text,'character':line['character'],'voice':voice,'file':filename,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
    rows=await asyncio.gather(*(build(id,line) for id,line in lines))
    (OUT/'short-practice-manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    mapping=['// Generated from services/replyRushPracticeScene.json.','const audio:Record<string,any>={']
    mapping += [f"  '{r['id']}':require('../assets/audio/response-rush/{r['file']}')," for r in rows]
    mapping += ['};','export default audio;','']
    (ROOT/'services/replyRushPracticeAudio.ts').write_text('\n'.join(mapping),encoding='utf-8')
    print(f'Generated {len(rows)} exact-script short-practice recordings.')
if __name__=='__main__':asyncio.run(main())
