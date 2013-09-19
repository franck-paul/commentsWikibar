<?php
# -- BEGIN LICENSE BLOCK ----------------------------------
# This file is part of commentsWikibar, a plugin for Dotclear 2.
#
# Copyright (c) Pep, Franck Paul and contributors
# carnet.franck.paul@gmail.com
#
# Licensed under the GPL version 2.0 license.
# A copy of this license is available in LICENSE file or at
# http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
# -- END LICENSE BLOCK ------------------------------------

if (!defined('DC_RC_PATH')) { return; }

$core->addBehavior('publicHeadContent',  array('commentsWikibarBehaviors','publicHeadContent'));
$core->addBehavior('publicFooterContent',array('commentsWikibarBehaviors','publicFooterContent'));
$core->addBehavior('coreInitWikiComment',array('commentsWikibarBehaviors','coreInitWikiComment'));

class commentsWikibarBehaviors
{
	protected static function canActivate()
	{
		global $core;

		if ( $core->blog->settings->commentswikibar->commentswikibar_active &&
			$core->blog->settings->system->wiki_comments)
		{
			$supported_modes = new ArrayObject(array('post','pages','gal','galitem'));
			$core->callBehavior('initCommentsWikibar',$supported_modes);
			if (in_array($core->url->type,(array)$supported_modes)) {
				return true;
			}
		}
		return false;
	}

	public static function coreInitWikiComment($wiki2xhtml)
	{
		global $core;

		if (self::canActivate()) {
			if ($core->blog->settings->commentswikibar->commentswikibar_no_format) {
				$wiki2xhtml->setOpt('active_strong',0);
				$wiki2xhtml->setOpt('active_em',0);
				$wiki2xhtml->setOpt('active_ins',0);
				$wiki2xhtml->setOpt('active_del',0);
				$wiki2xhtml->setOpt('active_q',0);
				$wiki2xhtml->setOpt('active_code',0);
			}
			if ($core->blog->settings->commentswikibar->commentswikibar_no_br) {
				$wiki2xhtml->setOpt('active_br',0);
			}
			if ($core->blog->settings->commentswikibar->commentswikibar_no_list) {
				$wiki2xhtml->setOpt('active_lists',0);
			}
			if ($core->blog->settings->commentswikibar->commentswikibar_no_pre) {
				$wiki2xhtml->setOpt('active_pre',0);
			}
			if ($core->blog->settings->commentswikibar->commentswikibar_no_quote) {
				$wiki2xhtml->setOpt('active_quote',0);
			} else {
				if ($core->blog->settings->system->wiki_comments) {
					$wiki2xhtml->setOpt('active_quote',1);
				}
			}
			if ($core->blog->settings->commentswikibar->commentswikibar_no_url) {
				$wiki2xhtml->setOpt('active_urls',0);
			}
		}
	}

	public static function publicHeadContent()
	{
		global $core;

		if (self::canActivate()) {
			if ($core->blog->settings->commentswikibar->commentswikibar_add_css) {
				$custom_css = trim($core->blog->settings->commentswikibar->commentswikibar_custom_css);
				if (!empty($custom_css)) {
					if (strpos('/',$custom_css) === 0 || preg_match('!^http[s]?://.+!',$custom_css)) {
						$css = $custom_css;
					}
					else {
						$css =
							$core->blog->settings->system->themes_url."/".
							$core->blog->settings->system->theme."/".
							$custom_css;
					}
				}
				else {
					$css = html::stripHostURL($core->blog->getQmarkURL().'pf=commentsWikibar/wikibar.min.css');
				}
				echo '<link rel="stylesheet" type="text/css" media="screen" href="'.$css.'"/>';
			}
		}
	}

