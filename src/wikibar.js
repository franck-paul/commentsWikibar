'use strict';
// support of ARIA toolbar design pattern largely inspired from https://www.w3.org/TR/wai-aria-practices-1.1/examples/toolbar/toolbar.html

/* Dotclear common object */
var dotclear = dotclear || {};

Object.assign(dotclear, {
  jsToolBar: function(target) {
    if (!document.createElement) {
      return;
    }
    if (!target) {
      return;
    }
    if ((typeof(document.selection) == 'undefined') && (typeof(target.setSelectionRange) == 'undefined')) {
      return;
    }

    this.textarea = target;

    this.editor = document.createElement('div');
    this.editor.className = 'jstEditor';

    this.textarea.parentNode.insertBefore(this.editor, this.textarea);
    this.editor.appendChild(this.textarea);

    this.toolbar = document.createElement('div');
    this.toolbar.className = 'jstElements';
    this.toolbar.setAttribute('role', 'toolbar');
    this.toolbar.setAttribute('aria-label', this.label);
    this.toolbar.setAttribute('aria-controls', 'c_content');
    this.editor.parentNode.insertBefore(this.toolbar, this.editor);

    this.context = null;
    this.toolNodes = {};
  },
  jsButton: function(title, fn, scope, className) {
    this.title = title || null;
    this.fn = fn || function() {};
    this.scope = scope || null;
    this.className = className || null;
    this.toolbarNode = null;
  },
  jsSpace: function(id) {
    this.id = id || null;
    this.width = null;
  },
  jsCombo: function(title, options, scope, fn, className) {
    this.title = title || null;
    this.options = options || null;
    this.scope = scope || null;
    this.fn = fn || function() {};
    this.className = className || null;
  },
  resizeTimer: undefined,
  prevWidth: 0
});

window.addEventListener('resize', function() {
  if (dotclear.resizeTimer !== undefined) {
    clearTimeout(dotclear.resizeTimer);
  }
  dotclear.resizeTimer = setTimeout(function() {
    if (document.documentElement.clientWidth !== dotclear.prevWidth) {
      dotclear.jsToolBar.prototype.updateTooltipsPos();
      dotclear.prevWidth = document.documentElement.clientWidth;
    }
  }, 250);
});

