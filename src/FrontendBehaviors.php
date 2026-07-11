<?php

/**
 * @brief commentsWikibar, a plugin for Dotclear 2
 *
 * @package Dotclear
 * @subpackage Plugins
 *
 * @author Franck Paul and contributors
 *
 * @copyright Franck Paul contact@open-time.net
 * @copyright GPL-2.0 https://www.gnu.org/licenses/gpl-2.0.html
 */
declare(strict_types=1);

namespace Dotclear\Plugin\commentsWikibar;

use ArrayObject;
use Dotclear\App;
use Dotclear\Helper\Html\Form\Input;
use Dotclear\Helper\Html\Form\Label;
use Dotclear\Helper\Html\Form\Option;
use Dotclear\Helper\Html\Form\Select;
use Dotclear\Helper\Html\Form\Url;
use Dotclear\Helper\Html\Html;
use Dotclear\Helper\Html\WikiToHtml;

class FrontendBehaviors
{
    protected static function canActivate(): bool
    {
        $settings = My::settings();
        if ($settings->getBool('active') && App::blog()->settings()->get('system')->getBool('wiki_comments')) {
            $supported_modes = new ArrayObject(['post', 'pages']);

            App::behavior()->callBehavior('initCommentsWikibar', $supported_modes);
            if (App::url()->isType($supported_modes->getArrayCopy())) {
                return true;
            }
        }

        return false;
    }

    public static function coreInitWikiComment(WikiToHtml $wiki): string
    {
        if (self::canActivate()) {
            $settings = My::settings();
            if ($settings->getBool('no_format')) {
                $wiki->setOpt('active_strong', 0);
                $wiki->setOpt('active_em', 0);
                $wiki->setOpt('active_ins', 0);
                $wiki->setOpt('active_del', 0);
                $wiki->setOpt('active_q', 0);
                $wiki->setOpt('active_code', 0);
                $wiki->setOpt('active_i', 0);
            }

            if ($settings->getBool('no_br')) {
                $wiki->setOpt('active_br', 0);
            }

            if ($settings->getBool('no_list')) {
                $wiki->setOpt('active_lists', 0);
            }

            if ($settings->getBool('no_pre')) {
                $wiki->setOpt('active_pre', 0);
            }

            if ($settings->getBool('no_quote')) {
                $wiki->setOpt('active_quote', 0);
            } elseif (App::blog()->settings()->get('system')->getBool('wiki_comments')) {
                $wiki->setOpt('active_quote', 1);
            }

            if ($settings->getBool('no_url')) {
                $wiki->setOpt('active_urls', 0);
            }
        }

        return '';
    }

