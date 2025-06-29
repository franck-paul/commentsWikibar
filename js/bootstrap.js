/*global dotclear */
'use strict';

window.addEventListener('load', () => {
  const data = dotclear.getData('commentswikibar');

  if (!document.getElementById(data.id)) {
    return;
  }
  const commentTb = new dotclear.jsToolBar(
    document.getElementById(data.id),
    data.host,
    data.legend_msg,
    data.label,
    data.elements,
    data.foreign_dialog,
    data.link_dialog,
    data.cite_dialog,
  );
  if (data.options.no_format) {
    commentTb.elements.strong.type = '';
    commentTb.elements.em.type = '';
    commentTb.elements.ins.type = '';
    commentTb.elements.del.type = '';
    commentTb.elements.quote.type = '';
    commentTb.elements.code.type = '';
    commentTb.elements.foreign.type = '';
  }
  if (data.options.no_br) {
    commentTb.elements.br.type = '';
  }
  if (data.options.no_list) {
    commentTb.elements.ul.type = '';
    commentTb.elements.ol.type = '';
  }
  if (data.options.no_pre) {
    commentTb.elements.pre.type = '';
  }
  if (data.options.no_quote) {
    commentTb.elements.bquote.type = '';
  }
  if (data.options.no_url) {
    commentTb.elements.link.type = '';
  }
  commentTb.draw(data.mode);
});
