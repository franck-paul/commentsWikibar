'use strict';
// support of ARIA toolbar design pattern largely inspired from https://www.w3.org/TR/wai-aria-practices-1.1/examples/toolbar/toolbar.html

/* Create dotclear global object if necessary */
if (window.dotclear === undefined) window.dotclear = {};

dotclear.wikibar = {
  resize_timer: undefined,
  previous_width: 0,
  component: {
    dialog: class {
      confirmLabel;
      cancelLabel;
      fields;
      constructor({ confirm_label, cancel_label, fields } = {}) {
        this.confirm_label = confirm_label ?? 'Ok';
        this.cancel_label = cancel_label ?? 'Cancel';
        this.fields = fields;
      }
      prompt() {
        // 0. Check
        if (!this.fields?.length) return Promise.resolve(null);

        // 1. Create dialog HTML
        const template = document.createElement('template');
        const fields_html = this.fields.map((field) => `<p class="field">${field.html}</p>`).join('');
        const html = (strings, ...values) =>
          strings.reduce(
            (accumulator, currentValue, currentIndex) => accumulator + currentValue + (values[currentIndex] ?? ''),
            '',
          );
        template.innerHTML = html`
          <dialog class="jstDialog">
            <form method="dialog">
              ${fields_html}
              <p class="form-buttons">
                <button name="cancel" class="reset">${this.cancel_label}</button>
                <button type="submit" name="confirm" class="submit">${this.confirm_label}</button>
              </p>
            </form>
          </dialog>
        `;
        const dialog = template.content.firstElementChild;
        const fields = dialog.querySelectorAll('.field input, .field select');
        let index = 0;
        for (const field of fields) {
          if (this.fields[index]?.default) field.value = this.fields[index].default;
          index++;
        }

        // 2. Add dialog to body
        document.body.appendChild(dialog);

        const getReturnValue = () => JSON.stringify([...fields].map((field) => field.value));

        return new Promise((resolve) => {
          // 3. Add event listener to cope with dialog
          for (const field of fields) {
            field.addEventListener('keydown', (event) => {
              if (event.key !== 'Enter') {
                return;
              }
              event.preventDefault();
              dialog.returnValue = getReturnValue();
              dialog.close();
            });
          }

          // Cope with confirm button
          dialog.querySelector('button[name="confirm"]')?.addEventListener('click', (event) => {
            event.preventDefault();
            dialog.returnValue = getReturnValue();
            dialog.close();
          });

          // Cope with cancel button
          dialog.querySelector('button[name="cancel"]')?.addEventListener('click', () => {
            dialog.dispatchEvent(new Event('cancel'));
          });

          // Cope with dialog cancel event
          dialog.addEventListener('cancel', function onCancel(event) {
            event.preventDefault();
            dialog.removeEventListener('close', onCancel);
            dialog.returnValue = null;
            dialog.remove();
            resolve(null);
          });

          // Cope with dialog close event
          dialog.addEventListener('close', function onClose(event) {
            event.preventDefault();
            dialog.removeEventListener('close', onClose);
            const result = dialog.returnValue;
            dialog.remove();
            resolve(result);
          });

          // 4. Display dialog and give focus
          dialog.showModal();
          fields[0].focus();
        });
      }
    },
    button: class {
      title;
      fn;
      scope;
      className;
      toolbar_node = null;
      constructor(title, fn, scope, className) {
        this.title = title ?? '';
        this.fn = fn ?? (() => {});
        this.scope = scope;
        this.className = className ?? null;
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
              this.fn.call(this.scope, event);
            } catch (error) {
              console.log(error);
            }
          });
        }
        return node;
      }
      keyDown(event) {
        let stop_propagation = false;

        switch (event.code) {
          case 'Enter':
          case 'Space':
            break;
          case 'ArrowRight':
          case 'ArrowDown':
            this.toolbar_node.moveFocus(this, 'next');
            stop_propagation = true;
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            this.toolbar_node.moveFocus(this, 'previous');
            stop_propagation = true;
            break;
          case 'Home':
            this.toolbar_node.firstItem.focus();
            stop_propagation = true;
            break;
          case 'End':
            this.toolbar_node.lastItem.focus();
            stop_propagation = true;
            break;
          default:
            break;
        }
        if (stop_propagation) {
          event.stopPropagation();
          event.preventDefault();
        }
      }
      blur(event) {
        event.target.firstChild.classList.add('sr-only');
        document.querySelector('.jstElements').classList.remove('focus');
      }
      focus(event) {
        this.toolbar_node.hideAllTooltips();
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
        if (!(event.target.nodeName === 'SPAN' && event.target.classList.contains('jstb_icon'))) {
          return;
        }
        const parent = event.target.parentNode;
        parent.classList.remove('hovered');
        setTimeout(() => {
          if (!parent.classList.contains('hovered')) {
            parent.firstChild.classList.add('sr-only');
          }
        }, 800);
      }
      mouseOver(event) {
        if (event.target.nodeName !== 'BUTTON') {
          return;
        }
        this.toolbar_node.hideAllTooltips();
        event.target.firstChild.classList.remove('sr-only');
        event.target.classList.add('hovered');
      }
      mouseOverChild(event) {
        if (!(event.target.nodeName === 'SPAN' && event.target.classList.contains('jstb_icon'))) {
          return;
        }
        const parent = event.target.parentNode;
        this.parentNode.toolbar_node.hideAllTooltips();
        parent.firstChild.classList.remove('sr-only');
        parent.classList.add('hovered');
      }
    },
    space: class {
      id = null;
      width = null;
      constructor(id) {
        this.id = id ?? null;
      }
      draw() {
        const node = document.createElement('span');
        node.id = this.id ?? undefined;
        node.textContent = '\u00A0';
        node.setAttribute('aria-hidden', 'true');
        node.className = 'jstSpacer';
        if (this.width !== null) {
          node.style.marginRight = `${this.width}px`;
        }
        return node;
      }
    },
    combo: class {
      title;
      options;
      scope;
      fn;
      className;
      toolbar_node = null;
      constructor(title, options, scope, fn, className) {
        this.title = title ?? null;
        this.options = options;
        this.scope = scope;
        this.fn = fn ?? (() => {});
        this.className = className ?? null;
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
    },
  },
  toolbar: class {
    constructor(target, base_url = '', mode = 'wiki', label = '', elts = null, dialogs = {}) {
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

      this.foreign_dialog = dialogs?.foreign;
      this.link_dialog = dialogs?.link;
      this.cite_dialog = dialogs?.cite;

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
            async wiki() {
              await this.elements.quote.prompt.call(this, (response) => {
                let end_tag = '';
                if (response.lang) {
                  end_tag = `${end_tag}|${response.lang}`;
                }
                if (response.cite) {
                  if (!response.lang) {
                    end_tag = `${end_tag}|`;
                  }
                  end_tag = `${end_tag}|${response.cite}`;
                }
                end_tag = `${end_tag}}}`;
                this.encloseSelection('{{', end_tag);
              });
            },
            async markdown() {
              await this.elements.quote.prompt.call(this, (response) => {
                let start_tag = '<q';
                if (response.cite) {
                  start_tag = `${start_tag} cite="${response.cite}"`;
                }
                if (response.lang) {
                  start_tag = `${start_tag} lang="${response.lang}"`;
                }
                start_tag = `${start_tag}>`;

                this.encloseSelection(start_tag, '</q>');
              });
            },
          },
          async prompt(callback = null) {
            const dialog = new dotclear.wikibar.component.dialog({
              confirm_label: this.cite_dialog.ok,
              cancel_label: this.cite_dialog.cancel,
              fields: [
                {
                  // Quote URL input
                  default: this.cite_dialog.default_url,
                  html: this.cite_dialog.url,
                },
                {
                  // Language select
                  default: this.cite_dialog.default_lang,
                  html: this.cite_dialog.language,
                },
              ],
            });
            await dialog.prompt().then((choice) => {
              if (choice && callback) {
                const response = JSON.parse(choice);
                callback({
                  cite: this.stripBaseURL(response[0]),
                  lang: response[1],
                });

                return;
              }
              this.toolbar.querySelector('.jstb_quote').focus();
            });
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
            async wiki() {
              await this.elements.foreign.prompt.call(this, (response) => {
                this.encloseSelection('££', `|${response.lang}££`);
              });
            },
            async markdown() {
              await this.elements.foreign.prompt.call(this, (response) => {
                this.encloseSelection(`<i lang="${response.lang}">`, '</i>');
              });
            },
          },
          async prompt(callback = null) {
            const dialog = new dotclear.wikibar.component.dialog({
              confirm_label: this.foreign_dialog.ok,
              cancel_label: this.foreign_dialog.cancel,
              fields: [
                {
                  // Language select
                  default: this.foreign_dialog.default_lang,
                  html: this.foreign_dialog.language,
                },
              ],
            });
            await dialog.prompt().then((choice) => {
              if (choice && callback) {
                // We have a selected language
                const response = JSON.parse(choice);
                callback({
                  lang: response[0],
                });

                return;
              }
              this.toolbar.querySelector('.jstb_foreign').focus();
            });
          },
        },
        space_inline: {
          type: 'space',
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
        space_br: {
          type: 'space',
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
        space_list: {
          type: 'space',
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
        space_block: {
          type: 'space',
        },
        link: {
          type: 'button',
          title: 'Link',
          fn: {
            async wiki() {
              await this.elements.link.prompt.call(this, (response) => {
                if (!response) {
                  return;
                }
                const start_tag = '[';
                let end_tag = `|${response.href}`;
                if (response.hreflang) {
                  end_tag = `${end_tag}|${response.hreflang}`;
                }
                if (response.title) {
                  if (!response.hreflang) {
                    end_tag = `${end_tag}|`;
                  }
                  end_tag = `${end_tag}|${response.title}`;
                }
                end_tag = `${end_tag}]`;
                this.encloseSelection(start_tag, end_tag);
              });
            },
            async markdown() {
              await this.elements.link.prompt.call(this, (response) => {
                if (!response) {
                  return;
                }
                const start_tag = '[';
                let end_tag = `](${response.href}`;
                if (response.title) {
                  end_tag = `${end_tag} "${response.title}"`;
                }
                end_tag = `${end_tag})`;
                if (response.hreflang) {
                  end_tag = `${end_tag}{hreflang=${response.hreflang}}`;
                }
                this.encloseSelection(start_tag, end_tag);
              });
            },
          },
          async prompt(callback = null) {
            const dialog = new dotclear.wikibar.component.dialog({
              confirm_label: this.link_dialog.ok,
              cancel_label: this.link_dialog.cancel,
              fields: [
                {
                  // Href input
                  default: this.link_dialog.default_href,
                  html: this.link_dialog.href,
                },
                {
                  // Title input
                  default: this.link_dialog.default_title,
                  html: this.link_dialog.title,
                },
                {
                  // Language (hreflang) select
                  default: this.link_dialog.default_hreflang,
                  html: this.link_dialog.language,
                },
              ],
            });
            await dialog.prompt().then((choice) => {
              if (choice && callback) {
                const response = JSON.parse(choice);
                if (response[0]) {
                  // We have an URL
                  callback({
                    href: this.stripBaseURL(response[0]),
                    title: response[1],
                    hreflang: response[2],
                  });

                  return;
                }
              }
              this.toolbar.querySelector('.jstb_link').focus();
            });
          },
        },
      };

      if (elts) {
        dotclear.mergeDeep(this.elements, elts);
      }

      window.addEventListener('resize', () => {
        clearTimeout(dotclear.resize_timer);
        dotclear.resize_timer = setTimeout(() => {
          if (document.documentElement.clientWidth !== dotclear.wikibar.previous_width) {
            this.updateTooltipsPos();
            dotclear.wikibar.previous_width = document.documentElement.clientWidth;
          }
        }, 250);
      });
    }

    getMode() {
      return this.mode;
    }

    setMode(mode) {
      this.mode = mode ?? 'wiki';
    }

    switchMode(mode = 'wiki') {
      this.draw(mode);
    }

    button(id) {
      const element = this.elements[id];
      if (typeof element.fn[this.mode] !== 'function') {
        return null;
      }
      return new dotclear.wikibar.component.button(element.title, element.fn[this.mode], this, `jstb_${id}`);
    }

    space(id) {
      const element = new dotclear.wikibar.component.space(id);
      if (this.elements[id].width !== undefined) {
        element.width = this.elements[id].width;
      }
      return element;
    }

    combo(id) {
      const select = this.elements[id];
      if (typeof select[this.mode].fn !== 'function' || select[this.mode].list.length === 0) {
        return null;
      }
      const options = {};
      for (const element of select[this.mode].list) {
        options[element] = select.options[element];
      }
      return new dotclear.wikibar.component.combo(select.title, options, this, select[this.mode].fn);
    }

    draw(mode) {
      this.setMode(mode);
      while (this.toolbar.hasChildNodes()) {
        this.toolbar.removeChild(this.toolbar.firstChild);
      }
      let previous;
      let nodes = [];
      for (const element in this.elements) {
        const button = this.elements[element];
        const ignore =
          !button ||
          button.type === undefined ||
          button.type === '' ||
          (button.disabled !== undefined && button.disabled) ||
          (button.context !== undefined && button.context != null && button.context !== this.context);
        if (!ignore && typeof this[button.type] === 'function') {
          const element_instance = this[button.type](element);
          if (element_instance) {
            const node = element_instance.draw();
            if (node) {
              if (!(button.type === 'space' && previous?.type === 'space')) {
                // Do not repeat spaces
                nodes.push({
                  type: button.type,
                  node,
                });
                node.toolbar_node = this;
                previous = button;
              }
            }
          }
        }
      }

      if (nodes.length === 0) return;

      // Cleanup nodes (no space at beginning or at end)
      let index = 0;
      while (nodes.length > 0 && nodes[index].type === 'space') {
        nodes = nodes.slice(1);
      }
      index = nodes.length - 1;
      while (index >= 0 && index < nodes.length && nodes[index].type === 'space') {
        nodes = nodes.slice(0, -1);
        index--;
      }

      // Add remaining nodes
      for (const node of nodes) this.toolbar.appendChild(node.node);

      this.firstItem = document.querySelector('.jstElements button:first-child');
      this.lastItem = document.querySelector('.jstElements button:last-child');
      this.items = Array.from(document.querySelectorAll('.jstElements button'));
      this.updateTooltipsPos();
      document.body.addEventListener('keydown', this.keyDown.bind(this));
    }

    keyDown(event) {
      if (event.code !== 'Escape') {
        return;
      }
      this.hideAllTooltips();
    }

    singleTag(start_tag = null, end_tag = start_tag) {
      if (!start_tag || !end_tag) {
        return;
      }
      this.encloseSelection(start_tag, end_tag);
    }

    encloseSelection(start_tag = '', end_tag = '', fn = null) {
      this.textarea.focus();
      let selection_start;
      let selection_end;
      let selection;
      let position;
      let text;
      let enclosed;
      if (typeof document.selection !== 'undefined') {
        selection = document.selection.createRange().text;
      } else if (typeof this.textarea.setSelectionRange !== 'undefined') {
        selection_start = this.textarea.selectionStart;
        selection_end = this.textarea.selectionEnd;
        position = this.textarea.scrollTop;
        selection = this.textarea.value.substring(selection_start, selection_end);
      }
      let end_tag_final = end_tag;
      if (selection.match(/ $/)) {
        selection = selection.substring(0, selection.length - 1);
        end_tag_final += ' ';
      }
      if (typeof fn === 'function') {
        enclosed = selection ? fn.call(this, selection) : fn('');
      } else {
        enclosed = selection || '';
      }
      text = start_tag + enclosed + end_tag_final;
      if (typeof document.selection !== 'undefined') {
        document.selection.createRange().text = text;
        this.textarea.caretPos -= end_tag.length;
      } else if (typeof this.textarea.setSelectionRange !== 'undefined') {
        this.textarea.value =
          this.textarea.value.substring(0, selection_start) + text + this.textarea.value.substring(selection_end);
        if (enclosed.length) {
          this.textarea.setSelectionRange(selection_start + text.length, selection_start + text.length);
        } else {
          this.textarea.setSelectionRange(selection_start + start_tag.length, selection_start + start_tag.length);
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

    moveFocus(current_item, direction) {
      let newItem;
      if (direction === 'previous') {
        newItem = current_item === this.firstItem ? this.lastItem : this.items[this.items.indexOf(current_item) - 1];
      } else {
        newItem = current_item === this.lastItem ? this.firstItem : this.items[this.items.indexOf(current_item) + 1];
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
  },
};
