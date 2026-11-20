# 京大物理形式テキスト集

京都大学の物理入試（大問3題・誘導つき長文・空欄補充＋選択＋「問」）の出題形式を分析し、その形式で大学数学の基礎を学ぶためのテキストにしたものです。1テーマ＝大問1題、空欄を前から順に埋めると定義から主要定理までたどれるように作ってあります。

| ファイル | 内容 | 構成 |
| --- | --- | --- |
| [docs/00-kyodai-physics-analysis.md](docs/00-kyodai-physics-analysis.md) | 京都大学 物理 入試過去問分析（2019〜2026年度） | 基本情報・大問構成・形式・年度別一覧・頻出項目・難易度 |
| [docs/01-measure-theoretic-probability.md](docs/01-measure-theoretic-probability.md) | 測度論的確率論 | 大問6題＋解答 |
| [docs/02-differential-geometry.md](docs/02-differential-geometry.md) | 微分幾何学 | 大問6題＋解答 |
| [docs/03-information-geometry.md](docs/03-information-geometry.md) | 情報幾何学 | 大問8題＋解答 |

## ディレクトリ構成

```
docs/    正本（Markdown）。GitHub 上で数式も表示される
tex/     docs/ から生成した LaTeX 版（コミット済み）
latex/   LaTeX 生成用のプリアンブルと pandoc フィルタ
Makefile ビルド手順
```

編集は `docs/` の Markdown に対して行い、`make` で `tex/` を作り直してください。`tex/` を直接編集すると、次の生成で上書きされます。

## Markdown の書き方の決まり

- 別行立ての数式は ```` ```math ```` のコードブロックに LaTeX で書く（GitHub がそのまま数式として表示する）。
- 本文中の式は ξⁱ、∂ᵢ、ℝ のような Unicode 文字で書く。
- 空欄は【ア】、選択欄は { ケ } と書く。記号は京大物理にならい、大問ごとにカタカナ・イロハ・ひらがなを順に使う。

## ビルド

Debian / Ubuntu の場合、次のパッケージで LaTeX と PDF を生成できます。

```sh
sudo apt install make pandoc latexmk texlive-xetex texlive-latex-recommended \
                 fonts-lmodern fonts-noto-cjk fonts-dejavu-core
```

```sh
make        # docs/*.md → tex/*.tex
make pdf    # tex/*.tex → pdf/*.pdf（XeLaTeX）
make clean  # build/ と pdf/ を消す
```

日本語専用の LaTeX パッケージ（luatexja、xeCJK）は使っていません。本文は和欧両対応の Noto Serif CJK JP で組み、このフォントに無い添字文字（ᵢ、ⁿ など）や ℝ・⟨ ⟩ だけを DejaVu Serif で補っています（`latex/fallback-glyphs.lua`）。フォントは `make pdf MAINFONT="IPAexMincho"` のように変更できます。

`build/` と `pdf/` は生成物なので Git の管理外にしています。PDF も公開したい場合は `.gitignore` から `pdf/` を外してください。
