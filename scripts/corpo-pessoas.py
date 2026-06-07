# Gera versoes de CORPO INTEIRO (fundo recortado, web ~440px) das pessoas do catalogo,
# pro bloco "destaque" do e-book premium. Saida: corpo.b64 em cada pasta pessoas-*.
import os, base64, io, glob, sys
from rembg import remove
from PIL import Image

BASE = os.path.join(os.path.dirname(__file__), '..', 'assets', 'catalogo-auto')
TARGET_W = 440
n = 0
for d in sorted(glob.glob(os.path.join(BASE, 'pessoas-*'))):
    pngs = [f for f in glob.glob(os.path.join(d, '*.png'))]
    if not pngs:
        continue
    src = Image.open(pngs[0]).convert('RGBA')
    out = remove(src)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    w, h = out.size
    nh = int(round(h * TARGET_W / w))
    out = out.resize((TARGET_W, nh), Image.LANCZOS)
    buf = io.BytesIO()
    out.save(buf, 'PNG', optimize=True)
    b64 = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    with open(os.path.join(d, 'corpo.b64'), 'w') as fp:
        fp.write(b64)
    n += 1
    print(os.path.basename(d), out.size, str(round(len(b64) / 1024)) + 'KB')
print('total corpo.b64:', n)