	public static function publicFooterContent()
	{
		global $core;

		if (self::canActivate()) {
			if ($core->blog->settings->commentswikibar->commentswikibar_add_jslib) {
				$custom_jslib = trim($core->blog->settings->commentswikibar->commentswikibar_custom_jslib);
				if (!empty($custom_jslib)) {
					if (strpos('/',$custom_jslib) === 0 || preg_match('!^http[s]?://.+!',$custom_jslib)) {
						$js = $custom_jslib;
					}
					else {
						$js =
							$core->blog->settings->system->themes_url."/".
							$core->blog->settings->system->theme."/".
							$custom_jslib;
					}
				}
				else {
					$js = html::stripHostURL($core->blog->getQmarkURL().'pf=commentsWikibar/wikibar.min.js');
				}
				echo '<script type="text/javascript" src="'.$js.'"></script>'."\n";
			}

			if ($core->blog->settings->commentswikibar->commentswikibar_add_jsglue) {
				echo
					'<script type="text/javascript">'."\n".
					"//<![CDATA[\n".
					"addListener(window,'load',function() {\n".
					"jsToolBar.prototype.base_url = '".html::escapeJS($core->blog->host)."'; \n".
					"jsToolBar.prototype.legend_msg = '".html::escapeJS(__('You can use the following shortcuts to format your text.'))."'; \n".
					"jsToolBar.prototype.elements.strong.title = '".html::escapeJS(__('Strong emphasis'))."'; \n".
					"jsToolBar.prototype.elements.em.title = '".html::escapeJS(__('Emphasis'))."'; \n".
					"jsToolBar.prototype.elements.ins.title = '".html::escapeJS(__('Inserted'))."'; \n".
					"jsToolBar.prototype.elements.del.title = '".html::escapeJS(__('Deleted'))."'; \n".
					"jsToolBar.prototype.elements.quote.title = '".html::escapeJS(__('Inline quote'))."'; \n".
					"jsToolBar.prototype.elements.code.title = '".html::escapeJS(__('Code'))."'; \n".
					"jsToolBar.prototype.elements.br.title = '".html::escapeJS(__('Line break'))."'; \n".
					"jsToolBar.prototype.elements.ul.title = '".html::escapeJS(__('Unordered list'))."'; \n".
					"jsToolBar.prototype.elements.ol.title = '".html::escapeJS(__('Ordered list'))."'; \n".
					"jsToolBar.prototype.elements.pre.title = '".html::escapeJS(__('Preformatted'))."'; \n".
					"jsToolBar.prototype.elements.bquote.title = '".html::escapeJS(__('Block quote'))."'; \n".
					"jsToolBar.prototype.elements.link.title = '".html::escapeJS(__('Link'))."'; \n".
					"jsToolBar.prototype.elements.link.href_prompt = '".html::escapeJS(__('URL?'))."'; \n".
					"jsToolBar.prototype.elements.link.hreflang_prompt = '".html::escapeJS(__('Language?'))."'; \n\n".
					"if (document.getElementById) { \n".
					"	if (document.getElementById('".html::escapeJS('c_content')."')) { \n".
					"		var commentTb = new jsToolBar(document.getElementById('".html::escapeJS('c_content')."')); \n".
					($core->blog->settings->commentswikibar->commentswikibar_no_format ?
						"		commentTb.elements.strong.type = \"\"; \n\n".
						"		commentTb.elements.em.type = \"\"; \n\n".
						"		commentTb.elements.ins.type = \"\"; \n\n".
						"		commentTb.elements.del.type = \"\"; \n\n".
						"		commentTb.elements.quote.type = \"\"; \n\n".
						"		commentTb.elements.code.type = \"\"; \n\n".
						"		commentTb.elements.space1.type = \"\"; \n\n" : '').
					($core->blog->settings->commentswikibar->commentswikibar_no_br ?
						"		commentTb.elements.br.type = \"\"; \n\n".
						"		commentTb.elements.space2.type = \"\"; \n\n" : '').
					($core->blog->settings->commentswikibar->commentswikibar_no_list ?
						"		commentTb.elements.ul.type = \"\"; \n\n".
						"		commentTb.elements.ol.type = \"\"; \n\n" : '').
					($core->blog->settings->commentswikibar->commentswikibar_no_pre ?
						"		commentTb.elements.pre.type = \"\"; \n\n" : '').
					($core->blog->settings->commentswikibar->commentswikibar_no_quote ?
						"		commentTb.elements.bquote.type = \"\"; \n\n" : '').
					($core->blog->settings->commentswikibar->commentswikibar_no_list &&
					 $core->blog->settings->commentswikibar->commentswikibar_no_pre &&
					 $core->blog->settings->commentswikibar->commentswikibar_no_quote ?
						"		commentTb.elements.space3.type = \"\"; \n\n" : '').
					($core->blog->settings->commentswikibar->commentswikibar_no_url ?
						"		commentTb.elements.link.type = \"\"; \n\n" : '').
					"		commentTb.draw(); \n".
					"	}\n".
					"}\n".
					"});\n".
					"\n//]]>\n".
					"</script>\n";
			}
		}
	}
}
?>