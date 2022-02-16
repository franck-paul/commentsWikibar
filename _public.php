<?php
/**
 * @brief commentsWikibar, a plugin for Dotclear 2
 *
 * @package Dotclear
 * @subpackage Plugins
 *
 * @author Pep, Franck Paul and contributors
 *
 * @copyright Pep
 * @copyright GPL-2.0 https://www.gnu.org/licenses/gpl-2.0.html
 */
if (!defined('DC_RC_PATH')) {
    return;
}

$core->addBehavior('publicHeadContent', ['commentsWikibarBehaviors', 'publicHeadContent']);
$core->addBehavior('coreInitWikiComment', ['commentsWikibarBehaviors', 'coreInitWikiComment']);

class commentsWikibarBehaviors
{
    protected static function canActivate()
    {
        global $core;

        if ($core->blog->settings->commentswikibar->commentswikibar_active && $core->blog->settings->system->wiki_comments) {
            $supported_modes = new ArrayObject(['post', 'pages', 'gal', 'galitem']);
            $core->callBehavior('initCommentsWikibar', $supported_modes);
            if (in_array($core->url->type, (array) $supported_modes)) {
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
                $wiki2xhtml->setOpt('active_strong', 0);
                $wiki2xhtml->setOpt('active_em', 0);
                $wiki2xhtml->setOpt('active_ins', 0);
                $wiki2xhtml->setOpt('active_del', 0);
                $wiki2xhtml->setOpt('active_q', 0);
                $wiki2xhtml->setOpt('active_code', 0);
            }
            if ($core->blog->settings->commentswikibar->commentswikibar_no_br) {
                $wiki2xhtml->setOpt('active_br', 0);
            }
            if ($core->blog->settings->commentswikibar->commentswikibar_no_list) {
                $wiki2xhtml->setOpt('active_lists', 0);
            }
            if ($core->blog->settings->commentswikibar->commentswikibar_no_pre) {
                $wiki2xhtml->setOpt('active_pre', 0);
            }
            if ($core->blog->settings->commentswikibar->commentswikibar_no_quote) {
                $wiki2xhtml->setOpt('active_quote', 0);
            } else {
                if ($core->blog->settings->system->wiki_comments) {
                    $wiki2xhtml->setOpt('active_quote', 1);
                }
            }
            if ($core->blog->settings->commentswikibar->commentswikibar_no_url) {
                $wiki2xhtml->setOpt('active_urls', 0);
            }
        }
    }

    public static function publicHeadContent()
    {
        global $core;

        if (self::canActivate()) {
            // CSS
            if ($core->blog->settings->commentswikibar->commentswikibar_add_css) {
                $custom_css = trim((string) $core->blog->settings->commentswikibar->commentswikibar_custom_css);
                if (!empty($custom_css)) {
                    if (strpos('/', $custom_css) === 0 || preg_match('!^http[s]?://.+!', $custom_css)) {
                        $css = $custom_css;
                    } else {
                        $css = $core->blog->settings->system->themes_url . '/' .
                        $core->blog->settings->system->theme . '/' .
                            $custom_css;
                    }
                } else {
                    $css = $core->blog->getPF('commentsWikibar/wikibar.min.css');
//                    $css = $core->blog->getPF('commentsWikibar/src/wikibar.css'); // FOR DEBUG PURPOSE
                }
                echo dcUtils::cssLoad($css);
            }
            // JS
            if ($core->blog->settings->commentswikibar->commentswikibar_add_jslib) {
                $custom_jslib = trim((string) $core->blog->settings->commentswikibar->commentswikibar_custom_jslib);
                if (!empty($custom_jslib)) {
                    if (strpos('/', $custom_jslib) === 0 || preg_match('!^http[s]?://.+!', $custom_jslib)) {
                        $js = $custom_jslib;
                    } else {
                        $js = $core->blog->settings->system->themes_url . '/' .
                        $core->blog->settings->system->theme . '/' .
                            $custom_jslib;
                    }
                } else {
                    $js = $core->blog->getPF('commentsWikibar/wikibar.min.js');
//                    $js = $core->blog->getPF('commentsWikibar/src/wikibar.js'); // FOR DEBUG PURPOSE
                }
                echo dcUtils::jsLoad($js);
            }

            if ($core->blog->settings->commentswikibar->commentswikibar_add_jsglue) {
                $mode = 'wiki';
                if ($core->plugins->moduleExists('formatting-markdown')) {
                    // Formatting Markdown activated
                    if ($core->blog->settings->system->markdown_comments) {
                        $mode = 'markdown';
                    }
                }
                echo
                dcUtils::jsJson('commentswikibar', [
                    'base_url'   => $core->blog->host,
                    'id'         => 'c_content',
                    'mode'       => $mode,
                    'legend_msg' => __('You can use the following shortcuts to format your text.'),
                    'label'      => __('Text formatting'),
                    'elements'   => [
                        'strong' => ['title' => __('Strong emphasis')],
                        'em'     => ['title' => __('Emphasis')],
                        'ins'    => ['title' => __('Inserted')],
                        'del'    => ['title' => __('Deleted')],
                        'quote'  => ['title' => __('Inline quote')],
                        'code'   => ['title' => __('Code')],
                        'br'     => ['title' => __('Line break')],
                        'ul'     => ['title' => __('Unordered list')],
                        'ol'     => ['title' => __('Ordered list')],
                        'pre'    => ['title' => __('Preformatted')],
                        'bquote' => ['title' => __('Block quote')],
                        'link'   => [
                            'title'           => __('Link'),
                            'href_prompt'     => __('URL?'),
                            'hreflang_prompt' => __('Language?'),
                            'title_prompt'    => __('Title?'),
                        ],
                    ],
                    'options' => [
                        'no_format' => $core->blog->settings->commentswikibar->commentswikibar_no_format,
                        'no_br'     => $core->blog->settings->commentswikibar->commentswikibar_no_br,
                        'no_list'   => $core->blog->settings->commentswikibar->commentswikibar_no_list,
                        'no_pre'    => $core->blog->settings->commentswikibar->commentswikibar_no_pre,
                        'no_quote'  => $core->blog->settings->commentswikibar->commentswikibar_no_quote,
                        'no_url'    => $core->blog->settings->commentswikibar->commentswikibar_no_url,
                    ],
                ]) .
                dcUtils::jsModuleLoad('commentsWikibar/bootstrap.min.js');
//                dcUtils::jsModuleLoad('commentsWikibar/src/bootstrap.js'); // FOR DEBUG PURPOSE
            }
        }
    }
}
