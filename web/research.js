'use strict';
document.querySelectorAll('.math-display').forEach(el => {
  katex.render(el.textContent, el, {displayMode:true, throwOnError:false, strict:'ignore', trust:false});
});
