# 稽古 / KEIKO — 京大物理形式テキスト集

**https://teruyuki-yamasaki.github.io/keiko/**

添付された `kyodai-style-texts.zip` の教材に差し替えました。長文の誘導、空欄・選択問題、記述問題、解答・解説を全文収録しています。京都大学の公式教材ではありません。

| 分野 | 大問 | 内容 |
| --- | --- | --- |
| 測度論的確率論 | MP01–MP06 | σ-加法族、確率測度、確率変数、ルベーグ積分、収束・大数の法則、条件付き期待値 |
| 微分幾何学 | DG01–DG06 | 曲線、第一・第二基本形式、測地線、多様体、微分形式とストークスの定理 |
| 情報幾何学 | IG01–IG08 | フィッシャー計量、KL、指数型分布族、双対接続、双対平坦性、統計的推論、推定効率、正規分布族 |

**3分野・20大問・192空欄／選択欄・40記述問題。** 原稿の目安は各大問30〜40分です。

## 使い方

本文の空欄をクリックして解答欄へ移動できます。空欄ごとの解答表示と、全文の解答・解説表示が可能です。別行数式内の空欄は本文上の表示を維持し、解答欄から「本文の位置へ」で戻れます。記述は問1・問2それぞれに入力欄があります。

「復習テスト」では解答を隠し、終了後に表示します。照合は登録表記・数値の一致のみで、一般の数式同値判定や証明の自動採点は行いません。自己評価と要復習の絞り込み、JSONでの記録の書き出し・読み込みに対応します。

学習記録はブラウザ内に保存。旧教材とは別の保存キーと問題IDを使い、旧記録を上書き・移行しません。旧版JSONの読み込みは教材の混同を防ぐため拒否します。

- [問題冊子](pdf/questions.pdf)：A4・24ページ
- [解答・解説冊子](pdf/solutions.pdf)：A4・24ページ
- [形式分析](pdf/analysis.pdf)：A4・5ページ
- [ウェブの形式分析](web/research.html)

## ローカルで使う

```sh
cd Keiko
npm start
```

http://127.0.0.1:4174/ を開きます。Node.js標準機能のみで配信し、npm installは不要です。

## 原稿と生成手順

- `content/imported/docs/`：添付されたMarkdown正本。本文は改変せず取り込み。
- `content/imported/tex/`：添付の生成済みLaTeX。
- `content/imported/latex/` と `Makefile`：添付のMarkdown → LaTeX変換手順。
- `scripts/import_texts.py`：Markdownを大問単位に分け、ウェブデータ・分析ページを生成。
- `scripts/build_books.py`：添付LaTeXから問題と解答を分離し、冊子を生成。原稿側のファイルは変更せず、組版用フォント名・アンカー・改ページなどを調整。
- `web/`：公開ファイル。KaTeXは同梱され、学習操作による外部送信はありません。

```sh
python3 scripts/build.py   # ウェブとPDFを生成
npm test                  # 原稿保持、空欄対応、数式、保存形式、公開ファイルを検証
```

ウェブ再生成にはPython 3とmarkdown-it-py、PDF再生成にはXeLaTeX、Noto Serif/Sans/Mono CJK JP、DejaVu Serif、Latin Modern Mathが必要です。通常のサイト利用には不要です。

原稿を編集する際は、MarkdownとLaTeXを同期させてください。Pandocがある環境なら `make -C content/imported tex` で再生成し、その後 `python3 scripts/build.py` を実行します。問題IDや保存形式を変える場合は既存記録との対応を明示してください。

mainへのpushでGitHub Actionsが検証し、`web/` をGitHub Pagesに公開します。[検証記録](reports/verification.md)。旧教材はGit履歴に残っています。
