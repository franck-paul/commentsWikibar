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

use Dotclear\App;
use Dotclear\Core\Backend\Notices;
use Dotclear\Core\Backend\Page;
use Dotclear\Core\Process;
use Dotclear\Helper\Html\Form\Checkbox;
use Dotclear\Helper\Html\Form\Div;
use Dotclear\Helper\Html\Form\Form;
use Dotclear\Helper\Html\Form\Input;
use Dotclear\Helper\Html\Form\Label;
use Dotclear\Helper\Html\Form\Para;
use Dotclear\Helper\Html\Form\Submit;
use Dotclear\Helper\Html\Form\Text;
use Dotclear\Helper\Html\Html;
use Exception;

class Manage extends Process
{
    /**
     * Initializes the page.
     */
    public static function init(): bool
    {
        return self::status(My::checkContext(My::MANAGE));
    }

    /**
     * Processes the request(s).
     */
    public static function process(): bool
    {
        if (!self::status()) {
            return false;
        }

        if (!empty($_POST['saveconfig'])) {
            try {
                $settings = My::settings();

                $active        = (empty($_POST['active'])) ? false : true;
                $no_format     = (empty($_POST['no_format'])) ? false : true;
                $no_br         = (empty($_POST['no_br'])) ? false : true;
                $no_list       = (empty($_POST['no_list'])) ? false : true;
                $no_pre        = (empty($_POST['no_pre'])) ? false : true;
                $no_quote      = (empty($_POST['no_quote'])) ? false : true;
                $no_url        = (empty($_POST['no_url'])) ? false : true;
                $wb_add_css    = (empty($_POST['wb_add_css'])) ? false : true;
                $wb_add_jslib  = (empty($_POST['wb_add_jslib'])) ? false : true;
                $wb_add_jsglue = (empty($_POST['wb_add_jsglue'])) ? false : true;
                $custom_css    = (empty($_POST['custom_css'])) ? '' : Html::sanitizeURL($_POST['custom_css']);
                $custom_jslib  = (empty($_POST['custom_jslib'])) ? '' : Html::sanitizeURL($_POST['custom_jslib']);

                $settings->put('active', $active, App::blogWorkspace()::NS_BOOL);
                $settings->put('no_format', $no_format, App::blogWorkspace()::NS_BOOL);
                $settings->put('no_br', $no_br, App::blogWorkspace()::NS_BOOL);
                $settings->put('no_list', $no_list, App::blogWorkspace()::NS_BOOL);
                $settings->put('no_pre', $no_pre, App::blogWorkspace()::NS_BOOL);
                $settings->put('no_quote', $no_quote, App::blogWorkspace()::NS_BOOL);
                $settings->put('no_url', $no_url, App::blogWorkspace()::NS_BOOL);
                $settings->put('add_css', $wb_add_css, App::blogWorkspace()::NS_BOOL);
                $settings->put('add_jslib', $wb_add_jslib, App::blogWorkspace()::NS_BOOL);
                $settings->put('add_jsglue', $wb_add_jsglue, App::blogWorkspace()::NS_BOOL);
                $settings->put('custom_css', $custom_css, App::blogWorkspace()::NS_STRING);
                $settings->put('custom_jslib', $custom_jslib, App::blogWorkspace()::NS_STRING);

                // Active wikibar enforces wiki syntax in blog comments
                $wiki_comments = (bool) App::blog()->settings()->system->wiki_comments;
                if ($active && !$wiki_comments) {
                    App::blog()->settings()->system->put('wiki_comments', true, App::blogWorkspace()::NS_BOOL);
                }
                App::blog()->triggerBlog();

                Notices::addSuccessNotice(__('Configuration successfully updated.'));
                My::redirect();
            } catch (Exception $e) {
                App::error()->add($e->getMessage());
            }
        }

        return true;
    }

