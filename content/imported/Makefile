# Markdown（docs/）を正本として、LaTeX（tex/）と PDF（pdf/）を生成する。
#   make tex   … LaTeX ソースだけ作る（pandoc が必要）
#   make pdf   … PDF まで作る（XeLaTeX と Noto CJK フォントが必要）
#   make clean … 生成物を消す

DOCS  := $(sort $(wildcard docs/*.md))
TEX   := $(patsubst docs/%.md,tex/%.tex,$(DOCS))
PDF   := $(patsubst docs/%.md,pdf/%.pdf,$(DOCS))

MAINFONT ?= Noto Serif CJK JP
SANSFONT ?= Noto Sans CJK JP
MONOFONT ?= Noto Sans Mono CJK JP
MATHFONT ?= Latin Modern Math

PANDOC_OPTS := -f markdown-raw_tex-tex_math_dollars+task_lists \
	-t latex -s \
	--lua-filter=latex/math-blocks.lua \
	--lua-filter=latex/fallback-glyphs.lua \
	--include-in-header=latex/preamble.tex \
	-V documentclass=article -V papersize=a4 -V fontsize=10pt \
	-V geometry:margin=20mm \
	-V mainfont="$(MAINFONT)" -V sansfont="$(SANSFONT)" \
	-V monofont="$(MONOFONT)" -V mathfont="$(MATHFONT)" \
	-V colorlinks=true -V linkcolor=blue -V urlcolor=blue

.PHONY: all tex pdf clean
all: tex
tex: $(TEX)
pdf: $(PDF)

tex/%.tex: docs/%.md latex/preamble.tex latex/math-blocks.lua latex/fallback-glyphs.lua
	@mkdir -p tex
	pandoc $< $(PANDOC_OPTS) -o $@

pdf/%.pdf: tex/%.tex
	@mkdir -p pdf build
	latexmk -xelatex -interaction=nonstopmode -halt-on-error -outdir=build $<
	cp build/$*.pdf $@

clean:
	rm -rf build pdf
