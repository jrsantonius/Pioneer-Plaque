"""Extract the Canva wireframe PDFs into compact template JSON.

Units: 1000 = page width. Page height = 1416.03 (A-series ratio).
Run: python3 -I tools/extract.py <pdf dir> <out dir>
"""
import pymupdf as fitz, json, re, math, sys, os, glob, statistics

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

FOTO = re.compile(r'^FOTO\s*(\d+)$')
TOKEN = re.compile(r'[\[\{]\s*t\s*e\s*x\s*t\s*[\]\}]', re.I)
BARE = re.compile(r'^T\s*E\s*X\s*T$')
NUMLBL = re.compile(r'^[\(\{—\-\s]*(?:Fig\.|No\.)?\s*[\dA-B]{1,3}\s*(?:/\s*\d+)?[\)\}—\-\s]*$')

def hexc(c):
    return '#%02x%02x%02x' % tuple(int(round(v * 255)) for v in c)

def is_white(c):
    return c is not None and min(c) > 0.995


def extract(path):
    doc = fitz.open(path)
    pages = []
    slot_color = None
    stats = dict(photos=0, unmatched=0, texts=0, paras=0, caps=0)
    for pno, page in enumerate(doc):
        W, H = page.rect.width, page.rect.height
        U = 1000.0 / W
        q = lambda v: round(v * U, 1)
        drs = page.get_drawings()
        # ---- text spans -------------------------------------------------
        spans = []
        for b in page.get_text('dict')['blocks']:
            for l in b.get('lines', []):
                txt = ''.join(s['text'] for s in l['spans'])
                if not txt.strip():
                    continue
                s0 = l['spans'][0]
                bb = fitz.Rect(l['bbox'])
                spans.append(dict(t=txt.strip(), font=s0['font'], size=s0['size'], color=s0['color'],
                                  bbox=bb, dir=l['dir'], org=s0['origin']))
        labels = []
        for s in spans:
            m = FOTO.match(s['t'])
            if m:
                c = ((s['bbox'].x0 + s['bbox'].x1) / 2, (s['bbox'].y0 + s['bbox'].y1) / 2)
                labels.append((int(m.group(1)), c, s))
        # ---- classify drawings -------------------------------------------
        bg = '#ffffff'
        boxes = []   # candidate photo fills
        for i, d in enumerate(drs):
            d['_i'] = i
            d['_its'] = ''.join(it[0][0] for it in d['items'])
            d['_skip'] = False
            fo = d.get('fill_opacity')
            d['_filled'] = d['fill'] is not None and (fo is None or fo > 0)
            d['_stroked'] = d['color'] is not None and (d.get('stroke_opacity') is None or d['stroke_opacity'] > 0) and (d['width'] or 0) > 0
            if not d['_filled'] and not d['_stroked']:
                d['_skip'] = True
        photos = []
        used = set()
        for n, c, s in sorted(labels, key=lambda x: x[0]):
            best = None
            for d in drs:
                if d['_skip'] or not d['_filled'] or is_white(d['fill']):
                    continue
                if d['_its'] not in ('r', 'llll', 'q', 'lll'):
                    continue
                r = d['rect']
                if not (r.x0 <= c[0] <= r.x1 and r.y0 <= c[1] <= r.y1):
                    continue
                a = r.width * r.height
                if best is None or a < best[0]:
                    best = (a, d)
            if not best:
                for d in drs:
                    if d['_skip'] or not d['_filled'] or len(d['_its']) < 8 or set(d['_its']) - {'l'}:
                        continue
                    r = d['rect']
                    if r.x0 <= c[0] <= r.x1 and r.y0 <= c[1] <= r.y1:
                        a = r.width * r.height
                        if best is None or a < best[0]:
                            best = (a, d)
                if not best:
                    stats['unmatched'] += 1
                    continue
                d = best[1]
                d['_skip'] = True
                r = d['rect']
                photos.append(dict(x=q(r.x0 + 4), y=q(r.y0 + 4), w=q(r.width - 8), h=q(r.height - 8), r=0, z=d['seqno'], n=n, _rect=r, small=1))
                continue
            d = best[1]
            used.add(d['_i'])
            slot_color = slot_color or hexc(d['fill'])
            it = d['items'][0]
            if d['_its'] == 'r':
                r = it[1]
                ph = dict(x=q(r.x0), y=q(r.y0), w=q(r.width), h=q(r.height), r=0)
            else:
                if d['_its'] == 'q':
                    qd = it[1]
                    pts = [qd.ul, qd.ur, qd.lr, qd.ll]
                else:
                    pts = [d['items'][0][1]] + [x[2] for x in d['items'][:3]]
                cx = sum(p.x for p in pts) / 4
                cy = sum(p.y for p in pts) / 4
                e1 = (pts[1].x - pts[0].x, pts[1].y - pts[0].y)
                e2 = (pts[2].x - pts[1].x, pts[2].y - pts[1].y)
                w = math.hypot(*e1)
                h = math.hypot(*e2)
                ang = math.degrees(math.atan2(e1[1], e1[0]))
                while ang > 45:
                    ang -= 90; w, h = h, w
                while ang <= -45:
                    ang += 90; w, h = h, w
                ph = dict(x=q(cx - w / 2), y=q(cy - h / 2), w=q(w), h=q(h), r=round(ang, 2))
            ph['z'] = d['seqno']
            ph['n'] = n
            ph['_rect'] = d['rect']
            photos.append(ph)
        # dashed borders that hug a photo
        for d in drs:
            if d['_skip'] or d['_i'] in used or not d['_filled']:
                continue
            if len(d['_its']) < 8 or set(d['_its']) - {'l'}:
                continue
            r = d['rect']
            for ph in photos:
                pr = ph['_rect']
                if all(abs(a - b) <= 16 for a, b in zip((r.x0, r.y0, r.x1, r.y1), (pr.x0, pr.y0, pr.x1, pr.y1))):
                    d['_skip'] = True
                    break
        # page background: full-page fills that sit below everything else
        for d in drs:
            if d['_skip'] or d['_i'] in used or not d['_filled']:
                continue
            r = d['rect']
            if d['_its'] == 'r' and r.width >= W * 0.98 and r.height >= H * 0.98:
                bg = hexc(d['fill'])
                d['_skip'] = True
        # ---- bars ---------------------------------------------------------
        bars = []
        for d in drs:
            if d['_skip'] or d['_i'] in used or not d['_filled'] or d['_its'] != 'r':
                continue
            r = d['rect']
            if 14 <= r.height <= 32 and r.width >= 3 * r.height and not is_white(d['fill']):
                bars.append(dict(r=r, c=hexc(d['fill']), z=d['seqno'], ruled=False))
                d['_skip'] = True
        # ruled writing lines (thin horizontal strokes, repeated)
        rules = []
        for d in drs:
            if d['_skip'] or d['_filled'] or not d['_stroked'] or d['_its'] != 'l':
                continue
            p1, p2 = d['items'][0][1], d['items'][0][2]
            if abs(p1.y - p2.y) < 0.5 and abs(p1.x - p2.x) > 120 and 2 <= (d['width'] or 0) <= 4:
                rules.append(dict(d=d, x0=min(p1.x, p2.x), x1=max(p1.x, p2.x), y=p1.y, c=hexc(d['color']), w=d['width']))
        rules.sort(key=lambda r: (round(r['x0']), r['y']))
        groups = []
        for r in rules:
            g = next((g for g in groups if abs(g[-1]['x0'] - r['x0']) < 3 and abs(g[-1]['x1'] - r['x1']) < 3 and 30 < r['y'] - g[-1]['y'] < 120), None)
            if g: g.append(r)
            else: groups.append([r])
        ruled_paras = []
        for g in groups:
            if len(g) < 3:
                continue
            for r in g: r['d']['_skip'] = True
            pitch = statistics.median([b['y'] - a['y'] for a, b in zip(g, g[1:])])
            ruled_paras.append(dict(x=q(g[0]['x0']), y=q(g[0]['y'] - pitch), w=q(g[0]['x1'] - g[0]['x0']), n=len(g), lh=q(pitch),
                                    rule=dict(c=g[0]['c'], w=q(g[0]['w'])), a='l'))
        # ---- texts ---------------------------------------------------------
        texts = []
        numlabels = []
        for s in spans:
            if FOTO.match(s['t']):
                continue
            t = s['t']
            ang = math.degrees(math.atan2(s['dir'][1], s['dir'][0]))
            fam = 's' if 'Georgia' in s['font'] else 'a'
            e = dict(x=q(s['org'][0]), y=q(s['org'][1]), z=q(s['size']), f=fam, c='#%06x' % s['color'])
            if 'Bold' in s['font']: e['b'] = 1
            if 'Italic' in s['font']: e['i'] = 1
            if abs(ang) > 0.3: e['r'] = round(ang, 2)
            m = TOKEN.search(t)
            if m or BARE.match(t):
                tok = m.group(0) if m else t
                pre, post = (t[:m.start()], t[m.end():]) if m else ('', '')
                inner = re.sub(r'[\[\]\{\}]', '', tok).strip()
                e['k'] = 'e'
                if ' ' in inner: e['sp'] = 1          # letter-spaced token
                if inner.replace(' ', '').isupper(): e['up'] = 1
                if pre.strip(): e['pre'] = pre
                if post.strip(): e['post'] = post
            else:
                e['k'] = 'n'
                e['t'] = t
            e['_bb'] = s['bbox']
            e['_w'] = s['bbox'].width if abs(ang) < 45 else s['bbox'].height
            texts.append(e)
            if e['k'] == 'n' and NUMLBL.match(t) and s['size'] < 70 and abs(ang) < 5:
                numlabels.append(e)
        # ---- captions: one optional line beside a photo's number label ---------
        PAGENO = re.compile(r'^—\s*\d+\s*—$')
        cand = []
        for lb in numlabels:
            bb = lb['_bb']
            if PAGENO.match(lb['t']):
                continue
            cy = (bb.y0 + bb.y1) / 2
            bs = [b for b in bars if abs((b['r'].y0 + b['r'].y1) / 2 - cy) < 24 and -5 <= b['r'].x0 - bb.x1 <= 150 and not b.get('used')]
            bar = min(bs, key=lambda b: b['r'].x0 - bb.x1) if bs else None
            if bar: bar['used'] = True
            box = (bb | bar['r']) if bar else bb
            near = None
            for idx, ph in enumerate(photos):
                pr = ph['_rect']
                dx = max(pr.x0 - box.x1, box.x0 - pr.x1, 0)
                dy = max(pr.y0 - box.y1, box.y0 - pr.y1, 0)
                dist = math.hypot(dx, dy)
                if near is None or dist < near[0]:
                    near = (dist, idx)
            if near and near[0] > 120: near = None
            if not bar and not near:
                continue
            cand.append((near[0] if near else 1e9, lb, bar, near[1] if near else None))
        caps = []
        taken = set()
        for dist, lb, bar, pidx in sorted(cand, key=lambda c: c[0]):
            bb = lb['_bb']
            cp = dict(y=lb['y'], z=lb['z'], f=lb['f'], c=lb['c'])
            if pidx is not None and pidx not in taken:
                cp['p'] = pidx; taken.add(pidx)
            elif not bar:
                continue
            gap = lb['z'] / U * 0.45
            limit_r = W - 60
            limit_l = 60
            if pidx is not None:
                pr = photos[pidx]['_rect']
                if pr.x0 - 20 <= bb.x0 <= pr.x1 + 20:
                    limit_r = max(min(pr.x1, W - 60), bb.x1 + 300)
                    limit_l = min(max(pr.x0, 60), bb.x0 - 300)
            if bar:
                r = bar['r']
                cp['x'] = q(r.x0)
                cp['w'] = q(max(r.width, min(limit_r, W - 40) - r.x0))
                cp['bar'] = [q(r.x0), q(r.y0), q(r.width), q(r.height), bar['c']]
            else:
                pr = photos[pidx]['_rect']
                right_side = abs(bb.x1 - pr.x1) < 14 and bb.x0 > (pr.x0 + pr.x1) / 2
                if right_side:
                    cp['a'] = 'r'
                    cp['x'] = q(bb.x0 - gap)
                    cp['w'] = q(max(bb.x0 - gap - max(limit_l, 40), 200))
                else:
                    cp['x'] = q(bb.x1 + gap)
                    cp['w'] = q(max(min(limit_r, W - 40) - bb.x1 - gap, 200))
            caps.append(cp)
        # ---- paragraphs: remaining bars clustered by proximity ---------------
        rest = sorted([b for b in bars if not b.get('used')], key=lambda b: (b['r'].y0, b['r'].x0))
        clusters = []
        for b in rest:
            r = b['r']
            home = None
            for cl in clusters:
                lr = cl[-1]['r']
                gap = r.y0 - lr.y0
                ov = min(r.x1, lr.x1) - max(r.x0, lr.x0)
                aligned = abs(r.x0 - lr.x0) < 4 or abs(r.x1 - lr.x1) < 4 or abs((r.x0 + r.x1) - (lr.x0 + lr.x1)) < 8
                if 0 < gap <= 135 and ov > 0.3 * min(r.width, lr.width) and aligned:
                    home = cl
            if home: home.append(b)
            else: clusters.append([b])
        paras = []
        for cl in clusters:
            rs = [b['r'] for b in cl]
            x0 = min(r.x0 for r in rs); x1 = max(r.x1 for r in rs)
            pitch = statistics.median([b.y0 - a.y0 for a, b in zip(rs, rs[1:])]) if len(rs) > 1 else rs[0].height * 2.1
            if all(abs(r.x0 - x0) < 4 for r in rs): al = 'l'
            elif all(abs(r.x1 - x1) < 4 for r in rs): al = 'r'
            else: al = 'c'
            bh = rs[0].height
            paras.append(dict(x=q(x0), y=q(rs[0].y0 - (pitch - bh) / 2), w=q(x1 - x0), n=len(rs), lh=q(pitch), a=al, c=cl[0]['c'], bh=q(bh),
                              bars=[[q(r.x0), q(r.y0), q(r.width)] for r in rs]))
        paras += ruled_paras
        # ---- text anchors (which way an edited text should grow) -------------
        refs = [(p['_rect'].x0, p['_rect'].x1) for p in photos] + \
               [(p['x'] / U, (p['x'] + p['w']) / U) for p in paras]
        for e in texts:
            if e.get('r'):
                continue
            bb = e['_bb']
            L, R, C = bb.x0, bb.x1, (bb.x0 + bb.x1) / 2
            others = [(o['_bb'].x0, o['_bb'].x1) for o in texts if o is not e]
            allrefs = refs + others
            if abs(C - W / 2) < 6: a = 'c'
            elif any(abs(l - L) < 6 for l, r in allrefs): a = 'l'
            elif any(abs(r - R) < 6 for l, r in allrefs): a = 'r'
            elif any(abs((l + r) / 2 - C) < 6 for l, r in refs): a = 'c'
            elif L > W * 0.5 and R > W - 260: a = 'r'
            else: a = 'l'
            if a != 'l':
                e['a'] = a
                e['x'] = q(R if a == 'r' else C)
        # ---- remaining shapes → svg path layers ------------------------------
        shapes = []
        for d in drs:
            if d['_skip'] or d['_i'] in used:
                continue
            segs = []
            cur = None
            for it in d['items']:
                k = it[0]
                if k == 'l':
                    p1, p2 = it[1], it[2]
                    if cur is None or abs(cur.x - p1.x) > 0.05 or abs(cur.y - p1.y) > 0.05:
                        segs.append('M%s %s' % (q(p1.x), q(p1.y)))
                    segs.append('L%s %s' % (q(p2.x), q(p2.y)))
                    cur = p2
                elif k == 'c':
                    p1, p2, p3, p4 = it[1:5]
                    if cur is None or abs(cur.x - p1.x) > 0.05 or abs(cur.y - p1.y) > 0.05:
                        segs.append('M%s %s' % (q(p1.x), q(p1.y)))
                    segs.append('C%s %s %s %s %s %s' % (q(p2.x), q(p2.y), q(p3.x), q(p3.y), q(p4.x), q(p4.y)))
                    cur = p4
                elif k == 're':
                    r = it[1]
                    segs.append('M%s %sh%sv%sh%sz' % (q(r.x0), q(r.y0), q(r.width), q(r.height), q(-r.width)))
                    cur = None
                elif k == 'qu':
                    qd = it[1]
                    segs.append('M%s %sL%s %sL%s %sL%s %sz' % (q(qd.ul.x), q(qd.ul.y), q(qd.ur.x), q(qd.ur.y), q(qd.lr.x), q(qd.lr.y), q(qd.ll.x), q(qd.ll.y)))
                    cur = None
            if d.get('closePath') and segs and not segs[-1].endswith('z'):
                segs.append('z')
            sh = dict(d=''.join(segs), z=d['seqno'])
            if d['_filled']:
                sh['f'] = hexc(d['fill'])
                if d.get('fill_opacity') not in (None, 1.0): sh['fo'] = round(d['fill_opacity'], 2)
            if d['_stroked']:
                sh['s'] = hexc(d['color'])
                sh['sw'] = q(d['width'])
                if d.get('dashes') and d['dashes'] not in ('[] 0', ''):
                    nums = re.findall(r'[\d.]+', d['dashes'].split(']')[0])
                    if nums: sh['sd'] = ' '.join(str(q(float(n))) for n in nums)
                if d.get('lineCap') and max(d['lineCap']) == 1: sh['cap'] = 1
            sh['_bb'] = d['rect']
            sh['_curvy'] = 'c' in d['_its']
            shapes.append(sh)
        # a fill that the PDF clips to the outline drawn right after it: let the outline carry the fill
        merged = []
        for sh in shapes:
            prev = merged[-1] if merged else None
            if prev is not None and 'f' in prev and 's' not in prev and 's' in sh and 'f' not in sh and \
               all(abs(a - b) <= 14 for a, b in zip(prev['_bb'], sh['_bb'])):
                sh['f'] = prev['f']
                if 'fo' in prev: sh['fo'] = prev['fo']
                sh['z'] = prev['z']
                merged[-1] = sh
            else:
                merged.append(sh)
        shapes = merged
        # small outlined badges (stamps, pills) belong to the text inside them: no text, no badge in print
        for ti, e in enumerate(texts):
            if e['k'] != 'e':
                continue
            bb = e['_bb']; cx, cy = (bb.x0 + bb.x1) / 2, (bb.y0 + bb.y1) / 2
            for sh in shapes:
                r = sh['_bb']
                if 's' in sh and sh['_curvy'] and r.x0 <= cx <= r.x1 and r.y0 <= cy <= r.y1 and r.width < W * 0.5 and r.height < H * 0.14 \
                   and not any(r.x0 <= c[0] <= r.x1 and r.y0 <= c[1] <= r.y1 for n, c, s_ in labels):
                    sh['t'] = ti
        # ---- z-ordered layers: shapes interleaved with photos ----------------
        items = [('p', ph['z'], i) for i, ph in enumerate(photos)] + [('s', sh['z'], i) for i, sh in enumerate(shapes)]
        items.sort(key=lambda x: x[1])
        layers = []
        for kind, z, i in items:
            if kind == 'p':
                layers.append(i)
            else:
                sh = {k: v for k, v in shapes[i].items() if k != 'z' and not k.startswith('_')}
                if layers and isinstance(layers[-1], list): layers[-1].append(sh)
                else: layers.append([sh])
        pg = dict(bg=bg)
        pg['ph'] = [[p['x'], p['y'], p['w'], p['h'], p['r']] for p in photos]
        pg['ly'] = layers
        pg['tx'] = [{k: v for k, v in e.items() if not k.startswith('_')} for e in texts]
        pg['pa'] = paras
        pg['cp'] = [{k: v for k, v in c.items() if not k.startswith('_')} for c in caps]
        pages.append(pg)
        stats['photos'] += len(photos); stats['texts'] += len(texts); stats['paras'] += len(paras); stats['caps'] += len(caps)
    return pages, slot_color, stats


if __name__ == '__main__':
    for f in sorted(glob.glob(os.path.join(SRC, '*.pdf'))):
        tid = os.path.basename(f)[:-4]
        pages, slot, st = extract(f)
        fams = [t['f'] for p in pages for t in p['tx'] if t['k'] == 'e']
        body = 's' if fams.count('s') >= fams.count('a') else 'a'
        out = dict(id=tid, w=1000, h=1416, slot=slot, body=body, pages=pages)
        js = json.dumps(out, separators=(',', ':'), ensure_ascii=False)
        open(os.path.join(OUT, tid + '.json'), 'w').write(js)
        print(tid, st, 'bytes', len(js), 'slot', slot)
