/*global dotclear */
'use strict';

dotclear?.ready(() => {
  const data = dotclear.getData('commentswikibar');

  if (!document.getElementById(data.id)) {
    return;
  }
  const comment_toolbar = new dotclear.wikibar.toolbar(
    document.getElementById(data.id),
    data.host,
    data.legend_msg,
    data.label,
    data.elements,
    {
      foreign: data.foreign_dialog,
      link: data.link_dialog,
      cite: data.cite_dialog,
    },
  );
  if (!comment_toolbar) {
    return;
  }
  if (data.options.no_format) {
    comment_toolbar.elements.strong = undefined;
    comment_toolbar.elements.em = undefined;
    comment_toolbar.elements.ins = undefined;
    comment_toolbar.elements.del = undefined;
    comment_toolbar.elements.quote = undefined;
    comment_toolbar.elements.code = undefined;
    comment_toolbar.elements.foreign = undefined;
  }
  if (data.options.no_br) {
    comment_toolbar.elements.br = undefined;
  }
  if (data.options.no_list) {
    comment_toolbar.elements.ul = undefined;
    comment_toolbar.elements.ol = undefined;
  }
  if (data.options.no_pre) {
    comment_toolbar.elements.pre = undefined;
  }
  if (data.options.no_quote) {
    comment_toolbar.elements.bquote = undefined;
  }
  if (data.options.no_url) {
    comment_toolbar.elements.link = undefined;
  }
  comment_toolbar.draw(data.mode);
});