// jsToolBar properties and methods
dotclear.jsToolBar.prototype = {
  base_url: '',
  mode: 'wiki',
  elements: {},
  getMode: function() {
    return this.mode;
  },
  setMode: function(mode) {
    this.mode = mode || 'wiki';
  },
  switchMode: function(mode) {
    mode = mode || 'wiki';
    this.draw(mode);
  },
  button: function(id) {
    const elt = this.elements[id];
    if (typeof elt.fn[this.mode] != 'function') {
      return null;
    }
    const btn = new dotclear.jsButton(elt.title, elt.fn[this.mode], this, 'jstb_' + id);
    if (elt.icon != undefined) {
      btn.icon = elt.icon;
    }
    return btn;
  },
  space: function(id) {
    const elt = new dotclear.jsSpace(id);
    if (this.elements[id].width !== undefined) {
      elt.width = this.elements[id].width;
    }
    return elt;
  },
  combo: function(id) {
    const select = this.elements[id];
    const len = select[this.mode].list.length;
    if (typeof select[this.mode].fn != 'function' || len == 0) {
      return null;
    } else {
      let options = {};
      for (let i = 0; i < len; i++) {
        const elt = select[this.mode].list[i];
        options[elt] = select.options[elt];
      }
      return new dotclear.jsCombo(select.title, options, this, select[this.mode].fn);
    }
  },
  draw: function(mode) {
    this.setMode(mode);
    while (this.toolbar.hasChildNodes()) {
      this.toolbar.removeChild(this.toolbar.firstChild);
    }
    this.toolNodes = {};
    for (let elt in this.elements) {
      const btn = this.elements[elt];
      const ignore =
        btn.type == undefined || btn.type == '' ||
        (btn.disabled != undefined && btn.disabled) ||
        (btn.context != undefined && btn.context != null && btn.context != this.context);
      if (!ignore && typeof this[btn.type] == 'function') {
        const obj = this[btn.type](elt);
        if (obj) {
          const node = obj.draw();
          if (node) {
            this.toolNodes[elt] = node;
            this.toolbar.appendChild(node);
            node.toolbarNode = this;
          }
        }
      }
    }

    this.firstItem = document.querySelector('.jstElements button:first-child');
    this.lastItem = document.querySelector('.jstElements button:last-child');
    this.items = Array.from(document.querySelectorAll('.jstElements button'));
    this.initTabindex();
    this.updateTooltipsPos();
    document.body.addEventListener('keydown', this.keyDown.bind(this));
  },
  keyDown: function(event) {
    if (event.keyCode == 27) { //ESC
      this.hideAllTooltips();
      event.stopPropagation();
      event.preventDefault();
    }
  },
  singleTag: function(stag, etag) {
    stag = stag || null;
    etag = etag || stag;
    if (!stag || !etag) {
      return;
    }
    this.encloseSelection(stag, etag);
  },
  encloseSelection: function(stag, etag, fn) {
    this.textarea.focus();
    stag = stag || '';
    etag = etag || '';
    let selstart,
      selend,
      selection,
      position,
      text,
      enclosed;
    if (typeof(document.selection) != 'undefined') {
      selection = document.selection.createRange().text;
    } else {
      if (typeof(this.textarea.setSelectionRange) != 'undefined') {
        selstart = this.textarea.selectionStart;
        selend = this.textarea.selectionEnd;
        position = this.textarea.scrollTop;
        selection = this.textarea.value.substring(selstart, selend);
      }
    }
    if (selection.match(/ $/)) {
      selection = selection.substring(0, selection.length - 1);
      etag = etag + ' ';
    }
    if (typeof(fn) == 'function') {
      enclosed = (selection) ? fn.call(this, selection) : fn('');
    } else {
      enclosed = (selection) ? selection : '';
    }
    text = stag + enclosed + etag;
    if (typeof(document.selection) != 'undefined') {
      document.selection.createRange().text = text;
      this.textarea.caretPos -= etag.length;
    } else {
      if (typeof(this.textarea.setSelectionRange) != 'undefined') {
        this.textarea.value = this.textarea.value.substring(0, selstart) + text + this.textarea.value.substring(selend);
        if (selection) {
          this.textarea.setSelectionRange(selstart + text.length, selstart + text.length);
        } else {
          this.textarea.setSelectionRange(selstart + stag.length, selstart + stag.length);
        }
        this.textarea.scrollTop = position;
      }
    }
  },
  stripBaseURL: function(url) {
    if (this.base_url != '') {
      if (url.indexOf(this.base_url) == 0) {
        url = url.substr(this.base_url.length);
      }
    }
    return url;
  }
};
dotclear.jsToolBar.prototype.initTabindex = function() {
  for (let i = 1; i < this.items.length; i++) {
    this.items[i].setAttribute('tabindex', '-1');
  }
  this.items[0].setAttribute('tabindex', '0');
};
dotclear.jsToolBar.prototype.setFocus = function(item) {
  for (let i = 0; i < this.items.length; i++) {
    this.items[i].setAttribute('tabindex', '-1');
  }
  item.setAttribute('tabindex', '0');
  item.focus();
};
dotclear.jsToolBar.prototype.moveFocus = function(currentItem, direction) {
  let newItem;
  if (direction == 'previous') {
    newItem = (currentItem === this.firstItem) ? this.lastItem : this.items[this.items.indexOf(currentItem) - 1];
  } else {
    newItem = (currentItem === this.lastItem) ? this.firstItem : this.items[this.items.indexOf(currentItem) + 1];
  }
  this.setFocus(newItem);
};
dotclear.jsToolBar.prototype.updateTooltipsPos = function() {
  Array.from(document.querySelectorAll('.jstElements button span')).forEach(function(elt) {
    // move to the left all tooltips that are too close from the right border of the viewport
    const currentPos = elt.parentNode.getBoundingClientRect().left;
    elt.style.left = '0px'; // we reset all positions
    // we need to switch between sr-only and hidden to be able to get the width of the tooltips
    elt.classList.add('hidden');
    elt.classList.remove('sr-only');
    const width = elt.clientWidth;
    elt.classList.add('sr-only');
    elt.classList.remove('hidden');
    if ((width + currentPos) > (document.documentElement.clientWidth - 15)) {
      const diff = Math.trunc(-1 * (width + currentPos - document.documentElement.clientWidth + 15));
      elt.style.left = diff + 'px';
    }
  });
};
dotclear.jsToolBar.prototype.hideAllTooltips = function() {
  Array.from(document.querySelectorAll('.jstElements button span')).forEach(element => {
    element.classList.add('sr-only');
  });
};

