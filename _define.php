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
$this->registerModule(
    'Comments Wikibar',
    'Adds a formatting toolbar when public comments use the wiki syntax',
    'Pep, Biou, Franck Paul and contributors',
    '5.7',
    [
        'date'        => '2025-03-24T12:53:58+0100',
        'requires'    => [['core', '2.28']],
        'permissions' => 'My',
        'type'        => 'plugin',

        'details'    => 'https://open-time.net/?q=commentsWikibar',
        'support'    => 'https://github.com/franck-paul/commentsWikibar',
        'repository' => 'https://raw.githubusercontent.com/franck-paul/commentsWikibar/main/dcstore.xml',
        'license'    => 'gpl2',
    ]
);