    /**
     * Renders the page.
     */
    public static function render(): void
    {
        if (!self::status()) {
            return;
        }

        $settings = My::settings();

        // Getting current parameters
        $active        = (bool) $settings->active;
        $no_format     = (bool) $settings->no_format;
        $no_br         = (bool) $settings->no_br;
        $no_list       = (bool) $settings->no_list;
        $no_pre        = (bool) $settings->no_pre;
        $no_quote      = (bool) $settings->no_quote;
        $no_url        = (bool) $settings->no_url;
        $wb_add_css    = (bool) $settings->add_css;
        $wb_add_jslib  = (bool) $settings->add_jslib;
        $wb_add_jsglue = (bool) $settings->add_jsglue;
        $custom_css    = (string) $settings->custom_css;
        $custom_jslib  = (string) $settings->custom_jslib;

        Page::openModule(
            __('Comments Wikibar'),
            My::cssLoad('wikibar.css') .
            My::cssLoad('admin.css') .
            Page::jsPageTabs('')
        );

        echo Page::breadcrumb(
            [
                Html::escapeHTML(App::blog()->name()) => '',
                __('Comments Wikibar')                => '',
            ]
        );
        echo Notices::getNotices();

        // Form
        echo (new Form('options-form'))
            ->action(App::backend()->getPageURL())
            ->method('post')
            ->fields([
                // First tab (options)
                (new Div('wikibar_options'))
                    ->class('multi-part')
                    ->title(__('Plugin Activation'))
                    ->items([
                        (new Para())->items([
                            (new Checkbox('active', $active))
                                ->value(1)
                                ->label((new Label(__('Enable Comments Wikibar'), Label::INSIDE_TEXT_AFTER))),
                        ]),
                        (new Para())->class('form-note')->items([
                            (new Text(
                                null,
                                __('Activating this plugin also <strong>enforces</strong> Dotclear wiki syntax in blog comments') . '<br />' .
                                sprintf(
                                    __('It also <strong>enforces</strong> Markdown syntax if it\'s <a href="%s">enabled</a> for comments'),
                                    App::backend()->url()->get('admin.blog.pref') . '#params.legacy_markdown'
                                )
                            )),
                        ]),
                        (new Text('h3', __('Options'))),
                        (new Para())->items([
                            (new Checkbox('no_format', $no_format))
                                ->value(1)
                                ->label((new Label(__('Disable characters format'), Label::INSIDE_TEXT_AFTER))),
                            (new Para(null, 'span'))->class('jstElements')->extra('aria-hidden="true"')->items([
                                (new Para(null, 'button'))->disabled(true)->class('jstb_strong')->title(__('Strong emphasis'))
                                    ->items([(new Text('span', __('Strong emphasis')))->class('sr-only')]),
                                (new Para(null, 'button'))->disabled(true)->class('jstb_em')->title(__('Emphasis'))
                                    ->items([(new Text('span', __('Emphasis')))->class('sr-only')]),
                                (new Para(null, 'button'))->disabled(true)->class('jstb_ins')->title(__('Inserted'))
                                    ->items([(new Text('span', __('Inserted')))->class('sr-only')]),
                                (new Para(null, 'button'))->disabled(true)->class('jstb_del')->title(__('Deleted'))
                                    ->items([(new Text('span', __('Deleted')))->class('sr-only')]),
                                (new Para(null, 'button'))->disabled(true)->class('jstb_quote')->title(__('Inline quote'))
                                    ->items([(new Text('span', __('Inline quote')))->class('sr-only')]),
                                (new Para(null, 'button'))->disabled(true)->class('jstb_code')->title(__('Code'))
                                    ->items([(new Text('span', __('Code')))->class('sr-only')]),
                            ]),
                        ]),
                        (new Para())->items([
                            (new Checkbox('no_br', $no_br))
                                ->value(1)
                                ->label((new Label(__('Disable breakline'), Label::INSIDE_TEXT_AFTER))),
                            (new Para(null, 'span'))->class('jstElements')->extra('aria-hidden="true"')->items([
                                (new Para(null, 'button'))->disabled(true)->class('jstb_br')->title(__('Line break'))
                                    ->items([(new Text('span', __('Line break')))->class('sr-only')]),
                            ]),
                        ]),
                        (new Para())->items([
                            (new Checkbox('no_list', $no_list))
                                ->value(1)
                                ->label((new Label(__('Disable list'), Label::INSIDE_TEXT_AFTER))),
                            (new Para(null, 'span'))->class('jstElements')->extra('aria-hidden="true"')->items([
                                (new Para(null, 'button'))->disabled(true)->class('jstb_ul')->title(__('Unordered list'))
                                    ->items([(new Text('span', __('Unordered list')))->class('sr-only')]),
                                (new Para(null, 'button'))->disabled(true)->class('jstb_ol')->title(__('Ordered list'))
                                    ->items([(new Text('span', __('Ordered list')))->class('sr-only')]),
                            ]),
                        ]),
                        (new Para())->items([
                            (new Checkbox('no_pre', $no_pre))
                                ->value(1)
                                ->label((new Label(__('Disable preformatted text'), Label::INSIDE_TEXT_AFTER))),
                            (new Para(null, 'span'))->class('jstElements')->extra('aria-hidden="true"')->items([
                                (new Para(null, 'button'))->disabled(true)->class('jstb_pre')->title(__('Preformatted'))
                                    ->items([(new Text('span', __('Preformatted')))->class('sr-only')]),
                            ]),
                        ]),
                        (new Para())->items([
                            (new Checkbox('no_quote', $no_quote))
                                ->value(1)
                                ->label((new Label(__('Disable blockquote'), Label::INSIDE_TEXT_AFTER))),
                            (new Para(null, 'span'))->class('jstElements')->extra('aria-hidden="true"')->items([
                                (new Para(null, 'button'))->disabled(true)->class('jstb_bquote')->title(__('Block quote'))
                                    ->items([(new Text('span', __('Block quote')))->class('sr-only')]),
                            ]),
                        ]),
                        (new Para())->items([
                            (new Checkbox('no_url', $no_url))
                                ->value(1)
                                ->label((new Label(__('Disable link'), Label::INSIDE_TEXT_AFTER))),
                            (new Para(null, 'span'))->class('jstElements')->extra('aria-hidden="true"')->items([
                                (new Para(null, 'button'))->disabled(true)->class('jstb_link')->title(__('Link'))
                                    ->items([(new Text('span', __('Link')))->class('sr-only')]),
                            ]),
                        ]),
                    ]),

                // Second tab (options)
                (new Div('wikibar_advanced'))
                    ->class('multi-part')
                    ->title(__('Advanced Options'))
                    ->items([
                        (new Text('h3', __('CSS inclusion'))),
                        (new Para())->items([
                            (new Checkbox('wb_add_css', $wb_add_css))
                                ->value(1)
                                ->label((new Label(__('Include CSS') . ' ' . __('(recommended)'), Label::INSIDE_TEXT_AFTER))),
                        ]),
                        (new Para())->items([
                            (new Input('custom_css'))
                                ->size(40)
                                ->maxlength(128)
                                ->value($custom_css)
                                ->label((new Label(__('Use custom CSS:'), Label::OUTSIDE_TEXT_BEFORE))),
                        ]),
                        (new Para())->class('form-note')->items([
                            (new Text(
                                null,
                                __('You can use a custom CSS by providing its location.') . '<br />' .
                                __('A location beginning with a / is treated as absolute, else it is treated as relative to the blog\'s current theme URL'),
                            )),
                        ]),
                        (new Text('h3', __('Javascript inclusion'))),
                        (new Para())->items([
                            (new Checkbox('wb_add_jslib', $wb_add_jslib))
                                ->value(1)
                                ->label((new Label(__('Include JS library') . ' ' . __('(recommended)'), Label::INSIDE_TEXT_AFTER))),
                        ]),
                        (new Para())->items([
                            (new Input('custom_jslib'))
                                ->size(40)
                                ->maxlength(128)
                                ->value($custom_jslib)
                                ->label((new Label(__('Use custom JS library:'), Label::OUTSIDE_TEXT_BEFORE))),
                        ]),
                        (new Para())->class('form-note')->items([
                            (new Text(
                                null,
                                __('You can use a custom JS library by providing its location.') . '<br />' .
                                __('A location beginning with a / is treated as absolute, else it is treated as relative to the blog\'s current theme URL'),
                            )),
                        ]),
                        (new Para())->items([
                            (new Checkbox('wb_add_jsglue', $wb_add_jsglue))
                                ->value(1)
                                ->label((new Label(__('Include JS bootstrap') . ' ' . __('(recommended)'), Label::INSIDE_TEXT_AFTER))),
                        ]),
                    ]),

                // Actions
                (new Para())->items([
                    (new Submit(['saveconfig'], __('Save configuration')))
                        ->accesskey('s'),
                    ... My::hiddenFields(),
                ]),
            ])
            ->render();

        Page::closeModule();
    }
}
