"""Generate the static app data and two Japanese, mathematically typeset booklets."""
import json, re, shutil, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,str(ROOT/'scripts/author_content.py')],check=True)
bank=json.loads((ROOT/'content/bank.json').read_text())
(ROOT/'web/data.js').write_text('window.KEIKO_BANK = '+json.dumps(bank,ensure_ascii=False)+';\n')

def tex(s):
    # Author-controlled text uses only TeX math delimiters; plain prose is escaped.
    chunks=re.split(r'(\\\(.*?\\\))',s,flags=re.S)
    def plain(t):
        for a,b in [('&',r'\&'),('%',r'\%'),('#',r'\#'),('_',r'\_')]:t=t.replace(a,b)
        t=t.replace('θ',r'\(\theta\)').replace('φ',r'\(\phi\)').replace('λ',r'\(\lambda\)').replace('μ',r'\(\mu\)').replace('ν',r'\(\nu\)').replace('Ω',r'\(\Omega\)').replace('σ',r'\(\sigma\)').replace('δ',r'\(\delta\)').replace('π',r'\(\pi\)').replace('ω',r'\(\omega\)').replace('ℓ',r'\(\ell\)').replace('→',r'\(\to\)').replace('−',r'\(-\)').replace('²',r'\(^{2}\)').replace('⁰',r'\(^{0}\)').replace('⁻¹',r'\(^{-1}\)')
        return re.sub(r'\[\[(.*?)\]\]',lambda m:r'\fbox{\strut '+m[1]+r'\hspace{12mm}}',t)
    return ''.join(c if c.startswith(r'\(') else plain(c) for c in chunks)

preamble=r'''\documentclass[a4paper,12pt]{article}
\usepackage[margin=21mm,headheight=15pt]{geometry}
\usepackage{fontspec,xeCJK,amsmath,amssymb,xcolor,fancyhdr,enumitem,tabularx,hyperref}
\setmainfont{Liberation Serif}
\setCJKmainfont{Noto Serif CJK JP}
\setCJKsansfont{Noto Sans CJK JP}
\definecolor{ink}{HTML}{193E3A}
\definecolor{muted}{HTML}{59726E}
\hypersetup{colorlinks=true,linkcolor=ink,urlcolor=ink,pdftitle={稽古 基礎編01}}
\pagestyle{fancy}\fancyhf{}\lhead{\small 稽古 / KEIKO}\rhead{\small 基礎編 01}\cfoot{\thepage}
\renewcommand{\headrulewidth}{0.3pt}
\linespread{1.12}
\setlength{\parindent}{0pt}\setlength{\parskip}{7pt}
\setlist[itemize]{leftmargin=6mm,itemsep=2pt,topsep=2pt}
\setlist[enumerate]{leftmargin=8mm,itemsep=2pt,topsep=2pt}
\newcommand{\blocktitle}[1]{\par\vspace{3mm}{\sffamily\color{ink}\bfseries #1}\par}
\begin{document}
'''

for kind in ['questions','solutions']:
    isq=kind=='questions'
    title='問題冊子' if isq else '解答・解説冊子'
    doc=[preamble, r'\thispagestyle{empty}',r'{\color{muted}\sffamily MATHEMATICS / PHYSICS · FOUNDATION 01}\par\vspace{15mm}',
         r'{\fontsize{36}{45}\selectfont 稽古}\par\vspace{4mm}',r'{\LARGE '+title+r'}\par\vspace{8mm}',
         r'誘導をたどり、自分の手で結論に届く。\par',
         r'測度・積分／確率論／情報幾何／複素関数論／解析力学\par\vspace{8mm}',
         r'\blocktitle{この冊子の使い方}',
         '全17大問。各大問は空欄5個と記述1問、目安15〜25分。分野ごとに大問数を変え、1回に1大問ずつ取り組めます。',
         '空欄は各2点、記述は3つの観点を各2点とする自己採点例（1大問16点）です。合計点より、説明できない箇所の発見を優先してください。',
         ('定義や道具を確認してから本文を読み、最後の記述まで解いてください。紙面下部の欄や別紙を使えます。復習時は「使う道具」を隠して再挑戦してください。' if isq else '各空欄の答え・理由、記述の解答例・採点観点を掲載しています。数式の同値な表現や、筋道の通った別解も正解です。'),
         r'\blocktitle{収録内容}']
    for c in bank['courses']:
        ps=[p for p in bank['problems'] if p['course']==c['id']]
        doc.append(tex(c['title'])+'：'+str(len(ps))+'大問（'+', '.join(p['id'] for p in ps)+'）'+r'\par')
    doc += [r'\vfill',r'{\small 京都大学の公開過去問の構成を参考にした独自教材です。京都大学の公式教材・過去問転載ではありません。初版の各分野への導入であり、分野全体の網羅を目的としません。\\2026年11月20日 / v1.0}',r'\newpage']
    for p in bank['problems']:
        c=next(c for c in bank['courses'] if c['id']==p['course'])
        doc += [r'\hypertarget{'+p['id']+r'}{}',r'{\small\color{muted}\sffamily '+p['id']+' / '+tex(c['title'])+' / '+str(p['minutes'])+r'分}\par',r'{\Large\bfseries '+tex(p['title'])+r'}\par',r'{\small '+tex(p['goal'])+r'}\par']
        if isq:
            doc += [r'\blocktitle{使う道具}',r'{\small '+tex(p['recall'])+r'\par}',r'\blocktitle{問題}',tex(p['setup'])+r'\par']
            doc += [tex(s['text'])+r'\par' for s in p['steps']]
            doc += [r'\blocktitle{問：ことば・式で説明する}',tex(p['essay']),r'\vfill\blocktitle{解答欄}',r'\begin{tabularx}{\textwidth}{|X|X|X|X|X|}\hline ア & イ & ウ & エ & オ \\ [10mm]\hline\end{tabularx}',r'\vspace{3mm}{\small 記述・計算メモ}\par\vspace{8mm}\hrule\vspace{9mm}\hrule\vspace{9mm}\hrule']
        else:
            doc += [r'\blocktitle{空欄の答えと理由}']
            for s in p['steps']:
                doc += [r'\textbf{'+s['label']+r'}\quad \('+s['answer']+r'\)\par',tex(s['explanation'])+r'\par']
            doc += [r'\blocktitle{記述の解答例}',tex(p['solution']),r'\blocktitle{採点の観点（各2点）}',r'\begin{itemize}']
            doc += [r'\item '+tex(x) for x in p['rubric']]
            doc += [r'\end{itemize}',r'\vfill\blocktitle{持ち帰ること}',tex(p['takeaway'])]
        doc.append(r'\newpage')
    doc += [r'\end{document}']
    out=ROOT/'build'/f'{kind}.tex';out.write_text('\n'.join(doc))
    for _ in range(2):
        run=subprocess.run(['xelatex','-interaction=nonstopmode','-halt-on-error','-output-directory',str(ROOT/'build'),str(out)],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
        (ROOT/'build'/f'{kind}-build.log').write_text(run.stdout)
        if run.returncode:
            print(run.stdout[-5000:]);sys.exit(run.returncode)
    shutil.copy2(ROOT/'build'/f'{kind}.pdf',ROOT/'pdf'/f'{kind}.pdf')
    print(kind, 'built')
(ROOT/'web/pdf').mkdir(exist_ok=True)
for p in (ROOT/'pdf').glob('*.pdf'):shutil.copy2(p,ROOT/'web/pdf'/p.name)
