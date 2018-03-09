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

if (!defined('DC_CONTEXT_ADMIN')) {return;}

// dead but useful code, in order to have translations
__('Comments Wikibar') . __('Adds a formatting toolbar when public comments use the wiki syntax');

$_menu['Blog']->addItem(__('Comments Wikibar'),
    'plugin.php?p=commentsWikibar',
    urldecode(dcPage::getPF('commentsWikibar/icon.png')),
    preg_match('/plugin.php\?p=commentsWikibar(&.*)?$/', $_SERVER['REQUEST_URI']),
    $core->auth->check('contentadmin', $core->blog->id));

/* Register favorite */
$core->addBehavior('adminDashboardFavorites', array('commentsWikibarAdmin', 'adminDashboardFavorites'));

class commentsWikibarAdmin
{
    public static function adminDashboardFavorites($core, $favs)
    {
        $favs->register('commentsWikibar', array(
            'title'       => __('Comments Wikibar'),
            'url'         => 'plugin.php?p=commentsWikibar',
            'small-icon'  => urldecode(dcPage::getPF('commentsWikibar/icon.png')),
            'large-icon'  => urldecode(dcPage::getPF('commentsWikibar/icon-big.png')),
            'permissions' => 'admin'
        ));
    }

}
