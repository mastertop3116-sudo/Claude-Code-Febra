# Troca a imagem do mascote (encolhida pelo navegador) pela PNG original em alta resolução,
# no mesmo lugar dentro do PDF. Usado pelo criador_engine após gerar a ficha.
#   python replace-mascote.py <pdf_in> <png_mascote> <pdf_out>
import sys, fitz

def main(pdf_in, png, pdf_out):
    d = fitz.open(pdf_in)
    pg = d[0]
    imgs = pg.get_images(full=True)
    if imgs:
        # o mascote é a única/maior imagem raster da ficha
        alvo = max(imgs, key=lambda im: d.extract_image(im[0])['width'] * d.extract_image(im[0])['height'])
        pg.replace_image(alvo[0], filename=png)
    d.save(pdf_out, garbage=4, deflate=True)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3])
