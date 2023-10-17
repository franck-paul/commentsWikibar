<?php
/**
 * @brief commentsWikibar, a plugin for Dotclear 2
 *
 * @package Dotclear
 * @subpackage Plugins
 *
 * @author Franck Paul and contributors
 *
 * @copyright Franck Paul carnet.franck.paul@gmail.com
 * @copyright GPL-2.0 https://www.gnu.org/licenses/gpl-2.0.html
 */
declare(strict_types=1);

namespace Dotclear\Plugin\commentsWikibar;

use ArrayObject;
use dcCore;
use dcUtils;
use Dotclear\Helper\Html\WikiToHtml;

class FrontendBehaviors
{
    protected static function canActivate(): bool
    {
        $settings = My::settings();
        if ($settings->active && dcCore::app()->blog->settings->system->wiki_comments) {
            $supported_modes = new ArrayObject(['post', 'pages', 'gal', 'galitem']);
            dcCore::app()->callBehavior('initCommentsWikibar', $supported_modes);
            if (in_array(dcCore::app()->url->type, (array) $supported_modes)) {
                return true;
            }
        }

        return false;
    }

    public static function coreInitWikiComment(WikiToHtml $wiki): string
    {
        if (self::canActivate()) {
            $settings = My::settings();
            if ($settings->no_format) {
                $wiki->setOpt('active_strong', 0);
                $wiki->setOpt('active_em', 0);
                $wiki->setOpt('active_ins', 0);
                $wiki->setOpt('active_del', 0);
                $wiki->setOpt('active_q', 0);
                $wiki->setOpt('active_code', 0);
            }
            if ($settings->no_br) {
                $wiki->setOpt('active_br', 0);
            }
            if ($settings->no_list) {
                $wiki->setOpt('active_lists', 0);
            }
            if ($settings->no_pre) {
                $wiki->setOpt('active_pre', 0);
            }
            if ($settings->no_quote) {
                $wiki->setOpt('active_quote', 0);
            } else {
                if (dcCore::app()->blog->settings->system->wiki_comments) {
                    $wiki->setOpt('active_quote', 1);
                }
            }
            if ($settings->no_url) {
                $wiki->setOpt('active_urls', 0);
            }
        }

        return '';
    }

    public static function publicHeadContent(): string
    {
        if (self::canActivate()) {
            $settings = My::settings();
            // CSS
            if ($settings->add_css) {
                $custom_css = trim((string) $settings->custom_css);
                if (!empty($custom_css)) {
                    if (str_starts_with($custom_css, '/') || preg_match('!^https?://.+!', $custom_css)) {
                        // Absolute URL
                        $css_file = $custom_css;
                    } else {
                        // Relative URL
                        $css_file = dcCore::app()->blog->settings->system->themes_url . '/' .
                        dcCore::app()->blog->settings->system->theme . '/' .
                            $custom_css;
                    }
                    $css = dcUtils::cssLoad($css_file);
                } else {
                    $css = My::cssLoad('wikibar.css');
                }
                echo $css;
            }
            // JS
            if ($settings->add_jslib) {
                $custom_jslib = trim((string) $settings->custom_jslib);
                if (!empty($custom_jslib)) {
                    if (str_starts_with($custom_jslib, '/') || preg_match('!^https?://.+!', $custom_jslib)) {
                        $js_file = $custom_jslib;
                    } else {
                        $js_file = dcCore::app()->blog->settings->system->themes_url . '/' .
                        dcCore::app()->blog->settings->system->theme . '/' .
                            $custom_jslib;
                    }
                    $js = dcUtils::jsLoad($js_file);
                } else {
                    $js = My::jsLoad('wikibar.js');
                }
                echo $js;
            }

            if ($settings->add_jsglue) {
                $mode = 'wiki';
                // Formatting Markdown activated
                if (dcCore::app()->blog->settings->system->markdown_comments) {
                    $mode = 'markdown';
                }
                echo
                dcUtils::jsJson('commentswikibar', [
                    'base_url'   => dcCore::app()->blog->host,
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
                        'no_format' => $settings->no_format,
                        'no_br'     => $settings->no_br,
                        'no_list'   => $settings->no_list,
                        'no_pre'    => $settings->no_pre,
                        'no_quote'  => $settings->no_quote,
                        'no_url'    => $settings->no_url,
                    ],
                ]) .
                My::jsLoad('bootstrap.js');
            }
        }

        return '';
    }
}
