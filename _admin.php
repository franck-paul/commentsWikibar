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
if (!defined('DC_CONTEXT_ADMIN')) {
    return;
}

// dead but useful code, in order to have translations
__('Comments Wikibar') . __('Adds a formatting toolbar when public comments use the wiki syntax');

$_menu['Blog']->addItem(
    __('Comments Wikibar'),
    'plugin.php?p=commentsWikibar',
    [urldecode(dcPage::getPF('commentsWikibar/icon.svg')), urldecode(dcPage::getPF('commentsWikibar/icon-dark.svg'))],
    preg_match('/plugin.php\?p=commentsWikibar(&.*)?$/', $_SERVER['REQUEST_URI']),
    dcCore::app()->auth->check('contentadmin', dcCore::app()->blog->id)
);

/* Register favorite */
dcCore::app()->addBehavior('adminDashboardFavorites', ['commentsWikibarAdmin', 'adminDashboardFavorites']);

class commentsWikibarAdmin
{
    public static function adminDashboardFavorites($core, $favs)
    {
        $favs->register('commentsWikibar', [
            'title'      => __('Comments Wikibar'),
            'url'        => 'plugin.php?p=commentsWikibar',
            'small-icon' => [
                urldecode(dcPage::getPF('commentsWikibar/icon.svg')),
                urldecode(dcPage::getPF('commentsWikibar/icon-dark.svg')),
            ],
            'large-icon' => [
                urldecode(dcPage::getPF('commentsWikibar/icon.svg')),
                urldecode(dcPage::getPF('commentsWikibar/icon-dark.svg')),
            ],
            'permissions' => 'admin',
        ]);
    }
}
