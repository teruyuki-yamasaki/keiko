import html,json,shutil,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,str(ROOT/'scripts/research_index.py')],check=True)
sources=json.loads((ROOT/'research/sources.json').read_text());rows=json.loads((ROOT/'research/year-index.json').read_text())
esc=html.escape
levels={'official-intent':'公式出題意図','secondary-analysis':'講評','secondary-index':'二次資料の一覧'}
body='''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>調査と作問方針 / 稽古</title><link rel="stylesheet" href="style.css"><style>main{max-width:1100px;margin:auto}h1{font-size:30px}h2{font-size:21px;margin-top:40px}p,li{font-size:15px}table{border-collapse:collapse;min-width:760px;width:100%;font-size:13px}td,th{padding:12px 10px;border-bottom:1px solid #dce5de;text-align:left;vertical-align:top}thead{background:#e8f0ea}.table-wrap{overflow-x:auto}.source-list li{margin:15px 0}.source-list small{display:block;color:#6b8073}</style></head><body><header class="topbar"><a class="brand" href="index.html"><span class="brand-mark">稽</span><span>稽古 <small>KEIKO</small></span></a><a href="index.html" class="quiet">演習に戻る</a></header><main><span class="eyebrow">RESEARCH / DESIGN NOTES</span><h1>出題の型を、学習の道具に。</h1><p>京大物理の誘導構成を参考に、大学数学・物理の基礎演習を作りました。原文の転載ではなく、全17大問が独自の設定・文章です。</p><section class="howto"><h2 style="margin-top:0">調査範囲を明確にする</h2><p>1985〜2026の42年度は分野一覧として整理しています。1990・1995・1997・2000・2005の代表問題は第三者再掲本文、2023・2024は講評、2025・2026は公式出題意図を読みました。42年分の全原本・全設問を精読した調査ではありません。</p></section><h2>抽出した構成</h2><ol><li>共通の設定を示し、使う定義・法則を揃える。</li><li>空欄を埋めながら、次に使える中間結果を得る。</li><li>条件を変えたり、結果を組み合わせたりする。</li><li>最後に、結論や仮定の意味をことばで説明する。</li></ol><p>大問数は固定しません。初版では、1回15〜25分・空欄5個・短い記述1問という小さな単位にしました。この時間と分量は入試の事実ではなく、基礎学習のための独自設計です。</p><h2>年度別の大分類</h2><p>古い年度は二次資料による索引です。原子は原子力だけを指す分類ではありません。詳細な単元・出典・確認水準は <a href="research/year-index.json">年表JSON</a> と <a href="research/sources.json">出典JSON</a> に記録しています。<a href="research/analysis.md">詳しい分析メモ</a>も読めます。</p><div class="table-wrap"><table><thead><tr><th>年度</th><th>I</th><th>II</th><th>III</th><th>IV</th><th>大分類の根拠</th></tr></thead><tbody>'''
for r in reversed(rows):
    topics=r['topics']+['—']*(4-len(r['topics']))
    body+='<tr>'+''.join('<td>'+esc(str(v))+'</td>' for v in [r['year']]+topics+[levels[r['verification']]])+'</tr>'
body+='</tbody></table></div><h2>出典</h2><p>確認日：2026年11月20日。外部サイトの公開期間やURLは変わる場合があります。</p><ol class="source-list">'
for s in sources:body+='<li><a href="'+esc(s['url'],quote=True)+'" target="_blank" rel="noopener">'+esc(s['title'])+'</a><small>'+esc(s['note'])+'</small></li>'
body+='</ol><h2>この先に続けること</h2><p>全年度の原本に基づく設問数・図・依存関係の記録は未完了です。今回の教材を試しつつ、原本の確認と作問ルールの改善を続けられる構成にしています。</p><p><a class="primary" href="index.html">演習に戻る</a></p></main></body></html>'
(ROOT/'web/research.html').write_text(body)
(ROOT/'web/research').mkdir(exist_ok=True)
for p in (ROOT/'research').iterdir():
 if p.is_file():shutil.copy2(p,ROOT/'web/research'/p.name)
