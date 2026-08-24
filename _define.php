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
declare(strict_types=1);

if (isset($this) && is_object($this) && method_exists($this, 'registerModule') && isset($this->id) && is_string($this->id)) {
    $this->registerModule(
        'Comments Wikibar',
        'Adds a formatting toolbar when public comments use the wiki syntax',
        'Pep, Biou, Franck Paul and contributors',
        '8.0',
        [
            'date'        => '2026-08-03T09:49:02+0200',
            'requires'    => [['core', '2.40']],
            'permissions' => 'My',
            'type'        => 'plugin',

            'details'    => 'https://open-time.net/?q=commentsWikibar',
            'support'    => 'https://github.com/franck-paul/commentsWikibar',
            'repository' => 'https://raw.githubusercontent.com/franck-paul/commentsWikibar/main/dcstore.xml',
            'license'    => 'gpl2',
        ]
    );
}
