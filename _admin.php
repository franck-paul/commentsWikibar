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

$_menu['Blog']->addItem(__('Comments Wikibar'),'plugin.php?p=commentsWikibar','index.php?pf=commentsWikibar/icon.png',
		preg_match('/plugin.php\?p=commentsWikibar(&.*)?$/',$_SERVER['REQUEST_URI']),
		$core->auth->check('contentadmin',$core->blog->id));
?>