-- ```math フェンスで書かれた数式ブロックを、LaTeX の別行立て数式に変換する。
-- Markdown 側は GitHub の数式表示（```math）に合わせて書き、
-- LaTeX 側ではこのフィルタで本物の数式として組む。
function CodeBlock(el)
  if el.classes:includes("math") or el.classes:includes("latex") then
    return pandoc.Para({ pandoc.Math("DisplayMath", el.text) })
  end
end
