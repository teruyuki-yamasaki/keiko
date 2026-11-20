"""Generate the replacement textbook site and PDFs."""
import subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
for script in ['import_texts.py','build_books.py']:
    subprocess.run([sys.executable,str(ROOT/'scripts'/script)],check=True)
