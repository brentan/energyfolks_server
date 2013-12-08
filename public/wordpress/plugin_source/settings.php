<?php $_SESSION['Energyfolks_bad_secret_up']=true; ?>
<div class="wrap">
	<h2>Energyfolks Plugin Settings</h2>        
	<form method="post" action="options.php">
	<?php settings_fields('energyfolks'); ?>

        <table class="form-table">
        <tr valign="top">
            <th scope="row"><label>Affiliate ID</label></th>
				<td><input type="text" name="energyfolks_affiliate_id" value="<?php echo get_option('energyfolks_affiliate_id'); ?>" /> </td>
				<td><span class="description">Your affiliate ID is an integer provided during your setup.  If you are unsure of its value, you can visit <A href='https://www.energyfolks.com/users'>the member database at energyfolks</a>.  Click your group name, and in the URL you will see a hashtag of 'ThreadDet_##' where ## is your group ID.</span></td>
        </tr>
        <tr valign="top">
            <th scope="row"><label>Shared Secret</label></th>
				<td><input type="text" name="energyfolks_secret" value="<?php echo get_option('energyfolks_secret'); ?>" /> </td>
				<td><span class="description">Your shared secret is provided to you by energyfolks.  It allows your setup to communicate with the energyfolks servers using a secret key that encrypts information and both servers know, but which is never transmitted or shared.  If you need your secret key, please find it in the 'wordpress' option screen under 'general settings' on <a href="https://www.energyfolks.com/partner/detail/<?php echo get_option('energyfolks_affiliate_id'); ?>" target="_blank">your energyfolks admin screen</a>, or email <a href='mailto:contact@energyfolks.com'>contact@energyfolks.com</a></span> </td>
        </tr>
        <tr valign="top">
            <th scope="row"><label>Top Menu Settings</label></th>
                <td>
                    <label style="display:block;"><input type="radio" name="energyfolks_topmenu" value="1" <?php if(get_option('energyfolks_topmenu') == "1") echo "checked";?>>Show top menu, fixed</label>
                    <label style="display:block;"><input type="radio" name="energyfolks_topmenu" value="2" <?php if(get_option('energyfolks_topmenu') == "2") echo "checked";?>>Show top menu, relative</label>
                    <label style="display:block;"><input type="radio" name="energyfolks_topmenu" value="3" <?php if(get_option('energyfolks_topmenu') == "3") echo "checked";?>>Do not show top menu (except WP menu)</label>
                </td>
				<td><input type="hidden" name="energyfolks_color" value="NOTSET" /><span class="description">Controls how the energyfolks menu appears at the top of your pages (does not effect the Wordpress admin bar that will show up for your group admins).  The 'fixed' settin will attach the bar to the top of the view, so that it stays visible even if the user scrolls.  The 'relative' option will place it at the top of the page, but will allow the bar to dissapear if the user scrolls down the page.</span></td>
        </tr>        
        <tr valign="top">
            <th scope="row"><label>Wrapping Element ID</label></th>
				<td><input type="text" name="energyfolks_init_div" value="<?php echo get_option('energyfolks_init_div'); ?>" /></td>
				<td><span class="description">Enter the ID of the wrapping div element on your pages.  If you do not know this, you can leave it as a '0' however your page may not display energyfolks content in an optimal fashion.  If you need help determining this value (it is dependant on your chosen theme and may change if a different theme is installed) please <a href='mailto:contact@energyfolks.com'>contact us</a>.</span></td>
        </tr>
        <tr valign="top">
            <th scope="row"><label>Filter Bar</label></th>
                <td>
                    <label style="display:block;"><input type="radio" name="energyfolks_disablefixedsearchbar" value="0" <?php if(get_option('energyfolks_disablefixedsearchbar') == "0") echo "checked";?>>Allow Filter Bar to float with page as user scrolls</label>
                    <label style="display:block;"><input type="radio" name="energyfolks_disablefixedsearchbar" value="1" <?php if(get_option('energyfolks_disablefixedsearchbar') == "1") echo "checked";?>>Fix the filter bar in place on page</label>
                </td>
				<td><span class="description">The filter bar is optionally shown on energyfolks pages and allows the user to filter the data in the view.  By default, this box will stay move as the user scrolls, keeping it within the screen view.  You can disable this behavior to have it remain fixed in place at one location on the page.</span></td>
        </tr> 
        <tr valign="top">
            <th scope="row"><label>Wordpress User Logins</label></th>
				<td><label><input type="checkbox" name="energyfolks_other_users" value="1" onclick="this.blur();" onchange="if(this.checked) EnFolks_get_object('EnFolksAllowedUser').style.display='block'; else EnFolks_get_object('EnFolksAllowedUser').style.display='none';" <?php if(get_option('energyfolks_other_users') == "1") echo "checked"; ?> /> Disable Wordpress user logins</label>
                                <div style="display:<?php if(get_option('energyfolks_other_users') == "1") echo "block"; else echo "none"; ?>;" id="EnFolksAllowedUser">
                                    Allowed User: <input type="text" name="energyfolks_allowed_user" value="<?php echo get_option('energyfolks_allowed_user'); ?>" />
                                </div>
                                </td>
				<td><span class="description">Energyfolks replaces the wordpress user management system, and allows you to designate wordpress roles directly through the energyfolks member database for your groups.  You can also allow local wordpress accounts to be created if you like.  To enable this, uncheck the box.  If you disable wordpress user logins, please provide the username for a master wordpress account.  Logins to wordpress will still be allowed for this master account.</span></td>
        </tr>     
    </table>
	
	<p class="submit">
	<input type="submit" name="Submit" value="Save changes" />
	</p>
	</form>
	</div>