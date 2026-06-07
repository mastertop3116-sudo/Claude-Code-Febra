# Comprime o PDF do e-book premium: deduplica objetos idênticos (imagens repetidas que o Chromium
# embute por página) + subseta as fontes. ~9MB -> ~4MB, sem perda visual. Uso: comprimir-pdf.py in out
import sys
import fitz  # PyMuPDF

inp, outp = sys.argv[1], sys.argv[2]
doc = fitz.open(inp)
try:
    doc.subset_fonts()
except Exception:
    pass
doc.save(outp, garbage=4, deflate=True, clean=True)
