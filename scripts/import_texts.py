"""Build the reader from the supplied Markdown, preserving whole problem sections."""
import hashlib
import html
import json
import re
import shutil
from pathlib import Path
from markdown_it import MarkdownIt

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'content/imported/docs'
DATASET = 'kyodai-style-texts-2026-11'
md = MarkdownIt('commonmark', {'html': False}).enable('table')

def fence(tokens, idx, options, env):
    token = tokens[idx]
    if token.info.strip() == 'math':
        return '<div class="math-display">' + html.escape(token.content.strip()) + '</div>\n'
    return '<pre><code>' + html.escape(token.content) + '</code></pre>\n'

md.renderer.rules['fence'] = fence
COURSES = [
    ('probability', 'MP', '01-measure-theoretic-probability', '測度論的確率論', 'MEASURE-THEORETIC PROBABILITY', 'σ-加法族から条件付き期待値まで', '#51786b'),
    ('geometry', 'DG', '02-differential-geometry', '微分幾何学', 'DIFFERENTIAL GEOMETRY', '曲線・曲面から多様体と微分形式へ', '#697da0'),
    ('information', 'IG', '03-information-geometry', '情報幾何学', 'INFORMATION GEOMETRY', 'フィッシャー計量から統計的推論へ', '#a07b51'),
]

def render(text):
    return md.render(text)

def main():
    bank = {'version': 2, 'dataset': DATASET, 'courses': [], 'problems': [], 'sources': []}
    for course, prefix, slug, title, en, subtitle, color in COURSES:
        path = SOURCE / (slug + '.md')
        text = path.read_text()
        qpart, apart = re.split(r'^## 解答と解説.*$', text, maxsplit=1, flags=re.M)
        qs = list(re.finditer(r'^## 問題([ⅠⅡⅢⅣⅤⅥⅦⅧ]+)[　 ]+(.+)$', qpart, re.M))
        ans = list(re.finditer(r'^### 問題([ⅠⅡⅢⅣⅤⅥⅦⅧ]+)\s*$', apart, re.M))
        answer_sections = {}
        for i, match in enumerate(ans):
            body = apart[match.end():ans[i+1].start() if i+1 < len(ans) else len(apart)].strip()
            body = re.split(r'^## 解答と解説.*$', body, flags=re.M)[0].strip()
            answer_sections[match[1]] = body
        assert len(qs) == len(ans)
        intro = qpart[:qs[0].start()].strip()
        bank['courses'].append(dict(id=course, title=title, en=en, subtitle=subtitle, color=color,
                                    source=slug+'.md', introduction=render(intro), introductionMarkdown=intro))
        for i, match in enumerate(qs):
            body = qpart[match.end():qs[i+1].start() if i+1 < len(qs) else len(qpart)].strip()
            solution = answer_sections[match[1]]
            steps = []
            for line in solution.splitlines():
                if not line.startswith('|'): continue
                cells = [c.strip() for c in re.split(r'(?<!\\)\|', line)[1:-1]]
                if len(cells) != 3 or not re.fullmatch('[ァ-ヺぁ-ゖ]', cells[0]): continue
                label, answer, reason = cells
                steps.append(dict(label=label, answer=answer, answerHtml=md.renderInline(answer),
                                  explanation=reason, explanationHtml=md.renderInline(reason)))
            labels = {s['label'] for s in steps}
            used = set(re.findall(r'【([ァ-ヺぁ-ゖ])】|\{\s*([ァ-ヺぁ-ゖ])\s*\}', body))
            used = {a or b for a,b in used}
            assert labels == used, (prefix, match[1], labels ^ used)
            assert len(labels) == len(steps)
            essays = re.findall(r'^問(\d+)[　 ]', body, re.M)
            bank['problems'].append(dict(id=f'{prefix}{i+1:02}', course=course, number=match[1],
                title=match[2], minutes='30–40', bodyMarkdown=body, bodyHtml=render(body),
                solutionMarkdown=solution, solutionHtml=render(solution), steps=steps, essays=essays))
        bank['sources'].append({'file':slug+'.md', 'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    assert len(bank['problems']) == 20
    (ROOT/'content/bank.json').write_text(json.dumps(bank, ensure_ascii=False, indent=2)+'\n')
    (ROOT/'web/data.js').write_text('window.KEIKO_BANK = '+json.dumps(bank, ensure_ascii=False)+';\n')
    public_source = ROOT/'web/texts'
    public_source.mkdir(exist_ok=True)
    for path in SOURCE.glob('*.md'): shutil.copy2(path,public_source/path.name)
    analysis = render((SOURCE/'00-kyodai-physics-analysis.md').read_text())
    (ROOT/'web/research.html').write_text('''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>京大物理の形式分析 | 稽古</title><link rel="stylesheet" href="vendor/katex/katex.min.css"><link rel="stylesheet" href="style.css"><script defer src="vendor/katex/katex.min.js"></script><script defer src="research.js"></script></head><body><header class="topbar"><a class="brand" href="./">稽古 <small>KEIKO</small></a><a href="pdf/analysis.pdf">分析PDF</a></header><main class="research-document prose"><p class="end-note">添付教材の分析資料を収録しています。年度・配点などの記述は原稿時点のものです。</p>'''+analysis+'</main></body></html>')
    print(f"Imported {len(bank['courses'])} courses / {len(bank['problems'])} problems / {sum(len(p['steps']) for p in bank['problems'])} blanks / {sum(len(p['essays']) for p in bank['problems'])} written questions")

if __name__ == '__main__': main()