    /**
     * publicHeadContent behavior helper
     *
     * @param  string $field Optional id of field
     */
    public static function publicHeadContentHelper(?string $field = 'c_content'): void
    {
        if (self::canActivate()) {
            $settings = My::settings();
            // CSS
            if ($settings->getBool('add_css')) {
                $css        = '';
                $custom_css = trim((string) $settings->getStr('custom_css', false));
                if ($custom_css !== '') {
                    $css_file = '';
                    if (str_starts_with($custom_css, '/') || preg_match('!^https?://.+!', $custom_css)) {
                        // Absolute URL
                        $css_file = $custom_css;
                    } else {
                        // Relative URL
                        $theme      = App::blog()->settings()->get('system')->getStr('theme', false);
                        $themes_url = App::blog()->settings()->get('system')->getStr('themes_url', false);
                        if ($theme !== '') {
                            $css_file = $themes_url . '/' . $theme . '/' . $custom_css;
                        }
                    }

                    if ($css_file !== '') {
                        $css = App::plugins()->cssLoad($css_file);
                    }
                } else {
                    $css = My::cssLoad('wikibar.css');
                }

                echo $css;
            }

            // JS
            if ($settings->getBool('add_jslib')) {
                $custom_jslib = trim((string) $settings->getStr('custom_jslib', false));
                $js           = '';
                if ($custom_jslib !== '') {
                    $js_file = '';
                    if (str_starts_with($custom_jslib, '/') || preg_match('!^https?://.+!', $custom_jslib)) {
                        $js_file = $custom_jslib;
                    } else {
                        $theme      = App::blog()->settings()->get('system')->getStr('theme', false);
                        $themes_url = App::blog()->settings()->get('system')->getStr('themes_url', false);
                        if ($theme !== '') {
                            $js_file = $themes_url . '/' . $theme . '/' . $custom_jslib;
                        }
                    }

                    if ($js_file !== '') {
                        $js = App::plugins()->jsLoad($js_file);
                    }
                } else {
                    $js = My::jsLoad('wikibar.js');
                }

                echo $js;
            }

            if ($settings->getBool('add_jsglue')) {
                $mode = 'wiki';
                // Formatting Markdown activated
                if (App::blog()->settings()->get('system')->getBool('markdown_comments')) {
                    $mode = 'markdown';
                }

                $language_options = [];
                $language_codes   = App::lang()->getISOcodes(true, true);
                foreach ($language_codes as $language_name => $language_code) {
                    $language_options[] = (new Option($language_name, $language_code))->lang($language_code);
                }

                $language_select = (new Select('language'))
                    ->items($language_options)
                    ->translate(false)
                    ->label(new Label(__('Language:'), Label::OL_TF))
                ->render();

                $href_input = (new Url('link_url'))
                    ->size(35)
                    ->maxlength(512)
                    ->required(true)
                    ->autocomplete('url')
                    ->translate(false)
                    ->label((new Label(__('URL:'), Label::OL_TF)))
                ->render();

                $title_input = (new Input('link_title'))
                    ->type('text')
                    ->size(35)
                    ->maxlength(512)
                    ->translate(false)
                    ->label((new Label(__('Title:'), Label::OL_TF)))
                ->render();

                // Add an empty choice
                array_unshift($language_options, (new Option('', '')));

                $hreflang_select = (new Select('link_language'))
                    ->items($language_options)
                    ->translate(false)
                    ->label(new Label(__('Language:'), Label::OL_TF))
                ->render();

                $citeurl_input = (new Url('cite_url'))
                    ->size(35)
                    ->maxlength(512)
                    ->autocomplete('url')
                    ->translate(false)
                    ->label((new Label(__('URL:'), Label::OL_TF)))
                ->render();

                $citelang_select = (new Select('cite_language'))
                    ->items($language_options)
                    ->translate(false)
                    ->label(new Label(__('Language:'), Label::OL_TF))
                ->render();

                echo
                Html::jsJson('commentswikibar', [
                    'base_url'   => App::blog()->host(),
                    'id'         => $field,
                    'mode'       => $mode,
                    'legend_msg' => __('You can use the following shortcuts to format your text.'),
                    'label'      => __('Text formatting'),
                    'elements'   => [
                        'strong'  => ['title' => __('Strong emphasis')],
                        'em'      => ['title' => __('Emphasis')],
                        'ins'     => ['title' => __('Inserted')],
                        'del'     => ['title' => __('Deleted')],
                        'quote'   => ['title' => __('Inline quote')],
                        'code'    => ['title' => __('Code')],
                        'foreign' => ['title' => __('Foreign text')],
                        'br'      => ['title' => __('Line break')],
                        'ul'      => ['title' => __('Unordered list')],
                        'ol'      => ['title' => __('Ordered list')],
                        'pre'     => ['title' => __('Preformatted')],
                        'bquote'  => ['title' => __('Block quote')],
                        'link'    => ['title' => __('Link')],
                    ],
                    'options' => [
                        'no_format' => $settings->getBool('no_format', false),
                        'no_br'     => $settings->getBool('no_br', false),
                        'no_list'   => $settings->getBool('no_list', false),
                        'no_pre'    => $settings->getBool('no_pre', false),
                        'no_quote'  => $settings->getBool('no_quote', false),
                        'no_url'    => $settings->getBool('no_url', false),
                    ],
                    'foreign_dialog' => [
                        'title'  => __('Foreign text'),
                        'ok'     => __('Ok'),
                        'cancel' => __('Cancel'),
                        'fields' => [
                            'language'     => $language_select,
                            'default_lang' => 'en',
                        ],
                    ],
                    'link_dialog' => [
                        'title'  => __('Link'),
                        'ok'     => __('Ok'),
                        'cancel' => __('Cancel'),
                        'fields' => [
                            'href'             => $href_input,
                            'default_href'     => '',
                            'title'            => $title_input,
                            'default_title'    => '',
                            'language'         => $hreflang_select,
                            'default_hreflang' => '',
                        ],
                    ],
                    'cite_dialog' => [
                        'title'  => __('Inline quote'),
                        'ok'     => __('Ok'),
                        'cancel' => __('Cancel'),
                        'fields' => [
                            'url'          => $citeurl_input,
                            'default_url'  => '',
                            'language'     => $citelang_select,
                            'default_lang' => '',
                        ],
                    ],
                ]) .
                My::jsLoad('bootstrap.js');
            }
        }
    }

    public static function publicHeadContent(): string
    {
        self::publicHeadContentHelper();

        return '';
    }
}
