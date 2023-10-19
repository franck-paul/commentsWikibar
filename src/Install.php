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

use dcCore;
use dcNamespace;
use Dotclear\App;
use Dotclear\Core\Process;
use Exception;

class Install extends Process
{
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
            $old_version = dcCore::app()->getVersion(My::id());
            if (version_compare((string) $old_version, '3.0', '<')) {
                // Rename settings namespace
                if (App::blog()->settings()->exists('commentswikibar')) {
                    App::blog()->settings()->delNamespace(My::id());
                    App::blog()->settings()->renNamespace('commentswikibar', My::id());
                }

                // Change settings names (remove commentswikibar_ prefix in them)
                $rename = function (string $name, dcNamespace $settings): void {
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

            $settings->put('active', false, dcNamespace::NS_BOOL, '', false, true);
            $settings->put('no_format', false, dcNamespace::NS_BOOL, '', false, true);
            $settings->put('no_br', false, dcNamespace::NS_BOOL, '', false, true);
            $settings->put('no_list', false, dcNamespace::NS_BOOL, '', false, true);
            $settings->put('no_pre', false, dcNamespace::NS_BOOL, '', false, true);
            $settings->put('no_quote', false, dcNamespace::NS_BOOL, '', false, true);
            $settings->put('no_url', false, dcNamespace::NS_BOOL, '', false, true);
            $settings->put('add_css', true, dcNamespace::NS_BOOL, '', false, true);
            $settings->put('add_jslib', true, dcNamespace::NS_BOOL, '', false, true);
            $settings->put('add_jsglue', true, dcNamespace::NS_BOOL, '', false, true);
            $settings->put('custom_css', '', dcNamespace::NS_STRING, '', false, true);
            $settings->put('custom_jslib', '', dcNamespace::NS_STRING, '', false, true);
        } catch (Exception $e) {
            dcCore::app()->error->add($e->getMessage());
        }

        return true;
    }
}
