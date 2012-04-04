<?php
# -- BEGIN LICENSE BLOCK ----------------------------------
#
# This file is part of commentsWikibar, a plugin for DotClear2.
# Copyright (c) 2006-2010 Pep and contributors.
# Licensed under the GPL version 2.0 license.
# See LICENSE file or
# http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
#
# -- END LICENSE BLOCK ------------------------------------
if (!defined('DC_RC_PATH')) return;

$this->registerModule(
	/* Name */		"Comments Wikibar",
	/* Description*/	"Adds a formatting toolbar when public comments use the wiki syntax",
	/* Author */		"Pep and contributors",
	/* Version */		'1.5',
	/* Permissions */	'contentadmin'
);
?>