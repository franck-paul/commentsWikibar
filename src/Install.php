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
use Dotclear\Helper\Process\TraitProcess;
use Dotclear\Interface\Core\BlogWorkspaceInterface;
use Exception;

class Install
{
    use TraitProcess;

    public static function init(): bool
    {
        return self::status(My::checkContext(My::INSTALL));
    }

    public static function process(): bool
    {
        if (!self::status()) {
            return false;
        }

        try {
            // Update
            $old_version = App::version()->getVersion(My::id());
            if (version_compare((string) $old_version, '3.0', '<')) {
                // Rename settings namespace
                if (App::blog()->settings()->exists('commentswikibar')) {
                    App::blog()->settings()->delWorkspace(My::id());
                    App::blog()->settings()->renWorkspace('commentswikibar', My::id());
                }

                // Change settings names (remove commentswikibar_ prefix in them)
                $rename = static function (string $name, BlogWorkspaceInterface $settings): void {
                    if ($settings->settingExists('commentswikibar_' . $name, true)) {
                        $settings->rename('commentswikibar_' . $name, $name);
                    }
                };

                $settings = My::settings();

                foreach ([
                    'active',
                    'no_format',
                    'no_br',
                    'no_list',
                    'no_pre',
                    'no_quote',
                    'no_url',
                    'add_css',
                    'add_jslib',
                    'add_jsglue',
                    'custom_css',
                    'custom_jslib',
                ] as $value) {
                    $rename($value, $settings);
                }
            }

            // Init
            $settings = My::settings();

            $settings->put('active', false, App::blogWorkspace()::NS_BOOL, '', false, true);
            $settings->put('no_format', false, App::blogWorkspace()::NS_BOOL, '', false, true);
            $settings->put('no_br', false, App::blogWorkspace()::NS_BOOL, '', false, true);
            $settings->put('no_list', false, App::blogWorkspace()::NS_BOOL, '', false, true);
            $settings->put('no_pre', false, App::blogWorkspace()::NS_BOOL, '', false, true);
            $settings->put('no_quote', false, App::blogWorkspace()::NS_BOOL, '', false, true);
            $settings->put('no_url', false, App::blogWorkspace()::NS_BOOL, '', false, true);
            $settings->put('add_css', true, App::blogWorkspace()::NS_BOOL, '', false, true);
            $settings->put('add_jslib', true, App::blogWorkspace()::NS_BOOL, '', false, true);
            $settings->put('add_jsglue', true, App::blogWorkspace()::NS_BOOL, '', false, true);
            $settings->put('custom_css', '', App::blogWorkspace()::NS_STRING, '', false, true);
            $settings->put('custom_jslib', '', App::blogWorkspace()::NS_STRING, '', false, true);
        } catch (Exception $exception) {
            App::error()->add($exception->getMessage());
        }

        return true;
    }
}