// jsButton properties and methods
dotclear.jsButton.prototype.draw = function() {
  if (!this.scope) {
    return null;
  }
  const node = document.createElement('button');
  node.setAttribute('type', 'button');
  if (this.className) {
    node.className = this.className;
  }
  const label = document.createElement('span');
  label.className = 'sr-only';
  label.appendChild(document.createTextNode(this.title));
  node.appendChild(label);

  if (this.icon != undefined) {
    node.style.backgroundImage = 'url(" + this.icon + ")';
  }
  node.addEventListener('keydown', dotclear.jsButton.prototype.keyDown);
  node.addEventListener('focus', dotclear.jsButton.prototype.focus);
  node.addEventListener('blur', dotclear.jsButton.prototype.blur);
  node.addEventListener('mouseover', dotclear.jsButton.prototype.mouseOver);
  node.addEventListener('mouseleave', dotclear.jsButton.prototype.mouseLeave);
  if (typeof(this.fn) == 'function') {
    node.onclick = () => {
      try {
        this.fn.apply(this.scope, arguments);
      } catch (error) {}
      return false;
    };
  }
  return node;
};
dotclear.jsButton.prototype.keyDown = function(event) {
  let stopPropagation = false;

  switch (event.keyCode) {
    case 13: // ENTER
    case 32: // SPACE
      break;
    case 39: // RIGHT
      this.toolbarNode.moveFocus(this, 'next');
      stopPropagation = true;
      break;
    case 37: // LEFT
      this.toolbarNode.moveFocus(this, 'previous');
      stopPropagation = true;
      break;
    case 36: // HOME
      this.toolbarNode.setFocus(this.toolbarNode.firstItem);
      stopPropagation = true;
      break;
    case 35: // END
      this.toolbarNode.setFocus(this.toolbarNode.lastItem);
      stopPropagation = true;
      break;
    case 38: // UP
      this.toolbarNode.moveFocus(this, 'previous');
      stopPropagation = true;
      break;
    case 40: // DOWN
      this.toolbarNode.moveFocus(this, 'next');
      stopPropagation = true;
      break;
    default:
      break;
  }
  if (stopPropagation) {
    event.stopPropagation();
    event.preventDefault();
  }
};
dotclear.jsButton.prototype.blur = function(event) {
  event.target.firstChild.classList.add('sr-only');
  document.querySelector('.jstElements').classList.remove('focus');
};
dotclear.jsButton.prototype.focus = function(event) {
  this.toolbarNode.hideAllTooltips();
  event.target.firstChild.classList.remove('sr-only');
  document.querySelector('.jstElements').classList.add('focus');
};
dotclear.jsButton.prototype.mouseLeave = function(event) {
  if (event.target.nodeName === "BUTTON") {
    event.target.classList.remove('hovered');
    setTimeout(function() {
      if (!event.target.classList.contains('hovered')) {
        event.target.firstChild.classList.add('sr-only');
      }
    }, 800);
  }
};
dotclear.jsButton.prototype.mouseOver = function(event) {
  if (event.target.nodeName === "BUTTON") {
    this.toolbarNode.hideAllTooltips();
    event.target.firstChild.classList.remove('sr-only');
    event.target.classList.add('hovered');
  }
};

// jsSpace properties and methods
dotclear.jsSpace.prototype.draw = function() {
  const node = document.createElement('span');
  if (this.id) {
    node.id = this.id;
  }
  node.appendChild(document.createTextNode(String.fromCharCode(160)));
  node.setAttribute('aria-hidden', 'true');
  node.className = 'jstSpacer';
  if (this.width) {
    node.style.marginRight = this.width + 'px';
  }
  return node;
};

// jsCombo properties and methods
dotclear.jsCombo.prototype.draw = function() {
  if (!this.scope || !this.options) {
    return null;
  }
  const node = document.createElement('select');
  if (this.className) {
    node.className = this.className;
  }
  node.title = this.title;
  for (let item in this.options) {
    const option = document.createElement('option');
    option.value = item;
    option.appendChild(document.createTextNode(this.options[item]));
    node.appendChild(option);
  }
  let combo = this;
  node.onchange = function() {
    try {
      combo.fn.call(combo.scope, this.value);
    } catch (error) {
      window.alert(error);
    }
    return false;
  };
  return node;
};

