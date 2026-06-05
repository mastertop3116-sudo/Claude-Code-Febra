# Recorta o fundo das mascotes com IA (rembg / u2net) — borda limpa, igual Canva.
#   python remove-fundo.py assets/mascotes/jj-azul.png   -> gera jj-azul-transp.png
#   python remove-fundo.py --all                          -> processa todos jj-*.png (menos -transp)
import sys, os, glob
from rembg import remove, new_session
from PIL import Image

_SESS = new_session('u2net')

def recortar(src):
    im = Image.open(src).convert('RGBA')
    out = remove(im, session=_SESS, post_process_mask=True)
    dst = src.rsplit('.', 1)[0] + '-transp.png'
    out.save(dst)
    print('OK ->', dst)
    return dst

if __name__ == '__main__':
    args = sys.argv[1:]
    base = os.path.join(os.path.dirname(__file__), 'assets', 'mascotes')
    if '--all' in args:
        alvos = [f for f in glob.glob(os.path.join(base, 'jj-*.png')) if '-transp' not in f]
    else:
        alvos = args
    for a in alvos:
        recortar(a)
