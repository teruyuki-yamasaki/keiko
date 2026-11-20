"""Maintain a factual index; verification levels are intentionally explicit."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sources=[
 ('date-index','伊達の物理：京都大学の年度別一覧','https://date-physics.jimdofree.com/入試解説/京都大/','secondary-index','1985〜2022の大分野を確認。原本確認とは区別する。'),
 ('toshin-2016','東進：京大入試研究 物理（2007〜2016）','https://www.toshin-daigaku.com/inc_univ/042/pdf/6_kyodai_butsuri.pdf','secondary-analysis','10年の細目。表の行を紙面画像で照合済み。'),
 ('t1990','京大過去問研究所：1990 I','https://toransha.com/physics/mechanics/physics-1990-1/','reproduced-text','問題文の再掲を確認。原本未照合。'),
 ('t1995','京大過去問研究所：1995 I','https://toransha.com/physics/thermodynamics/physics-1995-1/','reproduced-text','同上。一次元の圧力は力の次元と問題中で定義。'),
 ('t1997','京大過去問研究所：1997 I','https://toransha.com/physics/mechanics/physics-1997-1/','reproduced-text','同上。固定座標と台車座標を比較。'),
 ('t2000','京大過去問研究所：2000 III','https://toransha.com/physics/thermodynamics/physics-2000-3/','reproduced-text','同上。異なる過程を共通の保存則で扱う。'),
 ('t2005','京大過去問研究所：2005 I','https://toransha.com/physics/mechanics/physics-2005-1/','reproduced-text','同上。見かけの重力を後続の運動に再利用。'),
 ('zkai2023','Z会：2023物理分析','https://www.zkai.co.jp/kyodai-exam/bunseki/butsuri-2023/','secondary-analysis','大分野、細目、設問の関係を講評で確認。'),
 ('zkai2024','Z会：2024物理分析','https://www.zkai.co.jp/kyodai-exam/bunseki/butsuri-2024/','secondary-analysis','大分野、細目、設問の関係を講評で確認。'),
 ('official2025','京都大学：2025物理 出題意図','https://www.kyoto-u.ac.jp/sites/default/files/inline-files/admissionsundergradpast_eqR07_eqdocumentsR07_4M101-48a28424405b7a93328b84b83d41604a.pdf','official-intent','I pp.2–4、II pp.5–7、III pp.8–9（PDFページ）。'),
 ('paper2025','京都大学：2025理科 問題','https://www.kyoto-u.ac.jp/sites/default/files/inline-files/admissionsundergradpast_eqR07_eqdocumentsR07_4M102-e9a205ea41f89c539dad05f16fa904f2.pdf','official-paper-metadata','表紙の物理3題を確認。全問題精読とは扱わない。'),
 ('correction2025','京都大学：2025物理の訂正','https://www.kyoto-u.ac.jp/ja/news/2025-04-11-4','official-notice','III(2)に表記訂正あり。本文研究時は訂正を参照。'),
 ('official2026','京都大学：2026物理 出題意図','https://www.kyoto-u.ac.jp/sites/default/files/inline-files/admissionsundergradpast_eqR08_eqdocumentsR08_4_M101-0d8d15ec0534bc363a9803616a9f7815.pdf','official-intent','I pp.2–4、II pp.5–7、III pp.8–9（PDFページ）。'),
 ('paper2026','京都大学：2026物理 問題','https://www.kyoto-u.ac.jp/sites/default/files/inline-files/admissionsundergradpast_eqR08_eqdocumentsR08_4M101-498690230bfe76e4a71b55f989601037.pdf','official-paper-located','19ページ。リンク確認。全紙面精読とは扱わない。'),
 ('mit-measure','MIT 18.125：Measure and Integration 講義一覧','https://ocw.mit.edu/courses/18-125-measure-and-integration-fall-2003/pages/lecture-notes/','curriculum-reference','測度、単関数、収束定理の学習順序。'),
 ('mit-probability','MIT 18.175：Lecture 25','https://ocw.mit.edu/courses/18-175-theory-of-probability-spring-2014/f33e55917467aa3cf5afa57ec32f4a6a_MIT18_175S14_Lecture25.pdf','definition-reference','PDF p.4の条件付き期待値の定義。'),
 ('nielsen','Frank Nielsen：An Elementary Introduction to Information Geometry','https://franknielsen.github.io/entropy-22-01100-v2.pdf','theory-reference','Fisher計量等の位置づけ。演習の計算は独自に導出。'),
 ('mit-complex','MIT 18.04：Complex Variables 講義資料','https://ocw.mit.edu/courses/18-04-complex-variables-with-applications-spring-2018/resources/lecture-notes/','curriculum-reference','正則関数、線積分、Cauchy公式、留数への順序。'),
]
sources=[dict(id=i,title=t,url=u,type=y,note=n,accessed='2026-11-20') for i,t,u,y,n in sources]
raw='''1985 熱 原 電
1986 力 熱 電
1987 力 波 電 原
1988 熱 電 原
1989 力 電 波
1990 力 電 熱
1991 力 熱 電
1992 力 電 熱
1993 熱 原 原
1994 力 電 波
1995 熱 電 原
1996 力 電 原
1997 力 電 波
1998 力 電 波
1999 力 電 波
2000 力 原 熱
2001 電 原 熱
2002 力 電 波
2003 力 熱 原
2004 力 熱 電
2005 力 電 電
2006 熱 電 熱
2007 力 電 熱
2008 力 電 原
2009 力 電 波
2010 力 電 波
2011 力 電 熱
2012 力 電 波力
2013 力 電 熱
2014 力 電 熱
2015 力 電 原
2016 力 電 熱
2017 力 電 波
2018 力 電 波
2019 力 電 波
2020 力 電 熱
2021 力 電 原
2022 力 電 熱
2023 力 電原 波
2024 力 電 波
2025 力 電 熱
2026 力 電 熱'''
names={'力':'力学','電':'電磁気','熱':'熱学','波':'波動','原':'原子','波力':'波動＋力学（相対論）','電原':'電磁気＋原子'}
details={
 1990:{'I':['円運動','仕事','微小変化','復元力']},
 1995:{'I':['粒子の衝突','準静的圧縮','不変量','小振動']},
 1997:{'I':['衝突','相対運動','慣性力','ばね']},
 2000:{'III':['断熱過程','第一法則','流出気体']},
 2005:{'I':['非慣性系','円錐振り子','エネルギー','近似']},
 2007:{'I':['衝突・緩衝'],'II':['磁束変化'],'III':['ゴム弾性']},
 2008:{'I':['抵抗を伴う回転'],'II':['コンデンサー内の力'],'III':['メスバウアー効果']},
 2009:{'I':['剛体の静力学'],'II':['粒子加速器'],'III':['波の性質']},
 2010:{'I':['二体系'],'II':['荷電粒子'],'III':['気柱共鳴']},
 2011:{'I':['ワイパー'],'II':['相互誘導'],'III':['気体変化']},
 2012:{'I':['摩擦・二物体'],'II':['コンデンサー'],'III':['一般相対論']},
 2013:{'I':['重力・列車'],'II':['容量と振動'],'III':['理想気体']},
 2014:{'I':['単振動'],'II':['交流・過渡'],'III':['分子運動・サイクル']},
 2015:{'I':['回転環'],'II':['誘導・磁場'],'III':['原子模型・回折・Doppler']},
 2016:{'I':['二体系'],'II':['導体棒・誘導・振動'],'III':['定圧・断熱・安定性']},
 2023:{'I':['軌道','中心力'],'II':['球形コンデンサー','光電効果'],'III':['偏光','干渉']},
 2024:{'I':['振り子','連成振動'],'II':['電磁場中の荷電粒子'],'III':['光ファイバー']},
 2025:{'I':['円運動','重心'],'II':['変形コイル','エネルギーと圧力'],'III':['断熱・等温','気体モデル']},
 2026:{'I':['斜面台','衝突','荷電粒子'],'II':['導体','回転','電磁誘導'],'III':['可動壁','理想気体','熱サイクル']},
}
rows=[]
for line in raw.splitlines():
 parts=line.split();y=int(parts[0]);src=['date-index'] if y<=2022 else [f'zkai{y}'] if y<=2024 else [f'official{y}']
 if 2007<=y<=2016:src.append('toshin-2016')
 if y in [1990,1995,1997,2000,2005]:src.append(f't{y}')
 notes=[]
 if y==1987:notes.append('一覧では4題。原本未照合。')
 rows.append(dict(year=y,round='学部一般選抜・前期（資料上の年度表記）',topics=[names[t] for t in parts[1:]],detailedTopics=details.get(y,{}),sourceIds=src,verification='official-intent' if y>=2025 else 'secondary-analysis' if y>=2023 else 'secondary-index',notes=notes))
(ROOT/'research/sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
(ROOT/'research/year-index.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
md=['# 年度別索引（1985〜2026、42年度）','','全年度は大分類の索引。細目のない欄は未調査であり、出題がないという意味ではありません。二次資料による分類は原本確認と区別します。出典IDは [sources.json](sources.json) を参照。','','| 年 | I | II | III | IV | 細目の確認 | 出典ID |','| --- | --- | --- | --- | --- | --- | --- |']
for r in rows:
 topics=r['topics']+['—']*(4-len(r['topics']))
 detail=' / '.join(k+': '+', '.join(v) for k,v in r['detailedTopics'].items()) or '未確認'
 md.append('| '+' | '.join([str(r['year'])]+topics+[detail,', '.join(r['sourceIds'])])+' |')
md+=['','## 確認事項','', '東進PDFのテキスト抽出では2007・2009・2010の行が乱れたため、紙面画像で照合した。2007 III＝ゴム弾性、2009 II＝粒子加速器・III＝波の性質、2010 II＝荷電粒子・III＝気柱共鳴。','']
for r in rows:
 for n in r['notes']:md.append(f'- {r["year"]}：{n}')
(ROOT/'research/year-index.md').write_text('\n'.join(md)+'\n')
print('42-year index and sources written')
