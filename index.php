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

// Getting current parameters
$active        = (boolean) $core->blog->settings->commentswikibar->commentswikibar_active;
$no_format     = (boolean) $core->blog->settings->commentswikibar->commentswikibar_no_format;
$no_br         = (boolean) $core->blog->settings->commentswikibar->commentswikibar_no_br;
$no_list       = (boolean) $core->blog->settings->commentswikibar->commentswikibar_no_list;
$no_pre        = (boolean) $core->blog->settings->commentswikibar->commentswikibar_no_pre;
$no_quote      = (boolean) $core->blog->settings->commentswikibar->commentswikibar_no_quote;
$no_url        = (boolean) $core->blog->settings->commentswikibar->commentswikibar_no_url;
$wb_add_css    = (boolean) $core->blog->settings->commentswikibar->commentswikibar_add_css;
$wb_add_jslib  = (boolean) $core->blog->settings->commentswikibar->commentswikibar_add_jslib;
$wb_add_jsglue = (boolean) $core->blog->settings->commentswikibar->commentswikibar_add_jsglue;
$custom_css    = (string) $core->blog->settings->commentswikibar->commentswikibar_custom_css;
$custom_jslib  = (string) $core->blog->settings->commentswikibar->commentswikibar_custom_jslib;

// Saving new configuration
if (!empty($_POST['saveconfig'])) {
    try
    {
        $core->blog->settings->addNameSpace('commentswikibar');

        $active        = (empty($_POST['active'])) ? false : true;
        $no_format     = (empty($_POST['no_format'])) ? false : true;
        $no_br         = (empty($_POST['no_br'])) ? false : true;
        $no_list       = (empty($_POST['no_list'])) ? false : true;
        $no_pre        = (empty($_POST['no_pre'])) ? false : true;
        $no_quote      = (empty($_POST['no_quote'])) ? false : true;
        $no_url        = (empty($_POST['no_url'])) ? false : true;
        $wb_add_css    = (empty($_POST['wb_add_css'])) ? false : true;
        $wb_add_jslib  = (empty($_POST['wb_add_jslib'])) ? false : true;
        $wb_add_jsglue = (empty($_POST['wb_add_jsglue'])) ? false : true;
        $custom_css    = (empty($_POST['custom_css'])) ? '' : html::sanitizeURL($_POST['custom_css']);
        $custom_jslib  = (empty($_POST['custom_jslib'])) ? '' : html::sanitizeURL($_POST['custom_jslib']);
        $core->blog->settings->commentswikibar->put('commentswikibar_active', $active, 'boolean');
        $core->blog->settings->commentswikibar->put('commentswikibar_no_format', $no_format, 'boolean');
        $core->blog->settings->commentswikibar->put('commentswikibar_no_br', $no_br, 'boolean');
        $core->blog->settings->commentswikibar->put('commentswikibar_no_list', $no_list, 'boolean');
        $core->blog->settings->commentswikibar->put('commentswikibar_no_pre', $no_pre, 'boolean');
        $core->blog->settings->commentswikibar->put('commentswikibar_no_quote', $no_quote, 'boolean');
        $core->blog->settings->commentswikibar->put('commentswikibar_no_url', $no_url, 'boolean');
        $core->blog->settings->commentswikibar->put('commentswikibar_add_css', $wb_add_css, 'boolean');
        $core->blog->settings->commentswikibar->put('commentswikibar_add_jslib', $wb_add_jslib, 'boolean');
        $core->blog->settings->commentswikibar->put('commentswikibar_add_jsglue', $wb_add_jsglue, 'boolean');
        $core->blog->settings->commentswikibar->put('commentswikibar_custom_css', $custom_css, 'string');
        $core->blog->settings->commentswikibar->put('commentswikibar_custom_jslib', $custom_jslib, 'string');

        // Active wikibar enforces wiki syntax in blog comments
        $wiki_comments = (boolean) $core->blog->settings->system->wiki_comments;
        if ($active && !$wiki_comments) {
            $core->blog->settings->system->put('wiki_comments', true, 'boolean');
        }
        $core->blog->triggerBlog();

        $msg = __('Configuration successfully updated.');
    } catch (Exception $e) {
        $core->error->add($e->getMessage());
    }
}
?>
<html>
<head>
  <title><?php echo __('Comments Wikibar'); ?></title>
  <?php echo dcPage::cssLoad(urldecode(dcPage::getPF('commentsWikibar/wikibar.min.css'))); ?>
  <?php echo dcPage::cssLoad(urldecode(dcPage::getPF('commentsWikibar/src/admin.css'))); ?>
  <?php echo dcPage::jsPageTabs(''); ?>
</head>

<body>
<?php
echo dcPage::breadcrumb(
    [
        html::escapeHTML($core->blog->name) => '',
        __('Comments Wikibar')              => ''
    ]);
?>

<?php if (!empty($msg)) {
    dcPage::success($msg);
}
?>