// Tootbar elements
dotclear.jsToolBar.prototype.elements.strong = {
  type: 'button',
  title: 'Strong emphasis',
  fn: {
    wiki: function() {
      this.singleTag('__');
    },
    markdown: function() {
      this.singleTag('**');
    }
  }
};
dotclear.jsToolBar.prototype.elements.em = {
  type: 'button',
  title: 'Emphasis',
  fn: {
    wiki: function() {
      this.singleTag('\'\'');
    },
    markdown: function() {
      this.singleTag('*');
    }
  }
};
dotclear.jsToolBar.prototype.elements.ins = {
  type: 'button',
  title: 'Inserted',
  fn: {
    wiki: function() {
      this.singleTag('++');
    },
    markdown: function() {
      this.singleTag('<ins>', '</ins>');
    }
  }
};
dotclear.jsToolBar.prototype.elements.del = {
  type: 'button',
  title: 'Deleted',
  fn: {
    wiki: function() {
      this.singleTag('--');
    },
    markdown: function() {
      this.singleTag('<del>', '</del>');
    }
  }
};
dotclear.jsToolBar.prototype.elements.quote = {
  type: 'button',
  title: 'Inline quote',
  fn: {
    wiki: function() {
      this.singleTag('{{', '}}');
    },
    markdown: function() {
      this.singleTag('<q>', '</q>');
    }
  }
};
dotclear.jsToolBar.prototype.elements.code = {
  type: 'button',
  title: 'Code',
  fn: {
    wiki: function() {
      this.singleTag('@@');
    },
    markdown: function() {
      this.singleTag('`');
    }
  }
};
dotclear.jsToolBar.prototype.elements.space1 = {
  type: 'space'
};
dotclear.jsToolBar.prototype.elements.br = {
  type: 'button',
  title: 'Line break',
  fn: {
    wiki: function() {
      this.encloseSelection('%%%' + '\n', '');
    },
    markdown: function() {
      this.encloseSelection('  ' + '\n', '');
    }
  }
};
dotclear.jsToolBar.prototype.elements.space2 = {
  type: 'space'
};
dotclear.jsToolBar.prototype.elements.ul = {
  type: 'button',
  title: 'Unordered list',
  fn: {
    wiki: function() {
      this.encloseSelection('', '', (selection) => {
        selection = selection.replace(/\r/g, '');
        return '* ' + selection.replace(/\n/g, '\n* ');
      });
    },
    markdown: function() {
      this.encloseSelection('', '', (selection) => {
        selection = selection.replace(/\r/g, '');
        return '* ' + selection.replace(/\n/g, '\n* ');
      });
    }
  }
};
dotclear.jsToolBar.prototype.elements.ol = {
  type: 'button',
  title: 'Ordered list',
  fn: {
    wiki: function() {
      this.encloseSelection('', '', (selection) => {
        selection = selection.replace(/\r/g, '');
        return '# ' + selection.replace(/\n/g, '\n# ');
      });
    },
    markdown: function() {
      this.encloseSelection('', '', (selection) => {
        selection = selection.replace(/\r/g, '');
        return '1. ' + selection.replace(/\n/g, '\n1. ');
      });
    }
  }
};
dotclear.jsToolBar.prototype.elements.pre = {
  type: 'button',
  title: 'Preformatted',
  fn: {
    wiki: function() {
      this.encloseSelection('', '', (selection) => {
        selection = selection.replace(/\r/g, '');
        return ' ' + selection.replace(/\n/g, '\n ');
      });
    },
    markdown: function() {
      this.encloseSelection('\n', '', (selection) => {
        selection = selection.replace(/\r/g, '');
        return '    ' + selection.replace(/\n/g, '\n    ');
      });
    }
  }
};
dotclear.jsToolBar.prototype.elements.bquote = {
  type: 'button',
  title: 'Block quote',
  fn: {
    wiki: function() {
      this.encloseSelection('', '', (selection) => {
        selection = selection.replace(/\r/g, '');
        return '> ' + selection.replace(/\n/g, '\n> ');
      });
    },
    markdown: function() {
      this.encloseSelection('\n', '', (selection) => {
        selection = selection.replace(/\r/g, '');
        return '> ' + selection.replace(/\n/g, '\n> ');
      });
    }
  }
};
dotclear.jsToolBar.prototype.elements.space3 = {
  type: 'space'
};
dotclear.jsToolBar.prototype.elements.link = {
  type: 'button',
  title: 'Link',
  fn: {},
  href_prompt: 'Please give page URL:',
  hreflang_prompt: 'Language of this page:',
  title_prompt: 'Title:',
  default_hreflang: '',
  default_title: '',
  prompt: function(url, lang, link_title) {
    url = url || '';
    lang = lang || this.elements.link.default_hreflang;
    link_title = link_title || this.elements.link.default_title;
    url = window.prompt(this.elements.link.href_prompt, url);
    if (!url) {
      return false;
    }
    if (this.mode !== 'markdown') {
      lang = window.prompt(this.elements.link.hreflang_prompt, lang);
    } else {
      link_title = window.prompt(this.elements.link.title_prompt, link_title);
    }
    return {
      href: this.stripBaseURL(url),
      hreflang: lang,
      title: link_title
    };
  }
};
dotclear.jsToolBar.prototype.elements.link.fn.wiki = function() {
  const link = this.elements.link.prompt.call(this);
  if (link) {
    let stag = '[';
    let etag = '|' + link.href;
    if (link.hreflang) {
      etag = etag + '|' + link.hreflang;
    }
    etag = etag + ']';
    this.encloseSelection(stag, etag);
  }
};
dotclear.jsToolBar.prototype.elements.link.fn.markdown = function() {
  const link = this.elements.link.prompt.call(this);
  if (link) {
    let stag = '[';
    let etag = '](' + link.href;
    if (link.title) {
      etag = etag + ' "' + link.title + '"';
    }
    etag = etag + ')';

    this.encloseSelection(stag, etag);
  }
};
