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

if (!dcCore::app()->newVersion(basename(__DIR__), dcCore::app()->plugins->moduleInfo(basename(__DIR__), 'version'))) {
    return;
}

dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_active', false, 'boolean', '', false, true);
dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_no_format', false, 'boolean', '', false, true);
dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_no_br', false, 'boolean', '', false, true);
dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_no_list', false, 'boolean', '', false, true);
dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_no_pre', false, 'boolean', '', false, true);
dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_no_quote', false, 'boolean', '', false, true);
dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_no_url', false, 'boolean', '', false, true);
dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_add_css', true, 'boolean', '', false, true);
dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_add_jslib', true, 'boolean', '', false, true);
dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_add_jsglue', true, 'boolean', '', false, true);
dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_custom_css', '', 'string', '', false, true);
dcCore::app()->blog->settings->commentswikibar->put('commentswikibar_custom_jslib', '', 'string', '', false, true);

return true;
