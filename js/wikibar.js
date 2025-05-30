'use strict';
// support of ARIA toolbar design pattern largely inspired from https://www.w3.org/TR/wai-aria-practices-1.1/examples/toolbar/toolbar.html

/* Dotclear common object */
var dotclear = dotclear || {};

dotclear.resizeTimer = undefined;
dotclear.prevWidth = 0;

dotclear.jsButton = class {
  constructor(title, fn, scope, className) {
    this.title = title || null;
    this.fn = fn || (() => {});
    this.scope = scope || null;
    this.className = className || null;
    this.toolbarNode = null;
  }
  draw() {
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

    const icon = document.createElement('span');
    icon.className = 'jstb_icon';
    icon.addEventListener('mouseover', this.mouseOverChild);
    icon.addEventListener('mouseLeave', this.mouseLeaveChild);
    node.appendChild(icon);

    node.addEventListener('keydown', this.keyDown);
    node.addEventListener('focus', this.focus);
    node.addEventListener('blur', this.blur);
    node.addEventListener('mouseover', this.mouseOver);
    node.addEventListener('mouseleave', this.mouseLeave);
    if (typeof this.fn === 'function') {
      node.addEventListener('click', (event) => {
        try {
          this.fn.apply(this.scope, event);
        } catch (error) {}
        return false;
      });
    }
    return node;
  }
  keyDown(event) {
    let stopPropagation = false;

    switch (event.keyCode) {
      case 13: // ENTER
      case 32: // SPACE
        break;
      case 39: // RIGHT
      case 40: // DOWN
        this.toolbarNode.moveFocus(this, 'next');
        stopPropagation = true;
        break;
      case 37: // LEFT
      case 38: // UP
        this.toolbarNode.moveFocus(this, 'previous');
        stopPropagation = true;
        break;
      case 36: // HOME
        this.toolbarNode.firstItem.focus();
        stopPropagation = true;
        break;
      case 35: // END
        this.toolbarNode.lastItem.focus();
        stopPropagation = true;
        break;
      default:
        break;
    }
    if (stopPropagation) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
  blur(event) {
    event.target.firstChild.classList.add('sr-only');
    document.querySelector('.jstElements').classList.remove('focus');
  }
  focus(event) {
    this.toolbarNode.hideAllTooltips();
    event.target.firstChild.classList.remove('sr-only');
    document.querySelector('.jstElements').classList.add('focus');
  }
  mouseLeave(event) {
    if (event.target.nodeName === 'BUTTON') {
      event.target.classList.remove('hovered');
      setTimeout(() => {
        if (!event.target.classList.contains('hovered')) {
          event.target.firstChild.classList.add('sr-only');
        }
      }, 800);
    }
  }
  mouseLeaveChild(event) {
    if (event.target.nodeName === 'SPAN') {
      if (event.target.classList.contains('jstb_icon')) {
        const parent = event.target.parentNode;
        parent.classList.remove('hovered');
        setTimeout(() => {
          if (!parent.classList.contains('hovered')) {
            parent.firstChild.classList.add('sr-only');
          }
        }, 800);
      }
    }
  }
  mouseOver(event) {
    if (event.target.nodeName !== 'BUTTON') {
      return;
    }
    this.toolbarNode.hideAllTooltips();
    event.target.firstChild.classList.remove('sr-only');
    event.target.classList.add('hovered');
  }
  mouseOverChild(event) {
    if (event.target.nodeName === 'SPAN') {
      if (event.target.classList.contains('jstb_icon')) {
        const parent = event.target.parentNode;
        this.parentNode.toolbarNode.hideAllTooltips();
        parent.firstChild.classList.remove('sr-only');
        parent.classList.add('hovered');
      }
    }
  }
};

dotclear.jsSpace = class {
  constructor(id) {
    this.id = id || null;
    this.width = null;
  }
  draw() {
    const node = document.createElement('span');
    if (this.id) {
      node.id = this.id;
    }
    node.appendChild(document.createTextNode(String.fromCharCode(160)));
    node.setAttribute('aria-hidden', 'true');
    node.className = 'jstSpacer';
    if (this.width) {
      node.style.marginRight = `${this.width}px`;
    }
    return node;
  }
};

dotclear.jsCombo = class {
  constructor(title, options, scope, fn, className) {
    this.title = title || null;
    this.options = options || null;
    this.scope = scope || null;
    this.fn = fn || (() => {});
    this.className = className || null;
  }
  draw() {
    if (!this.scope || !this.options) {
      return null;
    }
    const node = document.createElement('select');
    if (this.className) {
      node.className = this.className;
    }
    node.title = this.title;
    for (const item in this.options) {
      const option = document.createElement('option');
      option.value = item;
      option.appendChild(document.createTextNode(this.options[item]));
      node.appendChild(option);
    }
    const combo = this;
    node.onchange = function () {
      try {
        combo.fn.call(combo.scope, this.value);
      } catch (error) {
        window.alert(error);
      }
      return false;
    };
    return node;
  }
};

dotclear.jsToolBar = class {
  constructor(target, base_url = '', mode = 'wiki', label = '', elts = null) {
    if (!document.createElement) {
      return;
    }
    if (!target) {
      return;
    }
    if (typeof document.selection === 'undefined' && typeof target.setSelectionRange === 'undefined') {
      return;
    }

    this.textarea = target;

    this.base_url = base_url;
    this.mode = mode;
    this.label = label;

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

    this.elements = {
      strong: {
        type: 'button',
        title: 'Strong emphasis',
        fn: {
          wiki() {
            this.singleTag('__');
          },
          markdown() {
            this.singleTag('**');
          },
        },
      },
      em: {
        type: 'button',
        title: 'Emphasis',
        fn: {
          wiki() {
            this.singleTag("''");
          },
          markdown() {
            this.singleTag('*');
          },
        },
      },
      ins: {
        type: 'button',
        title: 'Inserted',
        fn: {
          wiki() {
            this.singleTag('++');
          },
          markdown() {
            this.singleTag('<ins>', '</ins>');
          },
        },
      },
      del: {
        type: 'button',
        title: 'Deleted',
        fn: {
          wiki() {
            this.singleTag('--');
          },
          markdown() {
            this.singleTag('<del>', '</del>');
          },
        },
      },
      quote: {
        type: 'button',
        title: 'Inline quote',
        fn: {
          wiki() {
            this.singleTag('{{', '}}');
          },
          markdown() {
            this.singleTag('<q>', '</q>');
          },
        },
      },
      code: {
        type: 'button',
        title: 'Code',
        fn: {
          wiki() {
            this.singleTag('@@');
          },
          markdown() {
            this.singleTag('`');
          },
        },
      },
      foreign: {
        type: 'button',
        title: 'Foreign text',
        fn: {
          wiki() {
            const lang = this.elements.foreign.prompt.call(this);
            if (!lang.code) {
              return;
            }
            const stag = '££';
            const etag = `|${lang.code}££`;
            this.encloseSelection(stag, etag);
          },
          markdown() {
            const lang = this.elements.foreign.prompt.call(this);
            if (!lang.code) {
              return;
            }
            const stag = `<i lang="${lang.code}">`;
            const etag = '</i>';
            this.encloseSelection(stag, etag);
          },
        },
        lang_prompt: 'Language of this text:',
        default_lang: '',
        prompt(lang = '') {
          let language = lang || this.elements.foreign.default_lang;
          language = window.prompt(this.elements.foreign.lang_prompt, language);
          return {
            code: language,
          };
        },
      },
      br: {
        type: 'button',
        title: 'Line break',
        fn: {
          wiki() {
            this.encloseSelection('%%%\n', '');
          },
          markdown() {
            this.encloseSelection('  \n', '');
          },
        },
      },
      ul: {
        type: 'button',
        title: 'Unordered list',
        fn: {
          wiki() {
            this.encloseSelection('', '', (selection) => `* ${selection.replace(/\r/g, '').replace(/\n/g, '\n* ')}`);
          },
          markdown() {
            this.encloseSelection('', '', (selection) => `* ${selection.replace(/\r/g, '').replace(/\n/g, '\n* ')}`);
          },
        },
      },
      ol: {
        type: 'button',
        title: 'Ordered list',
        fn: {
          wiki() {
            this.encloseSelection('', '', (selection) => `# ${selection.replace(/\r/g, '').replace(/\n/g, '\n# ')}`);
          },
          markdown() {
            this.encloseSelection('', '', (selection) => `1. ${selection.replace(/\r/g, '').replace(/\n/g, '\n1. ')}`);
          },
        },
      },
      pre: {
        type: 'button',
        title: 'Preformatted',
        fn: {
          wiki() {
            this.encloseSelection('', '', (selection) => ` ${selection.replace(/\r/g, '').replace(/\n/g, '\n ')}`);
          },
          markdown() {
            this.encloseSelection('\n', '', (selection) => `    ${selection.replace(/\r/g, '').replace(/\n/g, '\n    ')}`);
          },
        },
      },
      bquote: {
        type: 'button',
        title: 'Block quote',
        fn: {
          wiki() {
            this.encloseSelection('', '', (selection) => `> ${selection.replace(/\r/g, '').replace(/\n/g, '\n> ')}`);
          },
          markdown() {
            this.encloseSelection('\n', '', (selection) => `> ${selection.replace(/\r/g, '').replace(/\n/g, '\n> ')}`);
          },
        },
      },
      link: {
        type: 'button',
        title: 'Link',
        fn: {
          wiki() {
            const link = this.elements.link.prompt.call(this);
            if (!link) {
              return;
            }
            const stag = '[';
            let etag = `|${link.href}`;
            if (link.hreflang) {
              etag = `${etag}|${link.hreflang}`;
            }
            etag = `${etag}]`;
            this.encloseSelection(stag, etag);
          },
          markdown() {
            const link = this.elements.link.prompt.call(this);
            if (!link) {
              return;
            }
            const stag = '[';
            let etag = `](${link.href}`;
            if (link.title) {
              etag = `${etag} "${link.title}"`;
            }
            etag = `${etag})`;

            this.encloseSelection(stag, etag);
          },
        },
        href_prompt: 'Please give page URL:',
        hreflang_prompt: 'Language of this page:',
        title_prompt: 'Title:',
        default_hreflang: '',
        default_title: '',
        prompt(url = '', lang = '', link_title = '') {
          let hreflang = lang || this.elements.link.default_hreflang;
          let title = link_title || this.elements.link.default_title;
          const href = window.prompt(this.elements.link.href_prompt, url);
          if (!href) {
            return null;
          }
          if (this.mode === 'markdown') {
            title = window.prompt(this.elements.link.title_prompt, title);
          } else {
            hreflang = window.prompt(this.elements.link.hreflang_prompt, hreflang);
          }
          return {
            href: this.stripBaseURL(href),
            hreflang,
            title,
          };
        },
      },
    };

    if (elts) {
      dotclear.mergeDeep(this.elements, elts);
    }

    window.addEventListener('resize', () => {
      if (dotclear.resizeTimer !== undefined) {
        clearTimeout(dotclear.resizeTimer);
      }
      dotclear.resizeTimer = setTimeout(() => {
        if (document.documentElement.clientWidth !== dotclear.prevWidth) {
          this.updateTooltipsPos();
          dotclear.prevWidth = document.documentElement.clientWidth;
        }
      }, 250);
    });
  }

  getMode() {
    return this.mode;
  }

  setMode(mode) {
    this.mode = mode || 'wiki';
  }

  switchMode(mode = 'wiki') {
    this.draw(mode);
  }

  button(id) {
    const elt = this.elements[id];
    if (typeof elt.fn[this.mode] !== 'function') {
      return null;
    }
    const btn = new dotclear.jsButton(elt.title, elt.fn[this.mode], this, `jstb_${id}`);
    return btn;
  }

  space(id) {
    const elt = new dotclear.jsSpace(id);
    if (this.elements[id].width !== undefined) {
      elt.width = this.elements[id].width;
    }
    return elt;
  }

  combo(id) {
    const select = this.elements[id];
    const len = select[this.mode].list.length;
    if (typeof select[this.mode].fn !== 'function' || len === 0) {
      return null;
    }
    const options = {};
    for (const elt of select[this.mode].list) {
      options[elt] = select.options[elt];
    }
    return new dotclear.jsCombo(select.title, options, this, select[this.mode].fn);
  }

  draw(mode) {
    this.setMode(mode);
    while (this.toolbar.hasChildNodes()) {
      this.toolbar.removeChild(this.toolbar.firstChild);
    }
    this.toolNodes = {};
    for (const elt in this.elements) {
      const btn = this.elements[elt];
      const ignore =
        btn.type === undefined ||
        btn.type === '' ||
        (btn.disabled !== undefined && btn.disabled) ||
        (btn.context !== undefined && btn.context != null && btn.context !== this.context);
      if (!ignore && typeof this[btn.type] === 'function') {
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
    this.updateTooltipsPos();
    document.body.addEventListener('keydown', this.keyDown.bind(this));
  }

  keyDown(event) {
    if (event.keyCode !== 27) {
      return;
    }
    //ESC
    this.hideAllTooltips();
    event.stopPropagation();
    event.preventDefault();
  }

  singleTag(stag = null, etag = stag) {
    if (!stag || !etag) {
      return;
    }
    this.encloseSelection(stag, etag);
  }

  encloseSelection(stag = '', etag = '', fn = null) {
    this.textarea.focus();
    let selstart;
    let selend;
    let selection;
    let position;
    let text;
    let enclosed;
    if (typeof document.selection !== 'undefined') {
      selection = document.selection.createRange().text;
    } else if (typeof this.textarea.setSelectionRange !== 'undefined') {
      selstart = this.textarea.selectionStart;
      selend = this.textarea.selectionEnd;
      position = this.textarea.scrollTop;
      selection = this.textarea.value.substring(selstart, selend);
    }
    let endtag = etag;
    if (selection.match(/ $/)) {
      selection = selection.substring(0, selection.length - 1);
      endtag += ' ';
    }
    if (typeof fn === 'function') {
      enclosed = selection ? fn.call(this, selection) : fn('');
    } else {
      enclosed = selection || '';
    }
    text = stag + enclosed + endtag;
    if (typeof document.selection !== 'undefined') {
      document.selection.createRange().text = text;
      this.textarea.caretPos -= etag.length;
    } else if (typeof this.textarea.setSelectionRange !== 'undefined') {
      this.textarea.value = this.textarea.value.substring(0, selstart) + text + this.textarea.value.substring(selend);
      if (selection) {
        this.textarea.setSelectionRange(selstart + text.length, selstart + text.length);
      } else {
        this.textarea.setSelectionRange(selstart + stag.length, selstart + stag.length);
      }
      this.textarea.scrollTop = position;
    }
  }

  stripBaseURL(url) {
    if (this.base_url !== '' && url.indexOf(this.base_url) === 0) {
      return url.substring(this.base_url.length);
    }
    return url;
  }

  moveFocus(currentItem, direction) {
    let newItem;
    if (direction === 'previous') {
      newItem = currentItem === this.firstItem ? this.lastItem : this.items[this.items.indexOf(currentItem) - 1];
    } else {
      newItem = currentItem === this.lastItem ? this.firstItem : this.items[this.items.indexOf(currentItem) + 1];
    }
    newItem.focus();
  }

  updateTooltipsPos() {
    for (const element of document.querySelectorAll('.jstElements button span')) {
      if (element.classList.contains('jstb_icon')) continue;
      // move to the left all tooltips that are too close from the right border of the viewport
      const currentPos = element.parentNode.getBoundingClientRect().left;
      element.style.left = '0px'; // we reset all positions

      // we need to switch between sr-only and hidden to be able to get the width of the tooltips
      element.classList.add('hidden');
      element.classList.remove('sr-only');
      const width = element.clientWidth;
      element.classList.add('sr-only');
      element.classList.remove('hidden');
      if (width + currentPos > document.documentElement.clientWidth - 15) {
        const diff = Math.trunc(-1 * (width + currentPos - document.documentElement.clientWidth + 15));
        element.style.left = `${diff}px`;
      }
    }
  }

  hideAllTooltips() {
    for (const element of document.querySelectorAll('.jstElements button span')) {
      if (element.classList.contains('jstb_icon')) continue;
      element.classList.add('sr-only');
    }
  }
};
