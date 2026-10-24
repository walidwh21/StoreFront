import re
from playwright.sync_api import sync_playwright
OUT='/home/claude/proj/storefront/docs/screenshots/'
B='http://localhost:4200'
def login(page,email,pw):
    page.goto(B+'/signin'); page.wait_for_load_state('networkidle'); page.wait_for_timeout(1500); page.fill('input[name=email]',email); page.fill('input[name=password]',pw)
    page.click('button[type=submit]'); page.wait_for_url(re.compile(r'/(catalog|profile)')); page.wait_for_timeout(800)
def shot(page,name,wait=1500):
    page.wait_for_timeout(wait); page.screenshot(path=OUT+name+'.png'); print('saved',name,page.url)
with sync_playwright() as p:
    b=p.chromium.launch()
    import hashlib
    def img(route):
        u=route.request.url; parts=u.split('/product-images/')[-1].split('/')
        name=(parts[1] if len(parts)>1 else parts[0]).replace('-',' ').title()
        h=205+int(hashlib.md5(u.encode()).hexdigest()[:6],16)%30
        words=name.split(); l1=' '.join(words[:2]); l2=' '.join(words[2:4])
        svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl({h},45%,93%)"/><stop offset="1" stop-color="hsl({h+10},40%,82%)"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="200" cy="170" r="70" fill="hsl({h},40%,40%)" opacity=".35"/><text x="200" y="300" font-family="sans-serif" font-size="26" text-anchor="middle" fill="hsl({h},40%,25%)">{l1}</text><text x="200" y="332" font-family="sans-serif" font-size="26" text-anchor="middle" fill="hsl({h},40%,25%)">{l2}</text></svg>'
        route.fulfill(status=200,content_type='image/svg+xml',body=svg)
    def tile(route):
        svg='<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#eef2e6"/><path d="M0 90 L256 70 M0 190 L256 210 M70 0 L90 256 M180 0 L160 256" stroke="#fff" stroke-width="9"/><path d="M0 140 L256 130" stroke="#f5d98a" stroke-width="6"/><rect x="100" y="95" width="50" height="35" fill="#d9e8c4"/><rect x="20" y="150" width="45" height="40" fill="#dfe6d3"/><rect width="256" height="256" fill="none" stroke="#d6dcc9"/></svg>'
        route.fulfill(status=200,content_type='image/svg+xml',body=svg)
    def ctx(): 
        c=b.new_context(viewport={'width':1280,'height':720},permissions=['geolocation'],geolocation={'latitude':48.8566,'longitude':2.3522}); c.route('**/cdn.dummyjson.com/**',img); c.route('**/*tile.openstreetmap.org/**',tile); return c,c.new_page()
    c,pg=ctx()
    pg.goto(B+'/signin'); shot(pg,'signin')
    pg.goto(B+'/signup'); shot(pg,'signup')
    pg.goto(B+'/catalog'); shot(pg,'catalog',2500)
    pg.goto(B+'/product-details/1'); shot(pg,'product-details',2500)
    c.close()
    # member
    c,pg=ctx(); login(pg,'member@example.com','Member#12345')
    pg.goto(B+'/catalog'); pg.wait_for_timeout(2000)
    btns=pg.get_by_role('button',name='Add to Cart')
    for i in range(2): btns.nth(i).click(); pg.wait_for_timeout(300)
    pg.goto(B+'/catalog'); pg.wait_for_timeout(1500)
    pg.get_by_role('button',name='Add to Cart').first.click()
    pg.locator('button.cart').first.click(); shot(pg,'cart',1000)
    pg.goto(B+'/order-page'); shot(pg,'checkout',2500)
    pg.goto(B+'/profile'); pg.get_by_role('button',name='Orders').click(); shot(pg,'profile',1000)
    pg.locator('a[href^="/order-details/"]').first.click(); shot(pg,'order-details',2500)
    c.close()
    # admin
    c,pg=ctx(); login(pg,'admin@example.com','Admin#12345')
    for path,name in [('/stock-monitoring','stock-monitoring'),('/offers','offer-management'),('/user-management','user-management')]:
        pg.goto(B+path); pg.wait_for_timeout(6000); shot(pg,name,500)
    c.close()
    import os
    if os.environ.get('AR'):
        c,pg=ctx(); pg.goto('http://localhost:4201/catalog'); shot(pg,'i18n-arabic',2500); c.close()
    b.close()
