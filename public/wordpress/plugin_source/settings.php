
<div class="wrap">
	<h2>Energyfolks Plugin Settings</h2> 
        <p>The below settings are automatically set after synchronization with energyfolks servers.  Resynchronize with energyfolks if you believe your site has been compromised or if any of the below settings are not correct.</p>
        <a href='http://dev.energyfolks.com:3000/developers/wordpress_sync?return_url=<?php echo urlencode(get_site_url()); ?>'>Re-synchronize your plugin with energyfolks</a>.
        <h3>Current Configuration</h3>
        <div id="ef_settings">
            <table border="1">
                <tr>
                    <td>
                        Affiliate ID:
                    </td>
                    <td>
                        <?php echo get_option('energyfolks_affiliate_id'); ?>
                    </td>
                </tr>
                <tr>
                    <td>
                        Shared Secret:
                    </td>
                    <td>
                        <?php echo get_option('energyfolks_secret'); ?>
                    </td>
                </tr>
            </table>
            <a href="#" onclick="if(confirm('These settings are set through communication with the EnergyFolks servers and should only be changed by experts that understand the potential issues that can arise if this plugin is misconfigured.  Are you sure you want to edit these values?')) { EnergyFolks.$('#ef_settings').hide();EnergyFolks.$('#ef_settings_form').show();} return false;">Edit ID And Secret (Experts only)</a>
        </div>
        <div id="ef_settings_form" style="display:none;">
            <form method="post" action="options.php">
            <?php settings_fields('energyfolks'); ?>

            <table class="form-table">
            <tr valign="top">
                <th scope="row"><label>Affiliate ID</label></th>
                                    <td><input type="text" name="energyfolks_affiliate_id" value="<?php echo get_option('energyfolks_affiliate_id'); ?>" /> </td>
                                    <td><span class="description">Your affiliate ID is an integer provided during your setup.</span></td>
            </tr>
            <tr valign="top">
                <th scope="row"><label>Shared Secret</label></th>
                                    <td><input type="text" name="energyfolks_secret" value="<?php echo get_option('energyfolks_secret'); ?>" /> </td>
                                    <td><span class="description">Your shared secret is provided to you by energyfolks.  It allows your setup to communicate with the energyfolks servers using a secret key that is used to digitally sign all information send to and from both servers.  This secret is known to both servers, but is never transmitted between them.  </span> </td>
            </tr>    
        </table>
            <input type='hidden' name="energyfolks_plugin_enabled" value="1">
            <p class="submit">
            <input type="submit" name="Submit" value="Save changes" />
            </p>
            </form>
        </div>
	</div>