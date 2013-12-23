
<div class="wrap" style="padding-top: 10px;">
<?php if (get_option('energyfolks_plugin_enabled') != '1') { ?>
    <h1>Synchronize with EnergyFolks</h1>Your plugin installation is incomplete!  <a href='http://server.energyfolks.com/developers/wordpress_sync?return_url=<?php echo urlencode(get_site_url()); ?>'>Synchronize your plugin with energyfolks</a>.
<?php } else { ?>
    <iframe src="http://server.energyfolks.com/affiliates/dashboard?aid=<?php echo get_option('energyfolks_affiliate_id'); ?>&iframe_next=true" width="1035" height="1000" frameborder="0" border="0"></iframe>
    <?php } ?>
</div>
