'use strict';
// support of ARIA toolbar design pattern largely inspired from https://www.w3.org/TR/wai-aria-practices-1.1/examples/toolbar/toolbar.html

function addListener(b, a, c) {
    if (b.addEventListener) {
        b.addEventListener(a, c, false);
    } else {
        if (b.attachEvent) {
            b.attachEvent('on' + a, c);
        }
    }
}

function removeListener(b, a, c) {
    if (b.removeEventListener) {
        b.removeEventListener(a, c, false);
    } else {
        if (b.detachEvent) {
            b.detachEvent('on' + a, c);
        }
    }
}

function jsToolBar(b) {
    if (!document.createElement) {
        return;
    }
    if (!b) {
        return;
    }
    if ((typeof(document.selection) == 'undefined') && (typeof(b.setSelectionRange) == 'undefined')) {
        return;
    }

    this.textarea = b;

    this.editor = document.createElement('div');
    this.editor.className = 'jstEditor';

    this.textarea.parentNode.insertBefore(this.editor, this.textarea);
    this.editor.appendChild(this.textarea);

    this.toolbar = document.createElement('div');
    this.toolbar.className = 'jstElements';
    this.toolbar.setAttribute('role', 'toolbar');
    this.toolbar.setAttribute('aria-label', this.label);
    this.toolbar.setAttribute('aria-controls','c_content');
    this.editor.parentNode.insertBefore(this.toolbar, this.editor);

    this.handle = document.createElement('div');
    this.handle.className = 'jstHandle';
    var a = this.resizeDragStart;
    var c = this;
    addListener(this.handle, 'mousedown',
    function(d) {
        a.call(c, d);
    });
	// fix memory leak in Firefox (bug #241518)
    addListener(window, 'unload',
    function() {
        c.handle.parentNode.removeChild(c.handle);
        delete(c.handle);
    });
    this.editor.parentNode.insertBefore(this.handle, this.editor.nextSibling);
    this.context = null;
    this.toolNodes = {};
}
function jsButton(d, c, b, a) {
    this.title = d || null;
    this.fn = c ||
    function() {};
    this.scope = b || null;
    this.className = a || null;
}
jsButton.prototype.draw = function() {
    if (!this.scope) {
        return null;
    }
    var container = document.createElement('span');
    container.className = 'jsBtnContainer';    
    var a = document.createElement('button');
    container.appendChild(a);
    a.setAttribute('type', 'button');
    if (this.className) {
        a.className = this.className;
    }
    var b = document.createElement('div');
    b.setAttribute('id', a.className+'label');
    b.setAttribute('role', 'tooltip');
    b.className = 'sr-only';
    a.setAttribute('aria-labelledby', a.className+'label');    
    b.appendChild(document.createTextNode(this.title));
    container.appendChild(b);
    if (this.icon != undefined) {
        a.style.backgroundImage = 'url(" + this.icon + ")';
    }
    addListener(a, 'keydown', jsButton.prototype.keyDown);
    addListener(a, 'focus', jsButton.prototype.focus);
    addListener(a, 'blur', jsButton.prototype.blur);
    addListener(a, 'mouseover', jsButton.prototype.mouseOver);
    addListener(a, 'mouseleave', jsButton.prototype.mouseLeave);    
    if (typeof(this.fn) == 'function') {
        var c = this;
        a.onclick = function() {
            try {
                c.fn.apply(c.scope, arguments);
            } catch(d) {}
            return false;
        };
    }
    return container;
};
jsButton.prototype.keyDown = function (event) {
    var stopPropagation = false;
  
    switch (event.keyCode) {
      case 13: // ENTER
      case 32: // SPACE
        break;
      case 39: // RIGHT
        document.commentTb.moveFocus(this, 'next');
        stopPropagation = true;
        break;
      case 37: // LEFT
        document.commentTb.moveFocus(this, 'previous');
        stopPropagation = true;
        break;
      case 36: // HOME
        document.commentTb.setFocus(document.commentTb.firstItem);
        stopPropagation = true;
        break;
      case 35: // END
        document.commentTb.setFocus(document.commentTb.lastItem);
        stopPropagation = true;
        break;
      case 38: // UP
        document.commentTb.moveFocus(this, 'previous');
        stopPropagation = true;
        break;
      case 40: // DOWN
        document.commentTb.moveFocus(this, 'next');
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
jsButton.prototype.blur = function (event) {
    document.getElementById(event.target.className+'label').classList.add('sr-only');
    document.querySelector('.jstElements').classList.remove('focus');
};
jsButton.prototype.focus = function (event) {
    document.commentTb.hideAllTooltips();
    document.getElementById(event.target.className+'label').classList.remove('sr-only');
    document.querySelector('.jstElements').classList.add('focus');
};
jsButton.prototype.mouseLeave = function (event) {
    event.target.classList.remove('hovered');
    setTimeout(function() {
        if (!event.target.classList.contains('hovered')) {
            document.getElementById(event.target.className+'label').classList.add('sr-only');
        }
    }, 800);
};
jsButton.prototype.mouseOver = function (event) {
    document.commentTb.hideAllTooltips();
    document.getElementById(event.target.className+'label').classList.remove('sr-only');
    event.target.classList.add('hovered');
};
function jsSpace(a) {
    this.id = a || null;
    this.width = null;
}
jsSpace.prototype.draw = function() {
    var a = document.createElement('span');
    if (this.id) {
        a.id = this.id;
    }
    a.appendChild(document.createTextNode(String.fromCharCode(160)));
    a.setAttribute('aria-hidden', 'true');
    a.className = 'jstSpacer';
    if (this.width) {
        a.style.marginRight = this.width + 'px';
    }
    return a;
};
function jsCombo(e, a, d, c, b) {
    this.title = e || null;
    this.options = a || null;
    this.scope = d || null;
    this.fn = c ||
    function() {};
    this.className = b || null;
}
jsCombo.prototype.draw = function() {
    if (!this.scope || !this.options) {
        return null;
    }
    var a = document.createElement('select');
    if (this.className) {
        a.className = this.className;
    }
    a.title = this.title;
    for (var d in this.options) {
        var b = document.createElement('option');
        b.value = d;
        b.appendChild(document.createTextNode(this.options[d]));
        a.appendChild(b);
    }
    var c = this;
    a.onchange = function() {
        try {
            c.fn.call(c.scope, this.value);
        } catch(f) {
            window.alert(f);
        }
        return false;
    };
    return a;
};
jsToolBar.prototype = {
    base_url: '',
    mode: 'wiki',
    elements: {},
    getMode: function() {
        return this.mode;
    },
    setMode: function(a) {
        this.mode = a || 'wiki';
    },
    switchMode: function(a) {
        a = a || 'wiki';
        this.draw(a);
    },
    button: function(d) {
        var c = this.elements[d];
        if (typeof c.fn[this.mode] != 'function') {
            return null;
        }
        var a = new jsButton(c.title, c.fn[this.mode], this, 'jstb_' + d);
        if (c.icon != undefined) {
            a.icon = c.icon;
        }
        return a;
    },
    space: function(b) {
        var a = new jsSpace(b);
        if (this.elements[b].width !== undefined) {
            a.width = this.elements[b].width;
        }
        return a;
    },
    combo: function(f) {
        var b = this.elements[f];
        var e = b[this.mode].list.length;
        if (typeof b[this.mode].fn != 'function' || e == 0) {
            return null;
        } else {
            var a = {};
            for (var d = 0; d < e; d++) {
                var c = b[this.mode].list[d];
                a[c] = b.options[c];
            }
            return new jsCombo(b.title, a, this, b[this.mode].fn);
        }
    },
    draw: function(g) {
        this.setMode(g);
        while (this.toolbar.hasChildNodes()) {
            this.toolbar.removeChild(this.toolbar.firstChild);
        }
        this.toolNodes = {};
        var a,
        d,
        c;
        for (var e in this.elements) {
            a = this.elements[e];
            var f = a.type == undefined || a.type == '' || (a.disabled != undefined && a.disabled) || (a.context != undefined && a.context != null && a.context != this.context);
            if (!f && typeof this[a.type] == 'function') {
                d = this[a.type](e);
                if (d) {
                    c = d.draw();
                }
                if (c) {
                    this.toolNodes[e] = c;
                    this.toolbar.appendChild(c);
                }
            }
        }
        this.firstItem = document.querySelector('.jstElements .jsBtnContainer:first-child button');
        this.lastItem = document.querySelector('.jstElements .jsBtnContainer:last-child button');
        this.items = Array.from(document.querySelectorAll('.jstElements button'));
        this.initTabindex();
        addListener(document.body, 'keydown', jsToolBar.prototype.keyDown);
    },
    keyDown: function(event){
        if (event.keyCode == 27) { //ESC
            document.commentTb.hideAllTooltips();
            event.stopPropagation();
            event.preventDefault();
        }
    },
    singleTag: function(b, a) {
        b = b || null;
        a = a || b;
        if (!b || !a) {
            return;
        }
        this.encloseSelection(b, a);
    },
    encloseSelection: function(f, j, h) {
        this.textarea.focus();
        f = f || '';
        j = j || '';
        var a,
        d,
        c,
        b,
        i,
        g;
        if (typeof(document.selection) != 'undefined') {
            c = document.selection.createRange().text;
        } else {
            if (typeof(this.textarea.setSelectionRange) != 'undefined') {
                a = this.textarea.selectionStart;
                d = this.textarea.selectionEnd;
                b = this.textarea.scrollTop;
                c = this.textarea.value.substring(a, d);
            }
        }
        if (c.match(/ $/)) {
            c = c.substring(0, c.length - 1);
            j = j + ' ';
        }
        if (typeof(h) == 'function') {
            g = (c) ? h.call(this, c) : h('');
        } else {
            g = (c) ? c: '';
        }
        i = f + g + j;
        if (typeof(document.selection) != 'undefined') {
            document.selection.createRange().text = i;
            this.textarea.caretPos -= j.length;
        } else {
            if (typeof(this.textarea.setSelectionRange) != 'undefined') {
                this.textarea.value = this.textarea.value.substring(0, a) + i + this.textarea.value.substring(d);
                if (c) {
                    this.textarea.setSelectionRange(a + i.length, a + i.length);
                } else {
                    this.textarea.setSelectionRange(a + f.length, a + f.length);
                }
                this.textarea.scrollTop = b;
            }
        }
    },
    stripBaseURL: function(a) {
        if (this.base_url != '') {
            var b = a.indexOf(this.base_url);
            if (b == 0) {
                a = a.substr(this.base_url.length);
            }
        }
        return a;
    }
};
jsToolBar.prototype.initTabindex = function () {
    for (var i = 1; i < this.items.length; i++) {
        this.items[i].setAttribute('tabindex', '-1');
    }
    this.items[0].setAttribute('tabindex', '0');
};
jsToolBar.prototype.setFocus = function (item) {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].setAttribute('tabindex', '-1');
    }
    item.setAttribute('tabindex', '0');
    item.focus();
};
jsToolBar.prototype.moveFocus = function (currentItem, direction) {
    var newItem;

    if (direction == 'previous') {
            newItem = (currentItem === this.firstItem)?this.lastItem:this.items[this.items.indexOf(currentItem) - 1];
    } else {
            newItem = (currentItem === this.lastItem)?this.firstItem:this.items[this.items.indexOf(currentItem) + 1];
    }

    this.setFocus(newItem);
};
jsToolBar.prototype.hideAllTooltips = function () {
    Array.from(document.querySelectorAll('.jstElements [role=tooltip]')).forEach(element => {
        if (!element.classList.contains('sr-only')) {
            element.classList.add('sr-only');
        }
    });
};
jsToolBar.prototype.resizeSetStartH = function() {
    this.dragStartH = this.textarea.offsetHeight + 0;
};
jsToolBar.prototype.resizeDragStart = function(a) {
    var b = this;
    this.dragStartY = a.clientY;
    this.resizeSetStartH();
    addListener(document, 'mousemove', this.dragMoveHdlr = function(c) {
        b.resizeDragMove(c);
    });
    addListener(document, 'mouseup', this.dragStopHdlr = function(c) {
        b.resizeDragStop(c);
    });
};
jsToolBar.prototype.resizeDragMove = function(a) {
    this.textarea.style.height = (this.dragStartH + a.clientY - this.dragStartY) + 'px';
};
jsToolBar.prototype.resizeDragStop = function() {
    removeListener(document, 'mousemove', this.dragMoveHdlr);
    removeListener(document, 'mouseup', this.dragStopHdlr);
};
jsToolBar.prototype.elements.strong = {
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
jsToolBar.prototype.elements.em = {
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
jsToolBar.prototype.elements.ins = {
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
jsToolBar.prototype.elements.del = {
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
jsToolBar.prototype.elements.quote = {
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
jsToolBar.prototype.elements.code = {
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
jsToolBar.prototype.elements.space1 = {
    type: 'space'
};
jsToolBar.prototype.elements.br = {
	type: 'button',
	title: 'Line break',
	fn: {
		wiki: function() {
			this.encloseSelection('%%%'+'\n','');
		},
        markdown: function() {
            this.encloseSelection('  '+'\n','');
        }
	}
};
jsToolBar.prototype.elements.space2 = {
    type: 'space'
};
jsToolBar.prototype.elements.ul = {
    type: 'button',
    title: 'Unordered list',
    fn: {
        wiki: function() {
            this.encloseSelection('', '',
            function(a) {
                a = a.replace(/\r/g, '');
                return '* ' + a.replace(/\n/g, '\n* ');
            });
        },
        markdown: function() {
            this.encloseSelection('','',function(str) {
                str = str.replace(/\r/g,'');
                return '* '+str.replace(/\n/g,'\n* ');
            });
        }
    }
};
jsToolBar.prototype.elements.ol = {
    type: 'button',
    title: 'Ordered list',
    fn: {
        wiki: function() {
            this.encloseSelection('', '',
            function(a) {
                a = a.replace(/\r/g, '');
                return '# ' + a.replace(/\n/g, '\n# ');
            });
        },
        markdown: function() {
            this.encloseSelection('','',function(str) {
                str = str.replace(/\r/g,'');
                return '1. '+str.replace(/\n/g,'\n1. ');
            });
        }
    }
};
jsToolBar.prototype.elements.pre = {
	type: 'button',
	title: 'Preformatted',
	fn: {
		wiki: function() {
			this.encloseSelection('','',function(a) {
				a = a.replace(/\r/g,'');
				return ' '+a.replace(/\n/g,'\n ');
			});
		},
        markdown: function() {
            this.encloseSelection('\n','',
            function(str) {
                str = str.replace(/\r/g,'');
                return '    '+str.replace(/\n/g,'\n    ');
            });
        }
	}
};
jsToolBar.prototype.elements.bquote = {
	type: 'button',
	title: 'Block quote',
	fn: {
		wiki: function() {
			this.encloseSelection('','',function(a) {
				a = a.replace(/\r/g,'');
				return '> '+a.replace(/\n/g,'\n> ');
			});
		},
        markdown: function() {
            this.encloseSelection('\n','',
            function(str) {
                str = str.replace(/\r/g,'');
                return '> '+str.replace(/\n/g,'\n> ');
            });
        }
	}
};
jsToolBar.prototype.elements.space3 = {
    type: 'space'
};
jsToolBar.prototype.elements.link = {
    type: 'button',
    title: 'Link',
    fn: {},
    href_prompt: 'Please give page URL:',
    hreflang_prompt: 'Language of this page:',
    default_hreflang: '',
    prompt: function(b, a) {
        b = b || '';
        a = a || this.elements.link.default_hreflang;
        b = window.prompt(this.elements.link.href_prompt, b);
        if (!b) {
            return false;
        }
        a = window.prompt(this.elements.link.hreflang_prompt, a);
        return {
            href: this.stripBaseURL(b),
            hreflang: a
        };
    }
};
jsToolBar.prototype.elements.link.fn.wiki = function() {
    var b = this.elements.link.prompt.call(this);
    if (b) {
        var c = '[';
        var a = '|' + b.href;
        if (b.hreflang) {
            a = a + '|' + b.hreflang;
        }
        a = a + ']';
        this.encloseSelection(c, a);
    }
};
jsToolBar.prototype.elements.link.fn.markdown = function() {
    var link = this.elements.link.prompt.call(this);
    if (link) {
        var stag = '[';
        var etag = ']('+link.href;
        if (link.title) { etag = etag+' "+link.title+"'; }
        etag = etag+')';

        this.encloseSelection(stag,etag);
    }
};