<div id="wikibar_panel">
<form method="post" action="plugin.php">
  <div class="multi-part" id="wikibar_options" title="<?php echo __('Plugin Activation'); ?>">
    <p class="field">
      <?php echo form::checkbox('active', 1, $active); ?>
      <label class="classic" for="active"><?php echo __('Enable Comments Wikibar'); ?></label>
    </p>
    <p><em><?php echo __('Activating this plugin also enforces wiki syntax in blog comments'); ?></em></p>

    <h3><?php echo __('Options'); ?></h3>
    <p class="field wide">
      <?php echo form::checkbox('no_format', 1, $no_format); ?>
      <label class="classic" for="no_format"><?php echo __('Disable characters format'); ?></label>
      <span class="jstElements" aria-hidden="true">
        <button disabled class="jstb_strong" title="<?php echo __('Strong emphasis'); ?>">
          <span class="sr-only"><?php echo __('Strong emphasis'); ?></span>
        </button>
        <button disabled class="jstb_em" title="<?php echo __('Emphasis'); ?>">
          <span class="sr-only"><?php echo __('Emphasis'); ?></span>
        </button>
        <button disabled class="jstb_ins" title="<?php echo __('Inserted'); ?>">
          <span class="sr-only"><?php echo __('Inserted'); ?></span>
        </button>
        <button disabled class="jstb_del" title="<?php echo __('Deleted'); ?>">
          <span class="sr-only"><?php echo __('Deleted'); ?></span>
        </button>
        <button disabled class="jstb_quote" title="<?php echo __('Inline quote'); ?>">
          <span class="sr-only"><?php echo __('Inline quote'); ?></span>
        </button>
        <button disabled class="jstb_code" title="<?php echo __('Code'); ?>">
          <span class="sr-only"><?php echo __('Code'); ?></span>
        </button>
      </span>
    </p>
    <p class="field wide">
      <?php echo form::checkbox('no_br', 1, $no_br); ?>
      <label class="classic" for="no_br"><?php echo __('Disable breakline'); ?></label>
      <span class="jstElements" aria-hidden="true">
        <button disabled class="jstb_br" title="<?php echo __('Line break'); ?>">
          <span class="sr-only"><?php echo __('Line break'); ?></span>
        </button>
      </span>
    </p>
    <p class="field wide">
      <?php echo form::checkbox('no_list', 1, $no_list); ?>
      <label class="classic" for="no_list"><?php echo __('Disable list'); ?></label>
      <span class="jstElements" aria-hidden="true">
        <button disabled class="jstb_ul" title="<?php echo __('Unordered list'); ?>">
          <span class="sr-only"><?php echo __('Unordered list'); ?></span>
        </button>
        <button disabled class="jstb_ol" title="<?php echo __('Ordered list'); ?>">
          <span class="sr-only"><?php echo __('Ordered list'); ?></span>
        </button>
      </span>
    </p>
    <p class="field wide">
      <?php echo form::checkbox('no_pre', 1, $no_pre); ?>
      <label class="classic" for="no_pre"><?php echo __('Disable preformatted text'); ?></label>
      <span class="jstElements" aria-hidden="true">
        <button disabled class="jstb_pre" title="<?php echo __('Preformatted'); ?>">
          <span class="sr-only"><?php echo __('Preformatted'); ?></span>
        </button>
      </span>
    </p>
    <p class="field wide">
      <?php echo form::checkbox('no_quote', 1, $no_quote); ?>
      <label class="classic" for="no_quote"><?php echo __('Disable blockquote'); ?></label>
      <span class="jstElements" aria-hidden="true">
        <button disabled class="jstb_bquote" title="<?php echo __('Block quote'); ?>">
          <span class="sr-only"><?php echo __('Block quote'); ?></span>
        </button>
      </span>
    </p>
    <p class="field wide">
      <?php echo form::checkbox('no_url', 1, $no_url); ?>
      <label class="classic" for="no_url"><?php echo __('Disable link'); ?></label>
      <span class="jstElements" aria-hidden="true">
        <button disabled class="jstb_link" title="<?php echo __('Link'); ?>">
          <span class="sr-only"><?php echo __('Link'); ?></span>
        </button>
      </span>
    </p>
  </div>

  <div class="multi-part" id="wikibar_advanced" title="<?php echo __('Advanced Options'); ?>">

    <h3><?php echo __('CSS inclusion'); ?></h3>
    <p class="field">
      <?php echo form::checkbox('wb_add_css', 1, $wb_add_css); ?>
      <label class="classic" for="wb_add_css"><?php echo __('Include CSS'); ?></label>
    </p>
    <p class="field">
      <label class="classic" for="custom_css"><?php echo __('Use custom CSS'); ?> : </label>
      <?php echo form::field('custom_css', 40, 128, $custom_css); ?>
    </p>
    <p><em><?php echo __('You can use a custom CSS by providing its location.'); ?><br />
    <?php echo __('A location beginning with a / is treated as absolute, else it is treated as relative to the blog\'s current theme URL'); ?>
    </em></p>

    <h3><?php echo __('Javascript inclusion'); ?></h3>
    <p class="field">
      <?php echo form::checkbox('wb_add_jslib', 1, $wb_add_jslib); ?>
      <label class="classic" for="wb_add_jslib"><?php echo __('Include JS library'); ?></label>
    </p>
    <p class="field">
      <label class="classic" for="custom_jslib"><?php echo __('Use custom JS library'); ?> : </label>
      <?php echo form::field('custom_jslib', 40, 128, $custom_jslib); ?>
    </p>
    <p><em><?php echo __('You can use a custom JS library by providing its location.'); ?><br />
    <?php echo __('A location beginning with a / is treated as absolute, else it is treated as relative to the blog\'s current theme URL'); ?>
    </em></p>
    <p class="field">
      <?php echo form::checkbox('wb_add_jsglue', 1, $wb_add_jsglue); ?>
      <label class="classic" for="wb_add_jsglue"><?php echo __('Include JS bootstrap'); ?></label>
    </p>

  </div>
  <p><input type="hidden" name="p" value="commentsWikibar" />
  <?php echo $core->formNonce(); ?>
  <input type="submit" name="saveconfig" value="<?php echo __('Save configuration'); ?>" />
  </p>
</form>
</div>

</body>
</html>
