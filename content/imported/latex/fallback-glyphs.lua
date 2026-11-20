-- 本文フォント（Noto Serif CJK JP）に無い文字の連なりを {\fallbackfont ...} で包む。
-- 対象は上付き・下付きの添字文字、ℝ・ℕ・ℚ、⟨ ⟩、↦、∘ など。
-- 数式（Math 要素）には触れない。結合文字（^ や ~ の付加記号）は直前の文字ごと包む。

local fallback = {}
local ranges = {
  {0x02B0, 0x02FF},  -- 修飾文字（ʲ ʳ ˡ ˣ など）
  {0x1D2C, 0x1DBF},  -- 音声記号拡張（ᴺ ᵀ ᵏ ᵢ ᵤ ᵥ ᵧ ᶜ ᶿ など）
  {0x2070, 0x209F},  -- 上付き・下付きの数字と文字
  {0x2C7C, 0x2C7C},  -- ⱼ
}
for _, r in ipairs(ranges) do
  for c = r[1], r[2] do fallback[c] = true end
end
for _, c in ipairs({0x03D1, 0x03D5, 0x2034, 0x2115, 0x211A, 0x211D,
                    0x21A6, 0x2218, 0x27E8, 0x27E9}) do
  fallback[c] = true
end
local combining = { [0x0302] = true, [0x0303] = true, [0x0304] = true, [0x0307] = true }

function Str(el)
  local cps = {}
  for _, c in utf8.codes(el.text) do cps[#cps + 1] = c end
  -- 結合文字の直前の文字も補助フォント側に回す
  local mark = {}
  for i, c in ipairs(cps) do
    if fallback[c] then mark[i] = true end
    if combining[c] then
      mark[i] = true
      if i > 1 then mark[i - 1] = true end
    end
  end
  local any = false
  for i = 1, #cps do if mark[i] then any = true break end end
  if not any then return nil end

  local out, buf, cur = {}, {}, nil
  local function flush()
    if #buf == 0 then return end
    local s = utf8.char(table.unpack(buf))
    if cur then
      local esc = s:gsub("[\\{}#$%%&_~^]", function(ch) return "\\char" .. string.byte(ch) .. "{}" end)
      out[#out + 1] = pandoc.RawInline("latex", "{\\fallbackfont " .. esc .. "}")
    else
      out[#out + 1] = pandoc.Str(s)
    end
    buf = {}
  end
  for i, c in ipairs(cps) do
    local m = mark[i] or false
    if cur ~= m then flush(); cur = m end
    buf[#buf + 1] = c
  end
  flush()
  return out
end
