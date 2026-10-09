"""Short unattended visual smoke run; menu clicks use a finite screenshot grid."""
import asyncio, base64, json, os, time
from pathlib import Path
import httpx
from dotenv import load_dotenv
from playwright.async_api import async_playwright
from agent import CRITERIA, encode_frame, execute, validate

async def main():
    load_dotenv('.env')
    folder = Path('runs') / ('live-' + time.strftime('%Y%m%d-%H%M%S'))
    folder.mkdir(parents=True)
    async with async_playwright() as pw, httpx.AsyncClient(timeout=15) as client:
        headers = {'Authorization': 'Bearer ' + os.environ['OPENROUTER_API_KEY']}
        usage = (await client.get('https://openrouter.ai/api/v1/key', headers=headers)).json()['data']['usage']
        if usage is None or usage > .90:
            raise RuntimeError('Insufficient remaining test allowance')
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width':960,'height':720}, record_video_dir=str(folder))
        page = await context.new_page()
        spent = 0
        try:
            await page.goto('https://play.tetris.com/', wait_until='domcontentloaded')
            await page.wait_for_timeout(10000)
            for step in range(30):
                if spent + .05 + usage > 1:
                    break
                t = time.monotonic()
                frame = encode_frame(await page.screenshot())
                (folder / f'{step:03d}.jpg').write_bytes(frame)
                grid = {f'click_{x}_{y}':f'Click pixel ({x},{y}) ONLY to start/resume Tetris, focus its board, or dismiss a cookie/advert overlay. Never external links/purchases.'
                        for x in range(60,960,120) for y in range(45,720,90)}
                options = {**CRITERIA, **grid}
                body = {'model':'cloudflare/clef','state':[
                    'Control Tetris from this screenshot. Clear lines and avoid holes. If in a start menu click the nearest offered point to Play. If loading choose idle. Click only game or dismiss controls. No DOM information. Coordinates refer to this 960x720 screenshot. If playing choose a keyboard macro. Stop if blocked.',
                    {'type':'image_url','image_url':{'url':'data:image/jpeg;base64,'+base64.b64encode(frame).decode()}}
                ],'questions':{'action':{'type':'choice','instructions':'Select the next game input or menu click.','criteria':options}}}
                r = await client.post('https://openrouter.ai/api/alpha/decisions', headers=headers,json=body)
                r.raise_for_status()
                d = r.json();cost = d.get('usage',{}).get('cost')
                if not isinstance(cost,(int,float)):
                    raise RuntimeError('Missing cost; stopping')
                spent += cost
                action = d['answers']['action']['choice']
                if action not in options:
                    raise RuntimeError('Unknown action')
                age = time.monotonic()-t
                print(step, action, round(age,2), '$'+str(round(spent,6)),flush=True)
                with (folder/'trace.jsonl').open('a') as f:
                    f.write(json.dumps({'step':step,'action':action,'seconds':age,'cost':cost,'provider':d.get('provider')})+'\n')
                if spent+usage > 1 or action == 'stop':
                    break
                if action.startswith('click_'):
                    _,x,y=action.split('_');await page.mouse.click(int(x),int(y));await page.wait_for_timeout(1000)
                elif age < 2:
                    await execute(page,action)
                await page.wait_for_timeout(200)
        finally:
            await context.close()
            await browser.close()
            print('Saved recording and trace:',folder,'Spend:',spent)

if __name__ == '__main__':
    asyncio.run(main())
