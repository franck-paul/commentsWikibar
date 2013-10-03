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

if (!defined('DC_CONTEXT_ADMIN')) { return; }

// dead but useful code, in order to have translations
__('Comments Wikibar').__('Adds a formatting toolbar when public comments use the wiki syntax');

$_menu['Blog']->addItem(__('Comments Wikibar'),'plugin.php?p=commentsWikibar','index.php?pf=commentsWikibar/icon.png',
		preg_match('/plugin.php\?p=commentsWikibar(&.*)?$/',$_SERVER['REQUEST_URI']),
		$core->auth->check('contentadmin',$core->blog->id));

/* Register favorite */
$core->addBehavior('adminDashboardFavorites',array('commentsWikibarAdmin','adminDashboardFavorites'));

class commentsWikibarAdmin
{
	public static function adminDashboardFavorites($core,$favs)
	{
		$favs->register('commentsWikibar', array(
			'title' => __('Comments Wikibar'),
			'url' => 'plugin.php?p=commentsWikibar',
			'small-icon' => 'index.php?pf=commentsWikibar/icon.png',
			'large-icon' => 'index.php?pf=commentsWikibar/icon-big.png',
			'permissions' => 'admin'
		));
	}

}
