'use strict';
// support of ARIA toolbar design pattern largely inspired from https://www.w3.org/TR/wai-aria-practices-1.1/examples/toolbar/toolbar.html

/* Create dotclear global object if necessary */
if (window.dotclear === undefined) window.dotclear = {};

dotclear.wikibar = {
  resize_timer: undefined,
  previous_width: 0,
  component: {
    dialog: class {
      title;
      confirm_label;
      cancel_label;
      fields;
      constructor({ title, confirm_label, cancel_label, fields } = {}) {
        this.title = title;
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
        const title = this.title ? `<h1>${this.title}</h1>` : '';
        template.innerHTML = html`
          <dialog class="jstDialog">
            ${title}
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
          group: 'format',
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
          group: 'format',
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
          group: 'format',
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
          group: 'format',
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
          group: 'format',
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
              title: this.cite_dialog?.title || this.title,
              confirm_label: this.cite_dialog.ok,
              cancel_label: this.cite_dialog.cancel,
              fields: [
                {
                  // Quote URL input
                  default: this.cite_dialog.fields.default_url,
                  html: this.cite_dialog.fields.url,
                },
                {
                  // Language select
                  default: this.cite_dialog.fields.default_lang,
                  html: this.cite_dialog.fields.language,
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
          group: 'format',
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
          group: 'format',
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
              title: this.foreign_dialog?.title || this.title,
              confirm_label: this.foreign_dialog.ok,
              cancel_label: this.foreign_dialog.cancel,
              fields: [
                {
                  // Language select
                  default: this.foreign_dialog.fields.default_lang,
                  html: this.foreign_dialog.fields.language,
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
        br: {
          group: 'br',
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
          group: 'block',
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
          group: 'block',
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
          group: 'block',
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
          group: 'block',
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
          group: 'link',
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
              title: this.link_dialog?.title || this.title,
              confirm_label: this.link_dialog.ok,
              cancel_label: this.link_dialog.cancel,
              fields: [
                {
                  // Href input
                  default: this.link_dialog.fields.default_href,
                  html: this.link_dialog.fields.href,
                },
                {
                  // Title input
                  default: this.link_dialog.fields.default_title,
                  html: this.link_dialog.fields.title,
                },
                {
                  // Language (hreflang) select
                  default: this.link_dialog.fields.default_hreflang,
                  html: this.link_dialog.fields.language,
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

      // Empty toolbar
      while (this.toolbar.hasChildNodes()) {
        this.toolbar.removeChild(this.toolbar.firstChild);
      }
      this.toolNodes = {}; // vide les raccourcis DOM/**/

      // Draw toolbar elements
      let element;
      let tool;
      let newTool;
      let currentGroup;
      const groupTemplate = new DOMParser().parseFromString(`<div class="jstGroup"></div>`, 'text/html').body.firstChild;
      const groups = [];

      // Create a first group of elements
      currentGroup = groupTemplate.cloneNode(true);
      for (const name in this.elements) {
        element = this.elements[name];

        const disabled =
          element.type === undefined ||
          element.type === '' ||
          (element.disabled !== undefined && element.disabled) ||
          (element.context !== undefined && element.context != null && element.context !== this.context);

        if (!disabled && typeof this[element.type] === 'function') {
          newTool = false;
          const groupName = element?.group;
          tool = this[element.type](name);
          if (tool) {
            if (element.type !== 'space') {
              newTool = tool.draw();
              newTool.toolbar_node = this;
            } else {
              // Check if current group is not empty and if then add it to the list of groups
              if (currentGroup.childElementCount > 0) groups.push(currentGroup);
              // Then crate a new group
              currentGroup = groupTemplate.cloneNode(true);
            }
          }
          if (newTool) {
            this.toolNodes[name] = newTool; //mémorise l'accès DOM pour usage éventuel ultérieur ???

            // Search if a group with the same group name already exist
            for (const group of groups) {
              if (group.getAttribute('name') === `jstg_${groupName}`) {
                // Group found, add tool to it
                group.appendChild(newTool);
                newTool = false;
                break;
              }
            }

            // If gid not found in existing group, add to the current group
            if (newTool) {
              // Check if the current group already have a name and it's the same as the element
              if (currentGroup.getAttribute('name') !== null && currentGroup.getAttribute('name') !== `jstg_${groupName}`) {
                // Need to put element in another new group, store the current one
                groups.push(currentGroup);
                // Then crate a new group
                currentGroup = groupTemplate.cloneNode(true);
              }
              currentGroup.appendChild(newTool);
              if (groupName !== undefined && groupName !== '' && currentGroup.getAttribute('name') === null)
                currentGroup.setAttribute('name', `jstg_${groupName}`);
            }
          }
        }
      }

      // Check if last group is not empty and if then add it to the list of groups
      if (currentGroup.childElementCount > 0) groups.push(currentGroup);

      // Add all non empty group to toolbar
      for (const group of groups) {
        if (group.childElementCount > 0) this.toolbar.appendChild(group);
      }

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
