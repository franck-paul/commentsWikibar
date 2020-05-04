/*global dotclear, getData, mergeDeep */
'use strict';

window.addEventListener('load', () => {
  const data = getData('commentswikibar');

  dotclear.jsToolBar.prototype.base_url = data.host;
  dotclear.jsToolBar.prototype.legend_msg = data.legend_msg;
  dotclear.jsToolBar.prototype.label = data.label;

  mergeDeep(dotclear.jsToolBar.prototype.elements, data.elements);

  if (document.getElementById(data.id)) {
    const commentTb = new dotclear.jsToolBar(document.getElementById(data.id));
    if (data.options.no_format) {
      commentTb.elements.strong.type = '';
      commentTb.elements.em.type = '';
      commentTb.elements.ins.type = '';
      commentTb.elements.del.type = '';
      commentTb.elements.quote.type = '';
      commentTb.elements.code.type = '';
      commentTb.elements.space1.type = '';
    }
    if (data.options.no_br) {
      commentTb.elements.br.type = '';
      commentTb.elements.space2.type = '';
    }
    if (data.no_list) {
      commentTb.elements.ul.type = '';
      commentTb.elements.ol.type = '';
    }
    if (data.no_pre) {
      commentTb.elements.pre.type = '';
    }
    if (data.no_quote) {
      commentTb.elements.bquote.type = '';
    }
    if (data.no_list && data.no_pre && data.no_quote) {
      commentTb.elements.space3.type = '';
    }
    if (data.no_url) {
      commentTb.elements.link.type = '';
    }
    commentTb.draw(data.mode);
  }
});
