# commentsWikibar

[![Release](https://img.shields.io/github/v/release/franck-paul/commentsWikibar)](https://github.com/franck-paul/commentsWikibar/releases)
[![Date](https://img.shields.io/github/release-date/franck-paul/commentsWikibar)](https://github.com/franck-paul/commentsWikibar/releases)
[![Issues](https://img.shields.io/github/issues/franck-paul/commentsWikibar)](https://github.com/franck-paul/commentsWikibar/issues)
[![Dotaddict](https://img.shields.io/badge/dotaddict-official-green.svg)](https://plugins.dotaddict.org/dc2/details/commentsWikibar)
[![License](https://img.shields.io/github/license/franck-paul/commentsWikibar)](https://github.com/franck-paul/commentsWikibar/blob/master/LICENSE)

Adds a formatting toolbar when public comments use the Dotclear wiki syntax in Dotclear blog.

Note: The markdown syntax is also take into account if the according syntax is installed and selected for public comments.

## Additional URL types

The plugin will cope with post and page standard URLs. If you need more contexts, you should use the `initCommentsWikibar` behavior and adding your URL type to the given parameter.

Example for a new 'Entry' URL type :

```php
/**
 * @param  ArrayObject<array-key, string> $supported_modes
 */
public static function initCommentsWikibar(ArrayObject $supported_modes): string
{
    $supported_modes->append('Entry');

    return '';
}
```

## Support

[Github](https://github.com/franck-paul/commentsWikibar)

## Localization

[Transifex](https://www.transifex.com/open-time/commentswikibar-dotclear-2-plugin/)
