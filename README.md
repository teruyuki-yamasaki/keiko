# 稽古 / KEIKO

京大物理の「共通の設定を読み、空欄で中間結果を作り、結論を考察する」構成を参考に、大学数学・物理の基礎を学ぶ独自教材です。

初版は **5分野・17大問・85空欄・17記述問題**。大問数は3に固定せず、1大問15〜25分を目安に分割しています。京都大学の公式教材ではありません。

## すぐ使う

GitHub Pages: **https://teruyuki-yamasaki.github.io/keiko/**

以下はローカルで使う場合の手順です。

```bash
cd Keiko
npm start
```

ブラウザで **http://127.0.0.1:4174/** を開きます。Node.jsの標準機能だけで配信し、npm installは不要です。ポート変更は `PORT=4180 npm start`。

- [web/index.html](web/index.html) は相対パスのみの静的ページです。`file://` 直接起動は未検証で、記録保存にもブラウザ差があるため、上記のローカルサーバー起動を利用してください。
- [問題冊子 PDF](pdf/questions.pdf)：A4・18ページ。表紙＋1大問1ページ、解答・メモ欄付き。
- [解答・解説冊子 PDF](pdf/solutions.pdf)：A4・18ページ。各空欄の理由と記述の採点観点。

## 収録範囲

| 分野 | 大問 | 内容 |
| --- | --- | --- |
| 測度とルベーグ積分 | M01〜M04 | σ-加法族、単関数、零集合、単調収束、優収束 |
| 測度から始める確率論 | P01〜P03 | 確率変数、密度、期待値、有限分割の条件付き期待値 |
| 情報幾何 | I01〜I03 | スコア、Fisher情報、KLの局所展開、計量の座標変換 |
| 複素関数論 | C01〜C04 | Cauchy–Riemann、周回積分、積分公式、Laurent展開と留数 |
| 解析力学 | L01〜L03 | Euler–Lagrange、振り子、循環座標と角運動量 |

各分野の基礎への入口です。外測度からの構成、測度の拡張、Radon–Nikodym定理、マルチンゲール、双対接続、複素解析の体系的証明、Hamilton形式などは初版には含めていません。

## 学習機能

- 学習モード：使う道具、空欄入力、ヒント、解答・理由、記述の解答例。
- 復習テスト：定義カード・ヒント・解答を隠し、終了後にまとめて解説を表示。
- 数値・登録表記の照合。同値な式の一般的な判定や、記述の自動採点はしません。未一致は誤答と断定せず、解答との照合を案内します。
- 自己評価：「自力で解けた」「解説で理解」「もう一度」。解答を開くだけでは習得済みになりません。
- 自動保存、要復習の絞り込み、JSONでの記録の書き出し・読み込み、大問単位の解き直し。

保存はブラウザのlocalStorageのみ。同じURL・同じブラウザで復元します。記録を別端末に移すにはJSONを書き出してください。APIキー、外部通信、ログイン、実行時のAI生成は不要です。

## 段階別の成果と残り

1. **調査初版**：[分析](research/analysis.md)、[42年度の索引](research/year-index.md)、[出典台帳](research/sources.json)。大分類42年度と代表例の構造分析を作成。**42年度すべての原本の精読は未完了**です。
2. **作問スキル**：[guided-math-physics](skills/guided-math-physics/SKILL.md)。調査記録、作問、分割、検算、PDF・ウェブ出力の手順。プロジェクト内に保存しており、グローバル環境にはインストールしていません。
3. **教材初版**：[共通データ](content/bank.json)、問題PDF、解答PDF。
4. **ウェブアプリ**：[web](web/index.html)。GitHub Pages用の静的ファイルと自動公開ワークフロー。

検証の結果・限界は [verification.md](reports/verification.md)。

## 問題の追加・再生成

`scripts/author_content.py` が問題の編集元です。既存IDを維持してください。`content/bank.json` と `web/data.js` は生成物です。

```bash
python3 scripts/build.py          # 問題データ・PDF・web/pdfを生成
python3 scripts/build_research.py # 年表・出典・ウェブの調査ページ
npm test                         # 全数式、参照、照合、保存形式、静的リンク
python3 scripts/verify_math.py    # 独立した数理検算（SymPy）
```

PDFの再生成には Python 3、XeLaTeX、xeCJK、Noto Serif/Sans CJK JP、Liberation Serif が必要です。数理検算にはSymPy、紙面画像の検証にはPopplerとPillowを使います。通常のアプリ利用には不要です。描画は同梱したKaTeX 0.16.22（[MITライセンス](web/vendor/katex/LICENSE)）を使用。

## GitHub Pagesへの公開と更新

公開用の完成ファイルは `web/` にまとまっています。相対URLなので `https://<user>.github.io/<repo>/` の配下でも動く構成です。

公開先リポジトリは [teruyuki-yamasaki/keiko](https://github.com/teruyuki-yamasaki/keiko)。[公開ワークフロー](.github/workflows/pages.yml) が main への push 時に内容検証を行い、成功すると `web/` を GitHub Pages に配信します。PDFは生成済みのものを配信するため、教材変更時は上記ビルドを実行して生成物もコミットしてください。

GitHub Pages の設定は Settings → Pages → Source: GitHub Actions。公開URLとローカルURLでは保存領域が異なるので、学習記録の移動にはJSON書き出し・読み込みを使ってください。

## 次の改善

まずM02・P03・I01・C02・L01を試して、所要時間と誘導の細かさを調整するのがおすすめです。その後は、過去問の全原本分析を充実させる、各基礎単元に類題を増やす、物理の他分野へ広げる、の順で発展できます。
