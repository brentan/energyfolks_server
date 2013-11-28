<?php
/*
Plugin Name: Energyfolks tools
Plugin URI: http://www.energyfolks.com/developer/wordpress.php
Description: User to add energyfolks tools to your wordpress site, and use energyfolks as the primary authenticator for your site.
Version: 1.08
Author: Brentan Alexander
Author URI: http://www.energyfolks.com

    Copyright 2007  Brentan Alexander (on behalf of energyfolks)

    This program is free software; you can redistribute it and/or modify
    it  under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/
/*
 * TODOS
 * top menu...keep playing, make ef logo smaller?
 * For page edit screen, make the ef box an options menu where you return to code to insert based on options selected
 */

/*
 * Register my variables in the system
 */
function energyfolks_activate() {
    add_option('energyfolks_affiliate_id',"");
    add_option('energyfolks_secret',"");
    add_option('energyfolks_topmenu',"1");
    add_option('energyfolks_color','NOTSET');
    add_option('energyfolks_other_users',"1");
    add_option('energyfolks_allowed_user','admin');
    add_option('energyfolks_init_div',"0");
    add_option('energyfolks_login_url',"0");
    add_option('energyfolks_disablefixedsearchbar',"0");
}
/*
 * Load vars for admin control pages
 */
function energyfolks_init_vars() {
    register_setting("energyfolks",'energyfolks_affiliate_id');
    register_setting("energyfolks",'energyfolks_secret');
    register_setting("energyfolks",'energyfolks_topmenu');
    register_setting("energyfolks",'energyfolks_color');
    register_setting("energyfolks",'energyfolks_other_users');
    register_setting("energyfolks",'energyfolks_allowed_user');
    register_setting("energyfolks",'energyfolks_init_div');
    register_setting("energyfolks",'energyfolks_login_url');
    register_setting("energyfolks",'energyfolks_disablefixedsearchbar');
    if(((get_option('energyfolks_color') == 'NOTSET') || !$_SESSION['energyfolks_check_ef']) && (get_option('energyfolks_affiliate_id')*1 > 0) && !$_SESSION['Energyfolks_bad_secret']) {
        $url="https://www.energyfolks.com/partner/wordpressdetail/".get_option('energyfolks_affiliate_id')."/".md5(get_option('energyfolks_secret')."worddet");
        $response = wp_remote_request($url, array('headers' => array('user-agent' => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)')));
        try {
            if($response['body'] == 'badsecret') { $_SESSION['Energyfolks_bad_secret']=true; }
            else if(($response['body'] != 'false') && ($response['body'] != '')) {
                $_SESSION['energyfolks_check_ef']=true;
                $returned_data = json_decode($response['body']);
                update_option('energyfolks_color',$returned_data->color);
                update_option('energyfolks_login_url',$returned_data->login);
            }
        } catch (Exception $e) {
            $_SESSION['Energyfolks_bad_secret']=true;
        }
    }
}
/*
 * Create the options page
 */
function energyfolks_display_options() {
    include(dirname( __FILE__ ) . '/settings.php');
}

/*
 * Add our scripts and stylesheet to the header
 */
wp_enqueue_script("EnfolksLogin","https://scripts.energyfolks.com/javascript/EnFolksLogin.js");
wp_enqueue_script("EnergyFolks","https://scripts.energyfolks.com/javascript/EnergyFolks.js");
wp_enqueue_script("EnergyFolksWidgets","https://scripts.energyfolks.com/javascript/EnergyFolksWidgets.js");
wp_enqueue_script("EnergyFolksComments","https://scripts.energyfolks.com/javascript/EnergyFolksComments.js");
wp_enqueue_style("FolksStyle","https://scripts.energyfolks.com/FolksStyle.css");

/*
 * Function will ping energyfolks for a login if user is not currently recognized, or show top admin bar if they are logged in
 */
function energyfolks_TestForLogin() { 
    if($_SESSION['Energyfolks_bad_secret_up'] && $_SESSION['Energyfolks_bad_secret']) {
        $_SESSION['Energyfolks_bad_secret_up']=false;
        $_SESSION['Energyfolks_bad_secret']=false;
        return;
    } else if($_SESSION['Energyfolks_bad_secret']) {
        echo "<script language=javascript>
            alert('ENERGYFOLKS MISCONFIGURATION: The shared secret entered into the energyfolks wordpress plugin is not correct.  Please correct this setting by clicking on the SETTINGS menu in the wordpress dashboard and choosing ENERGYFOLKS SETTINGS.');
        </script>";
        return; //bad secret! return
    }
    if(get_option('energyfolks_secret') == '') return;
    if(!$_SESSION['energyfolks_logged']) {
        echo "<script language=javascript>
            var EnFolksBotLogin=new EnergyFolksLogin();
            EnFolksBotLogin.SetAffiliate(".get_option('energyfolks_affiliate_id').");
            EnFolksBotLogin.wordpress=true;";
        if(get_option('energyfolks_topmenu') == "2")
            echo "EnFolksBotLogin.UnFixTopbar();";
        else if(get_option('energyfolks_topmenu') == "3")
            echo "EnFolksBotLogin.HideTopbar();";
        echo "EnFolksBotLogin.LoginEmpty();
        </script>";
    } else {
        echo "<script language=javascript>
            var EnFolksBotLogin=new EnergyFolksLogin('/wp-login.php?enfolks_logout=true');
            EnFolksBotLogin.SetAffiliate(".get_option('energyfolks_affiliate_id').");";
        if(get_option('energyfolks_topmenu') == "2")
            echo "EnFolksBotLogin.UnFixTopbar();";
        else if(get_option('energyfolks_topmenu') == "3")
            echo "EnFolksBotLogin.HideTopbar();";
        echo "EnFolksBotLogin.DisplayTopbar();
        </script>";
    }
}
add_action('wp_footer', 'energyfolks_TestForLogin');
add_action('admin_footer', 'energyfolks_TestForLogin');

/*
 * Prefill energyfolks variables, if a login ping is detected, talk to energyfolks
 * and authenticate the user
 */
function energyfolks_init_check() { 
    global $EnergyFolks;
    if (!session_id()) {
        session_start();
    }
    if($_GET['enfolks_logout'] != "") {
        $_SESSION['energyfolks_logged']=false;
        exit();
    }
    if($_SESSION['energyfolks_logged']) {
        $EnergyFolks->logged=true;
        $EnergyFolks->userid=$_SESSION['energyfolks_userid'];
        $EnergyFolks->user_details=$_SESSION['energyfolks_details'];
        return;
    } else 
        $EnergyFolks->logged=false;
    if($_GET['enfolks_hash'] != "") {
        $secret=get_option('energyfolks_secret');
        //Login hash received, check for user access rights
        $url = "https://www.energyfolks.com/accounts/external_wordpress_login/".$_GET['enfolks_hash']."/".md5($secret.$_GET['enfolks_hash'])."/".get_option('energyfolks_affiliate_id');
        $response = wp_remote_request($url, array('headers' => array('user-agent' => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)')));
        if ( is_wp_error( $response ) )
            { header("Content-type: text/javascript"); echo "window.location.reload();";exit(); }
        if ( 200 != $response['response']['code'] )
            { header("Content-type: text/javascript"); echo "window.location.reload();";exit(); }
        if($response['body'] == 'false') { header("Content-type: text/javascript"); echo "window.location.reload();";exit(); }
        if($response['body'] == 'badsecret') { $_SESSION['Energyfolks_bad_secret']=true; header("Content-type: text/javascript"); echo "window.location.reload();";exit(); }
        $returned_data = json_decode($response['body'],true);
        //Successful login! Set variables
        $_SESSION['energyfolks_logged']=true;
        $savedata=$returned_data;
        unset($savedata['pass']);
        unset($savedata['role']);
        $_SESSION['energyfolks_userid']=$savedata['user_id'];
        $_SESSION['energyfolks_details']=$savedata;
        $EnergyFolks->logged=true;
        $EnergyFolks->userid=$_SESSION['energyfolks_userid'];
        $EnergyFolks->user_details=$_SESSION['energyfolks_details'];
        if($returned_data['role']=='0') { header("Content-type: text/javascript"); echo "window.location.reload();";exit(); }
        //User is also a wordpress admin...
        $userarray['user_login'] = $returned_data['user'];
        $userarray['user_pass'] = $returned_data['pass'];                    
        $userarray['first_name'] = $returned_data['first_name'];
        $userarray['last_name'] = $returned_data['last_name'];
        $userarray['user_email'] = $returned_data['email'];
        $userarray['display_name'] = $userarray['first_name']." ".$userarray['last_name'];     
        if($returned_data['role'] == '1')
            $userarray['role']="contributor"; //administrator,editor,author,contributor,subscriber  
        if($returned_data['role'] == '2')
            $userarray['role']="author";  
        if($returned_data['role'] == '3')
            $userarray['role']="editor";  
        if($returned_data['role'] == '4')
            $userarray['role']="administrator";
        //looks like wp functions clean up data before entry, so I'm not going to try to clean out fields beforehand.
        if ($id = username_exists($userarray['user_login'])) {   //just do an update
            $userarray['ID'] = $id;
            wp_update_user($userarray);
        }
        else 
            wp_insert_user($userarray);
        $creds=array();
        $creds['user_login'] = $userarray['user_login'];
        $creds['user_password'] = $userarray['user_pass'];
        $creds['remember'] = false;
        $user=wp_signon($creds,false);
        if (!is_wp_error($user) ) { 
            wp_set_auth_cookie( $user->ID, 0, 0);
            wp_set_current_user($user->ID);
        } 
        header("Content-type: text/javascript");
        echo "
            window.location.reload();
            ";
        exit();
    } 
}
/*
 * Logout user when logout is clicked....also log out of energyfolks
 */
function energyfolks_logout() { //TODO: CHANGE AFFILID
    $_SESSION['energyfolks_logged']=false;
    echo "<script language=javascript>
        window.location.href='https://www.energyfolks.com/accounts/external_Logout/".get_option('energyfolks_affiliate_id')."';
            </script>";
}
add_action('wp_logout', 'energyfolks_logout');

/*
 * Disable functions.  Idea taken from http auth plugin.
 */
function energyfolks_disable_function_register() {	
	$errors = new WP_Error();
	$errors->add('registerdisabled', __('User registration is not available from this site, so you can\'t create an account or retrieve your password from here. See the message above.'));
	?></form><br /><div id="login_error">User registration is not available from this site, so you can't create an account or retrieve your password from here. See the message above.</div>
		<p id="backtoblog"><a href="<?php bloginfo('url'); ?>/" title="<?php _e('Are you lost?') ?>"><?php printf(__('&larr; Back to %s'), get_bloginfo('title', 'display' )); ?></a></p>
	<?php
	exit();
}


//gives warning for login - where to get "source" login
function energyfolks_auth_warning() {
   echo "<p class=\"message\">Access to this page is controlled through energyfolks.  You are seeing this page and message because you are not logged in to energyfolks.  <a href='/' >Go to your homepage</a> and login with energyfolks there (do not login here) and then return to this page.</p>";
}
//Disallow normal logins, unless username is 'admin' and its the site superadmin
function energyfolks_check_login($username,$password) {
    if(strpos(" ".$username,"EnergyfolksUser") == 1) return;
    if(get_option('energyfolks_other_users') == '1')    
        if($username != get_option('energyfolks_allowed_user')) $username = NULL;
}
function energyfolks_login_errors() {
    return "<strong>ERROR:</strong> Please login through energyfolks and return to this screen.  Access is controlled via energyfolks.";
}
//Remove comments menu from admin dashboard, as these are made irrelevant by this plugin
function energyfolks_remove_menus () {
    global $menu;
    //$restricted = array(__('Dashboard'), __('Posts'), __('Media'), __('Links'), __('Pages'), __('Appearance'), __('Tools'), __('Users'), __('Settings'), __('Comments'), __('Plugins'));
    if(get_option('energyfolks_other_users') == '1')
        $restricted = array( __('Users'), __('Comments'));
    else
        $restricted = array( __('Comments'));
    end ($menu);
    while (prev($menu)){
            $value = explode(' ',$menu[key($menu)][0]);
            if(in_array($value[0] != NULL?$value[0]:"" , $restricted)){unset($menu[key($menu)]);}
    }
    //Register our control menu
    add_options_page("Energyfolks settings", "Energyfolks plugin", "manage_options", "enegyfolks","energyfolks_display_options");
}

//Remove comments/users links in the admin bar at the top of pages
function energyfolks_remove_admin_bar_links() {
	global $wp_admin_bar;
	$wp_admin_bar->remove_menu('my-account');
	$wp_admin_bar->remove_menu('new-content'); // Replaced with custom new content pulldown
	$wp_admin_bar->remove_menu('comments');
}
function energyfolks_admin_notice(){
    global $pagenow;
    if (( $pagenow == 'users.php' ) || ( $pagenow == 'user-edit.php' ) || ( $pagenow == 'user-new.php' ) || ( $pagenow == 'profile.php' )){
         echo '<div class="error">
             <h2>Notice: User rights linked to energyfolks</h2><p>You can use this page to create additional wordpress-only users that can access this system.</p><p>Please note that access rights are also granted through Energyfolks automatically.  These users will have a username of EnergyfolksUser_## in the list below.  Deleting/Altering these automatically created users here will have no effect, as they will be recreated or updated when the user next logs in.  To remove access for an energyfolks user, please use the energyfolks user interface by clicking the <i>energyfolks</i> link at the top left of the screen.</p>
         </div>';
    }
}
add_action('admin_notices', 'energyfolks_admin_notice');
//Add energyfolks links to the top admin bar
function energyfolks_add_sumtips_admin_bar_link() {
	global $wp_admin_bar, $current_user, $EnergyFolks;
        $pid=get_option('energyfolks_affiliate_id'); //UPDATE AFFILIATE ID
        get_currentuserinfo();
	if ( !is_admin_bar_showing() )//if ( !is_super_admin() || !is_admin_bar_showing() )
		return;
	$wp_admin_bar->add_menu( array(
	'id' => 'energyfolks_welcome',
	'title' => __( '<img style="height:22px;border-width:0px;padding-right:5px;" align="absmiddle" src="'.$EnergyFolks->user_details['picture_url'].'">Welcome '.$current_user->user_firstname),
	'href' => '',
	));
        // Add in link to update/change profile
	$wp_admin_bar->add_menu( array(
		'parent' => 'energyfolks_welcome',
		'id'     => 'energyfolks_welcome_sub1',
		'title' => __( 'Update Profile'),
		'href' => '#',
	));
	$wp_admin_bar->add_menu( array(
		'parent' => 'energyfolks_welcome',
		'id'     => 'energyfolks_welcome_sub3',
		'title' => __( 'Logout'),
		'href' => wp_logout_url(),
	));
	$wp_admin_bar->add_menu( array(
	'id' => 'energyfolks0',
	'title' => __( ' '),
	'href' => __('javascript:;'),
	));
	$wp_admin_bar->add_menu( array(
		'parent' => 'energyfolks0',
		'id'     => 'energyfolks0_sub1',
		'title' => __( ' '),
		'href' => ' ',
	));
	$wp_admin_bar->add_menu( array(
	'id' => 'energyfolks1',
	'title' => __( ' '),
	'href' => __('javascript:;'),
	));
	$wp_admin_bar->add_menu( array(
		'parent' => 'energyfolks1',
		'id'     => 'energyfolks1_sub1',
		'title' => __( ' '),
		'href' => ' ',
	));
	$wp_admin_bar->add_menu( array(
	'id' => 'energyfolks2',
	'title' => __( ' '),
	'href' => __('javascript:;'),
	));
	$wp_admin_bar->add_menu( array(
		'parent' => 'energyfolks2',
		'id'     => 'energyfolks2_sub1',
		'title' => __( ' '),
		'href' => ' ',
	));
	$wp_admin_bar->add_menu( array(
	'id' => 'energyfolks3',
	'title' => __( ' '),
	'href' => __('javascript:;'),
	));
	$wp_admin_bar->add_menu( array(
		'parent' => 'energyfolks3',
		'id'     => 'energyfolks3_sub1',
		'title' => __( ' '),
		'href' => ' ',
	));

        
	$wp_admin_bar->add_menu( array(
	'id' => 'energyfolks_add',
	'title' => __( '+ New'),
	'href' => admin_url('post-new.php'),
	));

	$wp_admin_bar->add_menu( array(
		'parent' => 'energyfolks_add',
		'id'     => 'energyfolks_add_sub1',
		'title' => __( 'Blog Post'),
		'href' => admin_url('post-new.php'),
	));
	$wp_admin_bar->add_menu( array(
		'parent' => 'energyfolks_add',
		'id'     => 'energyfolks_add_sub5',
		'title' => __( 'Event Post'),
		'href' => __('#'),
	));
	$wp_admin_bar->add_menu( array(
		'parent' => 'energyfolks_add',
		'id'     => 'energyfolks_add_sub6',
		'title' => __( 'Job Post'),
		'href' => __('#'),
	));
	$wp_admin_bar->add_menu( array(
		'parent' => 'energyfolks_add',
		'id'     => 'energyfolks_add_sub7',
		'title' => __( 'Bulletin Post'),
		'href' => __('#'),
	));
	$wp_admin_bar->add_menu( array(
		'parent' => 'energyfolks_add',
		'id'     => 'energyfolks_add_sub4',
		'title' => __( 'Website Page'),
		'href' => admin_url('post-new.php?post_type=page'),
	));
}
add_action('admin_bar_menu', 'energyfolks_add_sumtips_admin_bar_link',25);

/*
 * Replace the comment feature with our own custom comment feature
 */
function energyfolks_comments_display() { 
    global $post;
    if(comments_open())
    echo "<script language=javascript>
                EnergyFolksComments(".get_option('energyfolks_affiliate_id').",".$post->ID.");
            </script>";
    return dirname( __FILE__ ) . '/comments.php'; //Return a blank page to override default comment page
}
add_filter('comments_template','energyfolks_comments_display',100);
/*
 * Shortcode for energyfolks content
 */
function energyfolks_shortcode($atts) {
     $atts=shortcode_atts(array(
	      'type' => '0',
	      'setloginurl' => get_option('energyfolks_login_url'),
              'disablefixedsearchbar' => get_option('energyfolks_disablefixedsearchbar'),
              'setregion' => '0',
              'restricttoaffiliate' => '0',
              'restricttohighlighted' => '0',
              'setcolor' => get_option('energyfolks_color'),
              'restricttothread' => '0',
              'customcss' => '0',
              'initialize' => get_option('energyfolks_init_div'),
     ), $atts);
     if($atts['type'] == '0') 
         return "<div style='-webkit-border-radius: 3px;border-radius: 3px;border-width: 1px;border-style: solid;background-color: #FFEBE8;padding: 0 .6em;border-color: #C00;'><h2>Energyfolks Misconfiguration</h2><p>Please provide a 'type' in your energyfolks shortcode to generate a valid display.</p><i>Example: [energyfolks type='calendar']</i></div>";
     $returnText='';
     if($atts['initialize'] == '0') {
         $returnText.="<div id='EnFolksEncapsDiv'>";
         $atts['initialize']='EnFolksEncapsDiv';
     }
     $pid=get_option('energyfolks_affiliate_id'); //TODO: UPDATE AFFIL ID
     if(($atts['setcolor'] == '0') && (current_user_can('editor') || current_user_can('administrator')))
         $returnText.= "<div style='-webkit-border-radius: 3px;border-radius: 3px;border-width: 1px;border-style: solid;background-color: lightYellow;padding: 0 .6em;border-color: #E6DB55;'><h2>Energyfolks Configuration Suggestion</h2><p>Please provide a 'SetColor' in your energyfolks shortcode so that the energyfolks display match your look/feel.  The input is a 6 character hex code for the desired color.</p><i>Example: [energyfolks SetColor='48fc78']</i><p>This message is only visible to site administrators</p></div>";
     if(($atts['setloginurl'] == '0') && (current_user_can('editor') || current_user_can('administrator')))
         $returnText.= "<div style='-webkit-border-radius: 3px;border-radius: 3px;border-width: 1px;border-style: solid;background-color: lightYellow;padding: 0 .6em;border-color: #E6DB55;'><h2>Energyfolks Configuration Suggestion</h2><p>Please provide a 'SetLoginURL' in your energyfolks shortcode so that users are directed to your login page (instead of energyfolks) if they are not logged in / registered.  This should provide the URL to your local login page.</p><i>Example: [energyfolks SetLoginURL='/login']</i><p>This message is only visible to site administrators</p></div>";
     if(($atts['initialize'] == 'EnFolksEncapsDiv') && (current_user_can('error') || current_user_can('administrator')))
         $returnText.= "<div style='-webkit-border-radius: 3px;border-radius: 3px;border-width: 1px;border-style: solid;background-color: #FFEBE8;padding: 0 .6em;border-color: #C00;'><h2>Energyfolks Warning</h2><p>Please provide a 'Initialize' in your energyfolks shortcode so that the energyfolks display correctly sets the width and location of displayed elements.  This should provide the id of the div that encloses your primary page body content (including the sidebars).</p><i>Example: [energyfolks Initialize='main-content']</i><p>This message is only visible to site administrators</p></div>";
     $returnText.="<script language=javascript>
         if(typeof EnergyFolksMain === 'undefined')
         var EnergyFolksMain = new EnergyFolks('".$atts['type']."');
         EnergyFolksMain.SetAffiliate(".$pid.");"; 
     if($atts['disablefixedsearchbar'] != '0')
          $returnText.="EnergyFolksMain.DisableFixedSearchBar();";
     if($atts['setloginurl'] != '0')
          $returnText.="EnergyFolksMain.SetLoginURL('".$atts['setloginurl']."');";
     if($atts['setregion'] != '0')
          $returnText.="EnergyFolksMain.SetRegion(".$atts['setregion'].");";
     if($atts['restricttoaffiliate'] != '0')
          $returnText.="EnergyFolksMain.RestrictToAffiliate(".$pid.");";
     if($atts['restricttohighlighted'] != '0')
          $returnText.="EnergyFolksMain.RestrictToHighlighted(".$pid.");";
     if($atts['restricttothread'] != '0')
          $returnText.="EnergyFolksMain.RestrictToThread(".$atts['restricttothread'].");";
     if($atts['customcss'] != '0')
          $returnText.="EnergyFolksMain.RegisterCustomCSS();";
     if($atts['setcolor'] != '0')
          $returnText.="EnergyFolksMain.SetColor('".$atts['setcolor']."');";
     $returnText.="
        EnergyFolksMain.Initialize('".$atts['initialize']."'); 
        </script>";
     if($atts['initialize'] == 'EnFolksEncapsDiv')
         $returnText.="</div>";
     return $returnText;
}
add_shortcode('energyfolks', 'energyfolks_shortcode');
/* 
 * Shortcode for the sidebar...can be used instead of the widget if desired
 */

function energyfolks_sidebar_shortcode($atts) {
     $atts=shortcode_atts(array(
	      'type' => '0'
     ), $atts);
     if($atts['type'] == '0') 
         return "<div style='-webkit-border-radius: 3px;border-radius: 3px;border-width: 1px;border-style: solid;background-color: #FFEBE8;padding: 0 .6em;border-color: #C00;'><h2>Energyfolks Misconfiguration</h2><p>Please provide a 'type' in your energyfolks_searchbar shortcode to generate a valid display.</p><i>Example: [energyfolks_searchbar type='calendar']</i></div>";
     
     return "<script language=javascript>
        if(typeof EnergyFolksMain === 'undefined')
            var EnergyFolksMain = new EnergyFolks('".$atts['type']."');
            EnergyFolksMain.ShowSearchBar();
            </script>";
}
add_shortcode('energyfolks_searchbar', 'energyfolks_sidebar_shortcode');
/*
 * Login shortcodes
 * energyfolks_produceloginpage: display the login page.  Nothing is returned if user is logged in
 * energyfolks_createprofilebox: Display a box with user information if logged in, otherwise nothing happens
 * energyfolks_smalllogin: display 2 lines of output if logged in or not
 */

function energyfolks_login_shortcode() {
    global $EnergyFolks;
    if($EnergyFolks->logged) return '';
    return "<script language=javascript>
        var EnergyFolksMainLogin = new EnergyFolksLogin();
            EnergyFolksMainLogin.Login(true);
            </script>";
}
add_shortcode('energyfolks_produceloginpage', 'energyfolks_login_shortcode');
function energyfolks_profile_box_shortcode() {
    global $EnergyFolks;
    if(!$EnergyFolks->logged) return '';
    $data=$EnergyFolks->user_details;
    $affiliateid=get_option('energyfolks_affiliate_id');
    $out= "<div align=left>
        <img src='" . $data['picture_url'] . "' width=70 align=right style='display:inline;'>
        <b>" . $data['first_name'] . " " . $data['last_name'] . "</b>";
    if($data['position'] != "")
        $out.= "<BR>" . $data['position'];
    if($data['company'] != "")
        $out.= "<BR><i>" . $data['company']."</i>";
    $out.= "<BR><a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/accounts/ExtProfile/".$affiliateid."\",1030,650);EnFolksWaitForLoad();'>Update Profile</a>";
    $out.= "
        <BR><script language=javascript>
            var EnFolksLogin=new EnergyFolksLogin('/wp-login.php?enfolks_logout=true');
            EnFolksLogin.Logout();
        </script>
        </div>";
    return $out;
}
add_shortcode('energyfolks_createprofilebox', 'energyfolks_profile_box_shortcode');
function energyfolks_loginsmall_shortcode($atts) {
     $atts=shortcode_atts(array(
	      'show_dets' => '1',
              'big'=>'1',
              'loginurl'=>get_option('energyfolks_login_url')
     ), $atts);
    global $EnergyFolks;
    if($EnergyFolks->logged) return '';
    $out= "<script language=javascript>
        var EnergyFolksMainLogin2 = new EnergyFolksLogin();
            EnergyFolksMainLogin2.DisplaySimpleLogin";
    if($atts['big'] == '1') $out.="Big";
    $out.="(";
    if($atts['show_dets']=='1') $out.="true"; else $out.="false";
    $out.=",'".$atts['loginurl']."');
            </script>";
    return $out;
}
add_shortcode('energyfolks_small_login', 'energyfolks_loginsmall_shortcode');
/*
 * User data shortcodes
 * energyfolks_first_name
 * energyfolks_last_name
 * energyfolks_full_name
 * energyfolks_company
 * energyfolks_position
 * energyfolks_picture: width,height
 */
function energyfolks_shortcode_first_name() {
    global $EnergyFolks;
    if(!$EnergyFolks->logged) return '';
    return $EnergyFolks->user_details['first_name'];
}
add_shortcode('energyfolks_first_name', 'energyfolks_shortcode_first_name');
function energyfolks_shortcode_last_name() {
    global $EnergyFolks;
    if(!$EnergyFolks->logged) return '';
    return $EnergyFolks->user_details['last_name'];
}
add_shortcode('energyfolks_last_name', 'energyfolks_shortcode_last_name');
function energyfolks_shortcode_full_name() {
    global $EnergyFolks;
    if(!$EnergyFolks->logged) return '';
    return $EnergyFolks->user_details['first_name'].' '.$EnergyFolks->user_details['last_name'];
}
add_shortcode('energyfolks_full_name', 'energyfolks_shortcode_full_name');
function energyfolks_shortcode_company() {
    global $EnergyFolks;
    if(!$EnergyFolks->logged) return '';
    return $EnergyFolks->user_details['company'];
}
add_shortcode('energyfolks_company', 'energyfolks_shortcode_company');
function energyfolks_shortcode_position() {
    global $EnergyFolks;
    if(!$EnergyFolks->logged) return '';
    return $EnergyFolks->user_details['position'];
}
add_shortcode('energyfolks_position', 'energyfolks_shortcode_position');
function energyfolks_shortcode_picture($atts) {
    global $EnergyFolks;
     $atts=shortcode_atts(array(
	      'width' => '0',
	      'height' => '0',
              'class' => '0',
              'style' => '0'
     ), $atts);
    if(!$EnergyFolks->logged) return '';
    $out="<img src='".$EnergyFolks->user_details['picture_url']."' ";
    if($atts['width']!='0') $out.="width=".$atts['width']." ";
    if($atts['height']!='0') $out.="height=".$atts['height']." ";
    if($atts['style']!='0') $out.="style='".$atts['style']."' ";
    if($atts['class']!='0') $out.="class='".$atts['class']."' ";
    return $out.">";
}
add_shortcode('energyfolks_picture', 'energyfolks_shortcode_picture');
/*
 * shortcodes with closing tags
 */
function energyfolks_logged_in_tag($atts,$content=null) {
    global $EnergyFolks;
    if(!$EnergyFolks->logged) return '';
    return do_shortcode($content);
}
add_shortcode("energyfolks_logged_in",'energyfolks_logged_in_tag');
function energyfolks_logged_out_tag($atts,$content=null) {
    global $EnergyFolks;
    if($EnergyFolks->logged) return '';
    return do_shortcode($content);
}
add_shortcode("energyfolks_logged_out",'energyfolks_logged_out_tag');

/*
 * EventBrite integrations shortcodes
 */
function energyfolks_eventbritepage($atts) {
     $atts=shortcode_atts(array(
	      'event_id' => '0',
              'full' => '0',
              'height' => '-1'
     ), $atts);
     if($atts['event_id'] == '0') return "<h1>You must provide an event id</h1>Please edit this page and provide an event id.  Example shortcode:<BR>[EF_eventbrite event_id='12345' height='350']";
     if($atts['full'] == '0') {
         if($atts['height'] == '-1') $atts['height']='400';
         $text='<div style="width:100%; text-align:left;" >
         <iframe src="http://www.eventbrite.com/tickets-external?eid='.$atts['event_id'].'&ref=etckt" frameborder="0" height="'.$atts['height'].'" width="100%" vspace="0" hspace="0" marginheight="5" marginwidth="5" scrolling="auto" allowtransparency="true"></iframe>
         </div>';
     } else {
         if($atts['height'] == '-1') $atts['height']='1200';
         $text='<div style="width:100%; text-align:left;" >
         <iframe src="http://www.eventbrite.com/event/'.$atts['event_id'].'?ref=eweb" frameborder="0" height="'.$atts['height'].'" width="100%" vspace="0" hspace="0" marginheight="5" marginwidth="5" scrolling="auto" allowtransparency="true"></iframe>
         </div>';
     }
     return $text;
}
add_shortcode("EF_eventbrite",'energyfolks_eventbritepage');
function energyfolks_eventbritereturn($atts,$content="<h1>One more step...</h1>Your ticket is confirmed, but complete the form below to also register a new user account and get on our mailing list!") {
     global $EnergyFolks;
     $atts=shortcode_atts(array(
	      'event_id' => '0',
              'api_key' => '0',
              'user_key' => '0'
     ), $atts);
     if($atts['event_id'] == '0') return "<h1>You must provide an event id</h1>Please edit this page and provide an event id (found in the URL of your event detail page on eventbrite).  Example shortcode:<BR>[EF_eventbrite_done event_id='12345' api_key='123456' user_key='123456']TEXT TO SHOW PEOPLE WHO ARE NOT LOGGED IN AFTER THEY REGISTER (usually something like 'sign up for an account')[/EF_eventbrite_done]";
     if($atts['api_key'] == '0') return "<h1>You must provide an API key</h1>Please edit this page and provide one (get your API key from developer.eventbrite.com).  Example shortcode:<BR>[EF_eventbrite_done event_id='12345' api_key='123456' user_key='123456']TEXT TO SHOW PEOPLE WHO ARE NOT LOGGED IN AFTER THEY REGISTER (usually something like 'sign up for an account')[/EF_eventbrite_done]";
     if($atts['user_key'] == '0') return "<h1>You must provide a user key</h1>Please edit this page and provide one (get your user key from developer.eventbrite.com).  Example shortcode:<BR>[EF_eventbrite_done event_id='12345' api_key='123456' user_key='123456']TEXT TO SHOW PEOPLE WHO ARE NOT LOGGED IN AFTER THEY REGISTER (usually something like 'sign up for an account')[/EF_eventbrite_done]";
     if($EnergyFolks->logged) return 'Thanks for registering!  Your order is complete.';
     include "EventBrite.php"; 
     $authentication_tokens = array('app_key'  => $atts['api_key'],
                                    'user_key'=> $atts['user_key']);
     $eb_client = new Eventbrite( $authentication_tokens );
    try{
        $attendees = $eb_client->event_list_attendees( array('id'=>$atts['event_id']) );
    } catch ( Exception $e ) {
        //echo "<pre>";
        //var_dump($e);
        //echo "</pre>";
        return "<h1>Eventbrite error</h1>Please double check your API key, user key, and event id.  Example shortcode:<BR>[EF_eventbrite_done event_id='12345' api_key='123456' user_key='123456']TEXT TO SHOW PEOPLE WHO ARE NOT LOGGED IN AFTER THEY REGISTER (usually something like 'sign up for an account')[/EF_eventbrite_done]";
    }
    if(isset($attendees->attendees) ){ 
    //sort the attendee list?
        usort( $attendees->attendees, "energyfolks_sort_attendees_by_created_date");
        //render the attendee as HTML
        $text="";
        $attendee=$attendees->attendees[0];
        $url='https://www.energyfolks.com/accounts/CreateAccountExternal/'.get_option('energyfolks_affiliate_id').'?email='.urlencode($attendee->attendee->email)."&fname=".urlencode($attendee->attendee->first_name)."&lname=".urlencode($attendee->attendee->last_name);
        $text.=do_shortcode($content);
        $text.='<div style="width:100%; text-align:left;" >
         <iframe src="'.$url.'" frameborder="0" height="800" width="100%" vspace="0" hspace="0" marginheight="5" marginwidth="5" scrolling="auto" allowtransparency="true"></iframe>
         </div>';
    } else $text="No users registered";
    return $text;
}
function energyfolks_sort_attendees_by_created_date( $x, $y ){
    if($x->attendee->created == $y->attendee->created ){
        return 0;
    }
    return ( $x->attendee->created > $y->attendee->created ) ? -1 : 1;
}
add_shortcode("EF_eventbrite_done",'energyfolks_eventbritereturn');


/*
 * Create the energyfolks sidebar search box widget
 */
class energyfolks_Search_Widget extends WP_Widget {

	public function __construct() {
		parent::__construct(
	 		'energyfolks_Search_Widget', // Base ID
			'EnergyFolks Filter Panel', // Name
			array( 'description' => __( 'add the energyfolks filter bar to the side of a page.  It must be used in conjunction with the [energyfolks] shortcode on a page.  ', 'text_domain' ), ) // Args
		);
	}

 	public function form( $instance ) {
		if ( isset( $instance[ 'type' ] ) ) {
			$type = $instance[ 'type' ];
		}
		else {
			$type = __( 'select', 'text_domain' );
		}
		?>
		<p>
		<?php _e( 'Page Type:' ); ?>
                <select class="widefat" id="<?php echo $this->get_field_id( 'type' ); ?>" name="<?php echo $this->get_field_name( 'type' ); ?>" >
                    <option value="select" <?php if($type == 'select') echo 'selected';?>>Select a Type</option>
                    <option value="calendar" <?php if($type == 'calendar') echo 'selected';?>>Calendar</option>
                    <option value="calendar-monthly" <?php if($type == 'calendar-monthly') echo 'selected';?>>- Calendar: Month View</option>
                    <option value="calendar-weekly" <?php if($type == 'calendar-weekly') echo 'selected';?>>- Calendar: Week View</option>
                    <option value="calendar-agenda" <?php if($type == 'calendar-agenda') echo 'selected';?>>- Calendar: Agenda View</option>
                    <option value="jobs" <?php if($type == 'jobs') echo 'selected';?>>Jobs</option>
                    <option value="bulletins" <?php if($type == 'bulletins') echo 'selected';?>>Bulletins</option>
                    <option value="bulletins-stream" <?php if($type == 'bulletins-stream') echo 'selected';?>>- Bulletins: Stream View</option>
                    <option value="bulletins-forum" <?php if($type == 'bulletins-forum') echo 'selected';?>>- Bulletins: Forum View</option>
                    <option value="bulletins-long" <?php if($type == 'bulletins-long') echo 'selected';?>>- Bulletins: Long View</option>
                    <option value="users" <?php if($type == 'users') echo 'selected';?>>Users</option>
                    <option value="blog" <?php if($type == 'blog') echo 'selected';?>>Blog</option>
                </select>
		</p>
		<?php 
	}

	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['type'] = strip_tags( $new_instance['type'] );
		return $instance;
	}

	public function widget( $args, $instance ) {
		extract( $args );
		$type= $instance['type'];
		echo $before_widget;
                echo $before_title . "Filters" . $after_title;
		if (empty( $type ) || ($type == "select"))
                    echo "<div style='-webkit-border-radius: 3px;border-radius: 3px;border-width: 1px;border-style: solid;background-color: #FFEBE8;padding: 0 .6em;border-color: #C00;'><h2>Energyfolks Sidebar Error</h2><p>Please provide a 'type' in the widget options menu so that the correct filter bar is displayed. </p></div>";
                else
                    echo "<script language=javascript>
                        if(typeof EnergyFolksMain === 'undefined')
                            var EnergyFolksMain = new EnergyFolks('".$type."');
                         EnergyFolksMain.ShowSearchBar();
                         </script>";
		echo $after_widget;
	}

}

/*
 * Create the energyfolks sidebar widgets box widget
 */
class energyfolks_Widget_Widget extends WP_Widget {

	public function __construct() {
		parent::__construct(
	 		'energyfolks_Widget_Widget', // Base ID
			'EnergyFolks Widget', // Name
			array( 'description' => __( 'Add a energyfolks widget to your page.  The widget shows energyfolks content in a small viewbox', 'text_domain' ), ) // Args
		);
	}

 	public function form( $instance ) {
		if ( isset( $instance[ 'type' ] ) ) {
			$type = $instance[ 'type' ];
		}
		else {
			$type = __( 'select', 'text_domain' );
		}
		if ( isset( $instance[ 'width' ] ) ) {
			$width = $instance[ 'width' ];
		}
		else {
			$width = __( '200', 'text_domain' );
		}
		if ( isset( $instance[ 'height' ] ) ) {
			$height = $instance[ 'height' ];
		}
		else {
			$height = __( '400', 'text_domain' );
		}
		if ( isset( $instance[ 'number' ] ) ) {
			$number = $instance[ 'number' ];
		}
		else {
			$number = __( '6', 'text_domain' );
		}
		if ( isset( $instance[ 'scroll' ] ) ) {
			$scroll = $instance[ 'scroll' ];
		}
		else {
			$scroll = __( '1', 'text_domain' );
		}
		if ( isset( $instance[ 'title' ] ) ) {
			$title = $instance[ 'title' ];
		}
		else {
			$title = __( '', 'text_domain' );
		}
		if ( isset( $instance[ 'url' ] ) ) {
			$url = $instance[ 'url' ];
		}
		else {
			$url = __( '', 'text_domain' );
		}
		if ( isset( $instance[ 'restrict' ] ) ) {
			$restrict = $instance[ 'restrict' ];
		}
		else {
			$restrict = __( '0', 'text_domain' );
		}
		if ( isset( $instance[ 'widget' ] ) ) {
			$widget = $instance[ 'widget' ];
		}
		else {
			$widget = __( 'select', 'text_domain' );
		}
		?>
		<p>
                    
		<?php _e( 'Widget Style:' ); ?>
                <select class="widefat" id="<?php echo $this->get_field_id( 'widget' ); ?>" name="<?php echo $this->get_field_name( 'widget' ); ?>" >
                    <option value="select" <?php if($widget == 'select') echo 'selected';?>>Select a Widget</option>
                    <option value="vert" <?php if($widget == 'vert') echo 'selected';?>>Vertical List</option>
                    <option value="horiz" <?php if($widget == 'horiz') echo 'selected';?>>Horizontal List</option>
                    <option value="next5" <?php if($widget == 'next5') echo 'selected';?>>Five Days of Posts</option>
                    <option value="user" <?php if($widget == 'user') echo 'selected';?>>Random User</option>
                </select>
                <?php if($widget == 'select') echo "<i>Select a widget style above and click 'save' to set widget specific options</i><div style='display:none;'>";?>
                <?php if($widget == 'user') echo "<div style='display:none;'>";?>
		<?php _e( 'Content Type:' ); ?>
                <select class="widefat" id="<?php echo $this->get_field_id( 'type' ); ?>" name="<?php echo $this->get_field_name( 'type' ); ?>" >
                    <option value="select" <?php if($type == 'select') echo 'selected';?>>Select a Type</option>
                    <option value="calendar" <?php if($type == 'calendar') echo 'selected';?>>Calendar</option>
                    <option value="jobs" <?php if($type == 'jobs') echo 'selected';?>>Jobs</option>
                    <option value="bulletins" <?php if($type == 'bulletins') echo 'selected';?>>Bulletins</option>
                    <option value="blog" <?php if($type == 'blog') echo 'selected';?>>Blogs</option>
                </select>
		</p>
                Title: <input type="text"  id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" value="<?php echo $title;?>"><BR>
                Width: <input type="text"  id="<?php echo $this->get_field_id( 'width' ); ?>" name="<?php echo $this->get_field_name( 'width' ); ?>" value="<?php echo $width;?>" size="5">px<BR>
                <?php if($widget == 'vert') echo "<i>use 0 to inherit width of parent element</i><BR>";
                if($widget == 'next5') echo "<div style='display:none';>";?>
                Height: <input type="text"  id="<?php echo $this->get_field_id( 'height' ); ?>" name="<?php echo $this->get_field_name( 'height' ); ?>" value="<?php echo $height;?>" size="5">px<BR>
                Items to show: <input type="text"  id="<?php echo $this->get_field_id( 'number' ); ?>" name="<?php echo $this->get_field_name( 'number' ); ?>" value="<?php echo $number;?>" size="5">px<BR>
                <?php if(($widget == 'user') || ($widget == 'next5')) echo "</div>";?>
                URL: <input type="text"  id="<?php echo $this->get_field_id( 'url' ); ?>" name="<?php echo $this->get_field_name( 'url' ); ?>" value="<?php echo $url;?>"><BR>
                <i>The URL should be the url of the page on your site for the chosen type.  For example, if this is a 'calendar' widget, the url should be a link the the calendar page on your site.  If the widget is a 'jobs' widget, it should be a link to the 'jobs' page on your site, etc.</i><BR>
                <?php if(($widget == 'user') || ($widget == 'next5')) echo "<div style='display:none;'>";?>
                <BR>
                <label><input type="checkbox"  id="<?php echo $this->get_field_id( 'scroll' ); ?>" name="<?php echo $this->get_field_name( 'scroll' ); ?>" value="1" <?php if($scroll == '1') echo 'checked';?>> Auto Scroll Content</label><BR>
                <?php if($widget == 'next5') echo "</div>";?>
                <BR><label><input type="radio" id="<?php echo $this->get_field_id( 'restrict' ); ?>" name="<?php echo $this->get_field_name( 'restrict' ); ?>" value="0" <?php if($restrict == "0") echo "checked";?>> Show All Posts</label><BR>
                <label><input type="radio" id="<?php echo $this->get_field_id( 'restrict' ); ?>" name="<?php echo $this->get_field_name( 'restrict' ); ?>" value="1" <?php if($restrict == "1") echo "checked";?>> Show Your Posts</label><BR>
                <label><input type="radio" id="<?php echo $this->get_field_id( 'restrict' ); ?>" name="<?php echo $this->get_field_name( 'restrict' ); ?>" value="2" <?php if($restrict == "2") echo "checked";?>> Show Your Highlighted Posts</label>
                <?php if(($widget == 'select') || ($widget == 'user'))echo "</div>";
                echo "<BR><BR>";
	}

	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['type'] = strip_tags( $new_instance['type'] );
		$instance['widget'] = strip_tags( $new_instance['widget'] );
		$instance['width'] = strip_tags( $new_instance['width'] );
		$instance['height'] = strip_tags( $new_instance['height'] );
		$instance['number'] = strip_tags( $new_instance['number'] );
		$instance['scroll'] = strip_tags( $new_instance['scroll'] );
		$instance['title'] = strip_tags( $new_instance['title'] );
		$instance['url'] = strip_tags( $new_instance['url'] );
		$instance['restrict'] = strip_tags( $new_instance['restrict'] );
		return $instance;
	}

	public function widget( $args, $instance ) {
		extract( $args );
		$type= $instance['type'];
		$widget= $instance['widget'];
                if($instance['scroll'] == '1') $auto="true"; else $auto="false";
		echo $before_widget;
                echo $before_title . $instance['title'] . $after_title;
                $ran=rand(0,10000000);
		if (empty( $type ) || ($type == "select"))
                    echo "<div style='-webkit-border-radius: 3px;border-radius: 3px;border-width: 1px;border-style: solid;background-color: #FFEBE8;padding: 0 .6em;border-color: #C00;'><h2>Energyfolks Widget Error</h2><p>Please provide a 'type' in the widget options menu so that the correct content is displayed. </p></div>";
                else if (empty( $widget ) || ($widget == "widget"))
                    echo "<div style='-webkit-border-radius: 3px;border-radius: 3px;border-width: 1px;border-style: solid;background-color: #FFEBE8;padding: 0 .6em;border-color: #C00;'><h2>Energyfolks Widget Error</h2><p>Please provide a 'widget' view to display </p></div>";
                else {
                    if($instance['widget'] == 'vert') {
                        echo "<script language=javascript>
                            var EFWidget".$ran." = new EnergyFolks('".$type."');
                            EFWidget".$ran.".SetAffiliate(".get_option('energyfolks_affiliate_id').");";
                        if($instance['restrict'] == '1')
                            echo "EFWidget".$ran.".RestrictToAffiliate(".get_option('energyfolks_affiliate_id').");";
                        else if($instance['restrict'] == '2')
                            echo "EFWidget".$ran.".RestrictToHighlighted(".get_option('energyfolks_affiliate_id').");";
                        echo "EFWidget".$ran.".RecentPostsVertical(".$instance['width'].",".$instance['height'].",".$instance['number'].",".$auto.",'','".$instance['url']."');
                            </script>";
                    } else if($instance['widget'] == 'next5') {
                        echo "<script language=javascript>
                            var EFWidget".$ran." = new EnergyFolks('".$type."');
                            EFWidget".$ran.".SetAffiliate(".get_option('energyfolks_affiliate_id').");";
                        if($instance['restrict'] == '1')
                            echo "EFWidget".$ran.".RestrictToAffiliate(".get_option('energyfolks_affiliate_id').");";
                        else if($instance['restrict'] == '2')
                            echo "EFWidget".$ran.".RestrictToHighlighted(".get_option('energyfolks_affiliate_id').");";
                        echo "EFWidget".$ran.".NextFive(".$instance['width'].",'','".$instance['url']."');
                            </script>";
                    } else if($instance['widget'] == 'horiz') {
                        echo "<script language=javascript>
                            var EFWidget".$ran." = new EnergyFolks('".$type."');
                            EFWidget".$ran.".SetAffiliate(".get_option('energyfolks_affiliate_id').");";
                        if($instance['restrict'] == '1')
                            echo "EFWidget".$ran.".RestrictToAffiliate(".get_option('energyfolks_affiliate_id').");";
                        else if($instance['restrict'] == '2')
                            echo "EFWidget".$ran.".RestrictToHighlighted(".get_option('energyfolks_affiliate_id').");";
                        echo "EFWidget".$ran.".RecentPosts(".$instance['width'].",".$instance['height'].",".$instance['number'].",".$auto.",'','".$instance['url']."');
                            </script>";
                    } else {
                        echo "<script language=javascript>
                            var EFWidget".$ran." = new EnergyFolks('".$type."');
                            EFWidget".$ran.".SetAffiliate(".get_option('energyfolks_affiliate_id').");";
                        echo "EFWidget".$ran.".FeaturedUser('".$instance['url']."');
                            </script>";
                    }
                }
		echo $after_widget;
	}

}
add_action( 'widgets_init', create_function( '', 'register_widget( "energyfolks_Widget_Widget" );register_widget( "energyfolks_Search_Widget" );' ) );

add_action('init','energyfolks_init_check');
add_action('admin_init','energyfolks_init_vars');
add_action('admin_menu', 'energyfolks_remove_menus');
add_action('wp_before_admin_bar_render', 'energyfolks_remove_admin_bar_links' );
add_action('wp_authenticate', 'energyfolks_check_login',1,2 );
add_action('register_form', 'energyfolks_disable_function_register');
add_filter('login_errors','energyfolks_login_errors'); 
add_filter('login_message','energyfolks_auth_warning');

register_activation_hook( __FILE__, 'energyfolks_activate' );

/*
 * Custom update script
 */
require_once('updates.php');

/*
 * Blogs: action to call every time a blog post is saved
 */
function energyfolks_blog_integration( $post_id ) {
    global $EnergyFolks;
    //Verify this is a post 
    if(get_post_type($post_id) != 'post') return;
    //verify post is not a revision
    if (!wp_is_post_revision( $post_id ) ) {

        if((get_post_status($post_id) == 'publish') && (get_post_meta($post_id, '_energyfolks_share',true) != '0'))  { //Our post has just been published!
            $post_title = get_the_title( $post_id );
            $post_url = get_permalink( $post_id );
            $domain = site_url();
            $tags = wp_get_post_tags( $post_id, array( 'fields' => 'names' ) );
            $cats = wp_get_post_categories( $post_id, array( 'fields' => 'names' ) );
            $post_content= apply_filters('the_content',do_shortcode(get_post_field('post_content',$post_id)));
            $post_content = str_replace(array("src='/",'src="/',"href='/",'href="/'),array("src='".$domain."/",'src="'.$domain.'/',"href='".$domain."/",'href="'.$domain.'/'),$post_content);
            $post_content.="<div id='EnergyFolks_Post_Meta'> [TAGS]".serialize($tags)."[/TAGS][CATEGORIES]".serialize($cats)."[/CATEGORIES] </div>";
            //ping energyfolks with content...it will update if already in database.
            wp_remote_post( "https://www.energyfolks.com/blog/AddWordpressPost/".get_option('energyfolks_affiliate_id')."/".md5(get_option('energyfolks_secret').$post_id), array(
                    'method' => 'POST',
                    'timeout' => 45,
                    'redirection' => 5,
                    'httpversion' => '1.0',
                    'blocking' => true,
                    'headers' => array('user-agent' => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)'),
                    'body' => array( 'title' => $post_title, 'content' => $post_content, 'url'=>$post_url, 'post_id'=>$post_id,'owner_id'=>$EnergyFolks->userid),
                    'cookies' => array()
                )
            );
        } else {
            //post is not published.  Ping energyfolks to remove in case it was published and now has been reverted.
            $url="https://www.energyfolks.com/blog/FreezeWordpressPost/".get_option('energyfolks_affiliate_id')."/".$post_id."/".md5(get_option('energyfolks_secret').$post_id);
            wp_remote_request($url, array('headers' => array('user-agent' => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)')));
        }

    }

}
add_action( 'save_post', 'energyfolks_blog_integration',20);
/*
 * Blogs: Delete post integration as well
 */
function energyfolks_blog_delete( $post_id) {
    //Verify this is a post 
    if(get_post_type($post_id) != 'post') return;
    if (!wp_is_post_revision( $post_id ) ) {
        $url="https://www.energyfolks.com/blog/DeleteWordpressPost/".get_option('energyfolks_affiliate_id')."/".$post_id."/".md5(get_option('energyfolks_secret').$post_id);
        wp_remote_request($url, array('headers' => array('user-agent' => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)')));
    }
}
add_action( 'before_delete_post', 'energyfolks_blog_delete');
/*
 * Add the 'post to energyfolks' meta-box on the 'add a post' page
 */
function energyfolks_add_post_page_box() {
    add_meta_box( 
        'energyfolks_sectionid',
        'Share with Energyfolks',
        'energyfolks_post_box',
        'post','side','high'
    );
    add_meta_box(
        'energyfolks_sectionid',
        'Energyfolks Integration', 
        'energyfolks_page_box',
        'page','side','low'
    );
}
add_action( 'add_meta_boxes', 'energyfolks_add_post_page_box' );
/* 
 * The content of the custom box
 */
function energyfolks_post_box( $post ) {

  // Use nonce for verification
  wp_nonce_field( plugin_basename( __FILE__ ), 'energyfolks_nonce' );
  // The actual fields for data entry
  echo "<img src='https://images.energyfolks.com/resourceimage/PartnerPic0.png'><BR>";
  echo '<label><div style="float:left;height:50px;padding-right:5px;"><input type=checkbox value="1" id="energyfolks_share" name="energyfolks_share" ';
  if(get_post_meta($post->ID, '_energyfolks_share',true) != '0') echo "checked";
  echo "></div>Share this post with other groups through the Energyfolks network</label>";
}
function energyfolks_page_box($post) {
    echo "<h4>energyfolk shortcodes</h4>Use energyfolks shortcodes to integrate energyfolks content into this page.  Copy the shortcode into the body of the page, and it will be replaced by the correct energyfolks content.
          <ul style='margin-left:20px;list-style:disc outside none;'>
          <li><b>[energyfolks type='<i>display_type</i>']</b><BR>Show an energyfolks view on your site (such as 'calendar', 'jobs', or 'users').</li>
          <li><b>[energyfolks_searchbar type='<i>post_type</i>']</b><BR>Create the filter bar (or use the widget and drop that onto your sidebar)</li>
          <li><b>[energyfolks_logged_in] TEXT [/energyfolks_logged_in]</b><BR>Text to show a logged in user</li>
          <li><b>[energyfolks_logged_out] TEXT [/energyfolks_logged_out]</b><BR>Text to show a logged out user</li></ul>View the full list of shortcodes and full document on our <a href='https://www.energyfolks.com/developer/wordpress.php' target='_blank'>Wordpress developer page</a>.";
}

function energyfolks_save_postdata( $post_id ) {
  // verify if this is an auto save routine. 
  // If it is our form has not been submitted, so we dont want to do anything
  if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) 
      return;
  // verify this came from the our screen and with proper authorization,
  // because save_post can be triggered at other times
  if ( !wp_verify_nonce( $_POST['energyfolks_nonce'], plugin_basename( __FILE__ ) ) )
      return;
  // Check permissions
  if ( 'post' == $_POST['post_type'] ) 
  {
    if ( !current_user_can( 'edit_post', $post_id ) )
        return;
  }
  else return;

  // OK, we're authenticated: we need to find and save the data
  $mydata = $_POST['energyfolks_share'];
  delete_post_meta($post_id, '_energyfolks_share');
  if($mydata == '1')
    add_post_meta($post_id, '_energyfolks_share', '1');
  else
    add_post_meta($post_id, '_energyfolks_share', '0');
}
add_action( 'save_post', 'energyfolks_save_postdata', 9 );

/*
 * Add the custom energyfolks menu to the dashboard
 */
add_action('admin_menu', 'energyfolks_register_custom_menu_page');
function energyfolks_register_custom_menu_page() {
    add_menu_page( "Energyfolks", "Energyfolks", 'administrator', 'energyfolks', 'energyfolks_display_menu_main', plugin_dir_url( __FILE__ )."icon.png", 57 );
}
function energyfolks_display_menu_main() {
    include(dirname( __FILE__ ) . '/SettingsPage.php');
}
