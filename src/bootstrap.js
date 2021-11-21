/*global dotclear */
'use strict';

window.addEventListener('load', () => {
  const data = dotclear.getData('commentswikibar');

  if (document.getElementById(data.id)) {
    const commentTb = new dotclear.jsToolBar(
      document.getElementById(data.id),
      data.host,
      data.legend_msg,
      data.label,
      data.elements,
    );
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
