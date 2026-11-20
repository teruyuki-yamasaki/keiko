"""Typeset the supplied TeX into separate problem and answer books."""
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT/'content/imported/tex'
BUILD = ROOT/'build/replacement'
BUILD.mkdir(parents=True,exist_ok=True)
sources = sorted(SOURCE.glob('0[123]-*.tex'))
first = sources[0].read_text()
preamble = first.split(r'\begin{document}')[0]
preamble += r'''
\usepackage{fancyhdr}
\pagestyle{fancy}\fancyhf{}
\lhead{\small 稽古 / KEIKO}\rhead{\small 京大物理形式テキスト}
\cfoot{\thepage}\setlength{\headheight}{15pt}
\setlength{\parskip}{0.5\baselineskip}
\hypersetup{linkcolor=black,urlcolor=blue}
'''

def namespace(text, prefix):
    for cmd in ['hypertarget','hyperlink','label','ref']:
        text=re.sub(r'\\'+cmd+r'\{([^}]+)\}',lambda m:'\\'+cmd+'{'+prefix+m[1]+'}',text)
    return text

def parts(path):
    text=path.read_text().split(r'\begin{document}',1)[1].rsplit(r'\end{document}',1)[0]
    blocks=re.split(r'(?=\\hypertarget\{[^\n]+\}\{%\n\\(?:section|subsection|subsubsection)\{)', text)
    questions=[]; answers=[]; intro=[]; answering=False
    for block in blocks:
        if re.search(r'\\subsection\{解答と解説',block): answering=True
        if answering:
            if re.search(r'\\subsubsection\{問題',block): block='\\clearpage\n'+block
            answers.append(block)
        else:
            if re.search(r'\\subsection\{問題',block): block='\\clearpage\n'+block
            questions.append(block)
        if re.search(r'\\section\{',block): intro.append(block)
    return namespace(''.join(questions),path.stem+'-'), namespace(''.join(intro+answers),path.stem+'-')

def build(name,doc):
    doc=doc.replace('Latin Modern Math', 'latinmodern-math.otf')
    doc=re.sub(r'\\IfFileExists\{microtype.sty\}.*?\}\{\}', '', doc, flags=re.S)
    path=BUILD/(name+'.tex');path.write_text(doc)
    for _ in range(2):
        run=subprocess.run(['xelatex','-no-shell-escape','-interaction=nonstopmode','-halt-on-error',
                            '-output-directory',str(BUILD),str(path)],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
        (BUILD/(name+'-build.log')).write_text(run.stdout)
        if run.returncode: raise RuntimeError(run.stdout[-4000:])
    for dest in [ROOT/'pdf',ROOT/'web/pdf']:
        dest.mkdir(exist_ok=True);shutil.copy2(BUILD/(name+'.pdf'),dest/(name+'.pdf'))
    print('Built',name,flush=True)

for index,name in enumerate(['questions','solutions']):
    title='問題冊子' if index==0 else '解答・解説冊子'
    cover=r'''\begin{document}\thispagestyle{empty}
{\Huge 稽古 / KEIKO}\par\vspace{10mm}
{\LARGE '''+title+r'''}\par\vspace{8mm}
京大物理形式テキスト集\par
測度論的確率論・微分幾何学・情報幾何学\par\vspace{8mm}
3分野・20大問・192空欄／選択欄・40記述問題\par
長文の誘導をたどり、定義から定理・計算・証明へ進みます。\par
各大問30〜40分を目安に、一つずつ取り組んでください。\par
答案は別紙やノートに記入してください。\par\vfill
添付原稿（2026年11月9日作成）をもとに収録。\par
京都大学の公式教材ではありません。\par
\clearpage
'''
    contents='\n\\clearpage\n'.join(parts(path)[index] for path in sources)
    build(name,preamble+cover+contents+r'\end{document}')
build('analysis',(SOURCE/'00-kyodai-physics-analysis.tex').read_text())
