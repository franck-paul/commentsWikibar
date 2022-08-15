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
if (!defined('DC_RC_PATH')) {
    return;
}

$this->registerModule(
    'Comments Wikibar',                                                   // Name
    'Adds a formatting toolbar when public comments use the wiki syntax', // Description
    'Pep, Biou, Franck Paul and contributors',                            // Author
    '1.15',                                                               // Version
    [
        'requires'    => [['core', '2.23']], // Dependencies
        'permissions' => 'contentadmin',     // Permissions
        'type'        => 'plugin',           // Type

        'details'    => 'https://open-time.net/?q=commentsWikibar',       // Details URL
        'support'    => 'https://github.com/franck-paul/commentsWikibar', // Support URL
        'repository' => 'https://raw.githubusercontent.com/franck-paul/commentsWikibar/master/dcstore.xml',
    ]
);
