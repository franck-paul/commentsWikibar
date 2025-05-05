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
    '6.1',
    [
        'date'        => '2025-05-05T13:07:35+0200',
        'requires'    => [['core', '2.34']],
        'permissions' => 'My',
        'type'        => 'plugin',

        'details'    => 'https://open-time.net/?q=commentsWikibar',
        'support'    => 'https://github.com/franck-paul/commentsWikibar',
        'repository' => 'https://raw.githubusercontent.com/franck-paul/commentsWikibar/main/dcstore.xml',
        'license'    => 'gpl2',
    ]
);
