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
if (!defined('DC_CONTEXT_ADMIN')) return;

// Getting current parameters
$active = (boolean)$core->blog->settings->commentswikibar->commentswikibar_active;
$wb_add_css = (boolean)$core->blog->settings->commentswikibar->commentswikibar_add_css;
$wb_add_jslib = (boolean)$core->blog->settings->commentswikibar->commentswikibar_add_jslib;
$wb_add_jsglue = (boolean)$core->blog->settings->commentswikibar->commentswikibar_add_jsglue;
$custom_css = (string)$core->blog->settings->commentswikibar->commentswikibar_custom_css;
$custom_jslib = (string)$core->blog->settings->commentswikibar->commentswikibar_custom_jslib;

// Saving new configuration
if (!empty($_POST['saveconfig'])) {
	try
	{
		$core->blog->settings->addNameSpace('commentswikibar');

		$active = (empty($_POST['active']))?false:true;
		$wb_add_css = (empty($_POST['wb_add_css']))?false:true;
		$wb_add_jslib = (empty($_POST['wb_add_jslib']))?false:true;
		$wb_add_jsglue = (empty($_POST['wb_add_jsglue']))?false:true;
		$custom_css = filter_var($_POST['custom_css'],FILTER_VALIDATE_URL);
		$custom_jslib = filter_var($_POST['custom_jslib'],FILTER_VALIDATE_URL);
		$core->blog->settings->commentswikibar->put('commentswikibar_active',$active,'boolean');
		$core->blog->settings->commentswikibar->put('commentswikibar_add_css',$wb_add_css,'boolean');
		$core->blog->settings->commentswikibar->put('commentswikibar_add_jslib',$wb_add_jslib,'boolean');
		$core->blog->settings->commentswikibar->put('commentswikibar_add_jsglue',$wb_add_jsglue,'boolean');
		$core->blog->settings->commentswikibar->put('commentswikibar_custom_css',$custom_css,'string');
		$core->blog->settings->commentswikibar->put('commentswikibar_custom_jslib',$custom_jslib,'string');
		
		// Active wikibar enforces wiki syntax in blog comments
		$wiki_comments = (boolean)$core->blog->settings->system->wiki_comments;
		if ($active && !$wiki_comments) {
			$core->blog->settings->system->put('wiki_comments',true,'boolean');
		}
		$core->blog->triggerBlog();

		$msg = __('Configuration successfully updated.');
	}
	catch (Exception $e)
	{
		$core->error->add($e->getMessage());
	}
}
?>
<html>
<head>
	<title><?php echo __('Comments Wikibar'); ?></title>
	<?php echo dcPage::jsPageTabs(''); ?>
</head>

<body>
<h2><?php echo html::escapeHTML($core->blog->name); ?> &rsaquo; <?php echo __('Comments Wikibar'); ?></h2>

<?php if (!empty($msg)) echo '<p class="message">'.$msg.'</p>'; ?>
<div id="wikibar_panel">
<form method="post" action="plugin.php">
	<div class="multi-part" id="wikibar_options" title="<?php echo __('Plugin Activation'); ?>">
	<fieldset>
		<legend><?php echo __('Plugin activation'); ?></legend>
		<p class="field">
			<?php echo form::checkbox('active', 1, $active); ?>
			<label class=" classic" for="active">&nbsp;<?php echo __('Enable Comments Wikibar');?></label>
		</p>
		<p><em><?php echo __('Activating this plugin also enforces wiki syntax in blog comments'); ?></em></p>
	</fieldset>
	</div>
	<div class="multi-part" id="wikibar_advanced" title="<?php echo __('Advanced Options'); ?>">
	<fieldset>
		<legend><?php echo __('CSS inclusion'); ?></legend>
		<p class="field">
			<?php echo form::checkbox('wb_add_css', 1, $wb_add_css); ?>
			<label class=" classic" for="wb_add_css">&nbsp;<?php echo __('Include CSS');?></label>
		</p>
		<p class="field">
			<label class=" classic"><?php echo __('Use custom CSS') ; ?> : </label>
			<?php echo form::field('custom_css',40,128,$custom_css); ?>
		</p>
		<p><em><?php echo __('You can use a custom CSS by providing its location.'); ?><br />
		<?php echo __('A location beginning with a / is treated as absolute, else it is treated as relative to the blog\'s current theme URL'); ?>
		</em></p>
	</fieldset>
	<fieldset>
		<legend><?php echo __('Javascript inclusion'); ?></legend>
		<p class="field">
			<?php echo form::checkbox('wb_add_jslib', 1, $wb_add_jslib); ?>
			<label class=" classic" for="wb_add_jslib">&nbsp;<?php echo __('Include JS library');?></label>
		</p>
		<p class="field">
			<label class=" classic"><?php echo __('Use custom JS library') ; ?> : </label>
			<?php echo form::field('custom_jslib',40,128,$custom_jslib); ?>
		</p>
		<p><em><?php echo __('You can use a custom JS library by providing its location.'); ?><br />
		<?php echo __('A location beginning with a / is treated as absolute, else it is treated as relative to the blog\'s current theme URL'); ?>
		</em></p>
		<p class="field">
			<?php echo form::checkbox('wb_add_jsglue', 1, $wb_add_jsglue); ?>
			<label class=" classic" for="wb_add_jsglue">&nbsp;<?php echo __('Include JS bootstrap');?></label>
		</p>
	</fieldset>
	</div>
	<p><input type="hidden" name="p" value="commentsWikibar" />
	<?php echo $core->formNonce(); ?>
	<input type="submit" name="saveconfig" value="<?php echo __('Save configuration'); ?>" />
	</p>
</form>
</div>

</body>
</html>
