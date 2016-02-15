<?php
/*
Plugin Name: Energyfolks tools
Plugin URI: http://www.energyfolks.com/developers/wordpress
Description: Add energyfolks tools to your wordpress site, and use energyfolks as the primary authenticator for your site.
Version: 2.12
Author: Brentan Alexander
Author URI: http://www.energyfolks.com

    Copyright 2013 Brentan Alexander (on behalf of energyfolks)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
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
 * 
 */

 /*
  * SESSIONS
  */
if( ! defined( 'WP_SESSION_COOKIE' ) )
    define( 'WP_SESSION_COOKIE', '_ef_session' );

if ( ! class_exists( 'Recursive_ArrayAccess' ) ) {
    require_once( 'RecursiveArray.php' );
}

// Only include the functionality if it's not pre-defined.
if ( ! class_exists( 'WP_Session' ) ) {
    require_once( 'ClassWPsession.php' );
    require_once( 'WPsession.php' );
}


/*
 * Register my variables in the system
 */
function energyfolks_activate() {
    add_option('energyfolks_affiliate_id',"");
    add_option('energyfolks_secret',"");
    add_option('energyfolks_topmenu',"1");
    add_option('energyfolks_color','');
    add_option('energyfolks_plugin_enabled',"0");
    add_option('energyfolks_js_hash','');
    add_option('energyfolks_css_hash','');
}
/*
 * Load vars for admin control pages
 */
function energyfolks_init_vars() {
    register_setting("energyfolks",'energyfolks_affiliate_id');
    register_setting("energyfolks",'energyfolks_secret');
    register_setting("energyfolks",'energyfolks_topmenu');
    register_setting("energyfolks",'energyfolks_color');
    register_setting("energyfolks",'energyfolks_plugin_enabled');
    register_setting("energyfolks",'energyfolks_js_hash');
    register_setting("energyfolks",'energyfolks_css_hash');
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
wp_enqueue_script("EnergyFolks","https://www.energyfolks.com/assets/energyfolks-".get_option('energyfolks_js_hash').".js");
wp_enqueue_style("EnergyFolks","https://www.energyfolks.com/assets/energyfolks-".get_option('energyfolks_css_hash').".css");

/*
 * Function will ping energyfolks for a login if user is not currently recognized, or show top admin bar if they are logged in
 */
function energyfolks_TestForLogin() {
    $wp_session = WP_Session::get_instance();
    if(get_option('energyfolks_plugin_enabled') != '1') return;
    echo "<script language=javascript>
        EnergyFolks.id=".get_option('energyfolks_affiliate_id').";
        EnergyFolks.color='".get_option('energyfolks_color')."';";
    if(!$wp_session['energyfolks_logged']) echo "EnergyFolks.forceLogin = true;";
        echo "EnergyFolks.callbackURL = '/';
    </script>";
}
add_action('wp_footer', 'energyfolks_TestForLogin');
add_action('admin_footer', 'energyfolks_TestForLogin');

/*
 * Prefill energyfolks variables, if a login ping is detected, talk to energyfolks
 * and authenticate the user
 */
function energyfolks_init_check() { 
    global $EnergyFolks;
    $wp_session = WP_Session::get_instance();
    if (!isset($EnergyFolks)) $EnergyFolks = new STDClass();
    if (!session_id()) {
        session_start();
    }
    if($_GET['enfolks_logout'] != "") {
        $wp_session['energyfolks_logged']=false;
	wp_clear_auth_cookie();
        header("Content-type: text/javascript"); echo "window.location.reload();";exit();
    }
    if($wp_session['energyfolks_logged']) {
        $EnergyFolks->logged=true;
        $EnergyFolks->userid=$wp_session['energyfolks_userid'];
        $EnergyFolks->user_details=$wp_session['energyfolks_details'];
    } else 
        $EnergyFolks->logged=false;
    if($_GET['enfolks_update'] != "") {
        update_option('energyfolks_color',$_GET['color']);
        update_option('energyfolks_js_hash',$_GET['js_hash']);
        update_option('energyfolks_css_hash',$_GET['css_hash']);
        die("COMPLETE");
    }
    if($_GET['enfolks_sync'] != "") {
        update_option('energyfolks_affiliate_id',$_GET['enfolks_sync']);
        update_option('energyfolks_secret',$_GET['secret']);
        update_option('energyfolks_color',$_GET['color']);
        update_option('energyfolks_js_hash',$_GET['js_hash']);
        update_option('energyfolks_css_hash',$_GET['css_hash']);
        update_option('energyfolks_plugin_enabled',"1");
        die("COMPLETE");
    }
    if($_GET['enfolks_hash'] != "") {
        $secret=get_option('energyfolks_secret');
        //Login hash received, check for user access rights
        $url = "https://www.energyfolks.com/users/from_hash?hash=".$_GET['enfolks_hash']."&secret=".md5($secret.$_GET['enfolks_hash'])."&aid=".get_option('energyfolks_affiliate_id');
        $response = wp_remote_request($url, array('headers' => array('user-agent' => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)')));
        if ( is_wp_error( $response ) )
            { header("Content-type: text/javascript"); echo "alert('There was an error contacting energyfolks: ".$response->get_error_message()."');";exit(); } 
        if ( 200 != $response['response']['code'] )
            { header("Content-type: text/javascript"); echo "alert('There was an error on the energyfolks server.  Please try your request again later.');";exit(); }
        if($response['body'] == 'badsecret') { update_option('energyfolks_plugin_enabled',"0"); header("Content-type: text/javascript"); echo "alert('There was an error with the secret passed to energyfolks by this server.  Please contact the server admins.');";exit(); }
        $returned_data = json_decode($response['body'],true);
        //Successful login! Set variables
        $wp_session['energyfolks_logged']=true;
        $savedata=$returned_data;
        unset($savedata['pass']);
        unset($savedata['role']);
        $wp_session['energyfolks_userid']=$savedata['user_id'];
        $wp_session['energyfolks_details']=$savedata;
        $EnergyFolks->logged=true;
        $EnergyFolks->userid=$wp_session['energyfolks_userid'];
        $EnergyFolks->user_details=$wp_session['energyfolks_details'];
        
        if($returned_data['role']=='0') { header("Content-type: text/javascript"); echo "window.location.reload();";exit(); }
        //User is also a wordpress admin...
        $userarray['user_login'] = $returned_data['user'];
        $userarray['user_pass'] = $returned_data['pass'];                    
        $userarray['first_name'] = $returned_data['first_name'];
        $userarray['last_name'] = $returned_data['last_name'];
        //$userarray['user_email'] = $returned_data['email'];
        $userarray['display_name'] = $userarray['first_name']." ".$userarray['last_name'];     
        if($returned_data['role'] == '1')
            $userarray['role']="contributor"; 
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
function energyfolks_logout() {
    $wp_session = WP_Session::get_instance();
    if(get_option('energyfolks_plugin_enabled') != '1') return;
    $wp_session['energyfolks_logged']=false;
    $wp_session['energyfolks_blog_error'] = "<script language=javascript>
        window.location.href = EnergyFolks.server_url + '/users/logout?'+EnergyFolks.urlhash()+'&aid=" . get_option('energyfolks_affiliate_id') . "&no_callback=true';
            </script>";
}
add_action('wp_logout', 'energyfolks_logout');

/*
 * Disable functions.  Idea taken from http auth plugin.
 */
function energyfolks_disable_function_register() {
        if (get_option('energyfolks_plugin_enabled') != '1') return;
	$errors = new WP_Error();
	$errors->add('registerdisabled', __('User registration is not available from this site, so you can\'t create an account or retrieve your password from here. See the message above.'));
	?></form><br /><div id="login_error">User registration is not available from this site, so you can't create an account or retrieve your password from here. See the message above.</div>
		<p id="backtoblog"><a href="<?php bloginfo('url'); ?>/" title="<?php _e('Are you lost?') ?>"><?php printf(__('&larr; Back to %s'), get_bloginfo('title', 'display' )); ?></a></p>
	<?php
	exit();
}


//gives warning for login - where to get "source" login
function energyfolks_auth_warning() {
   if (get_option('energyfolks_plugin_enabled') != '1') return;
   echo "<p class=\"message\">Access to the wordpress administrator dashboard is controlled through energyfolks.  To login to the wordpress dashoard, <a href='/' >go to the homepage</a> and login to your energyfolks account.  This will automatically log you in to wordpress, and you can then use the links at the top of the page to access the dashboard.</p>";
}
//Stop logins if a direct login of an EF created user is found
function energyfolks_check_login($username,$password) {
    if(strpos(" ".$username,"EnergyfolksUser") == 1) return;
}
function energyfolks_login_errors() {
    if (get_option('energyfolks_plugin_enabled') != '1') return;
    return "<strong>ERROR:</strong> Please login through energyfolks and return to this screen.  Access is controlled via energyfolks.";
}
//Remove comments menu from admin dashboard, as these are made irrelevant by this plugin
function energyfolks_remove_menus () {
    global $menu;
    //$restricted = array(__('Dashboard'), __('Posts'), __('Media'), __('Links'), __('Pages'), __('Appearance'), __('Tools'), __('Users'), __('Settings'), __('Comments'), __('Plugins'));
    if(get_option('energyfolks_plugin_enabled') == '1') {
        $restricted = array( __('Comments'));
        end ($menu);
        while (prev($menu)){
                $value = explode(' ',$menu[key($menu)][0]);
                if(in_array($value[0] != NULL?$value[0]:"" , $restricted)){unset($menu[key($menu)]);}
        }
    }
    //Register our control menu
    add_options_page("Energyfolks settings", "Energyfolks plugin", "manage_options", "enegyfolks","energyfolks_display_options");
}

//Remove comments/users links in the admin bar at the top of pages
function energyfolks_remove_admin_bar_links() {
	global $wp_admin_bar;
        if(get_option('energyfolks_plugin_enabled') == '1') {
            $wp_admin_bar->remove_menu('my-account');
            $wp_admin_bar->remove_menu('new-content'); // Replaced with custom new content pulldown
            $wp_admin_bar->remove_menu('comments');
        }
}
function energyfolks_admin_notice(){
    global $pagenow;
    $wp_session = WP_Session::get_instance();
    if ((get_option('energyfolks_plugin_enabled') == '1') && (( $pagenow == 'users.php' ) || ( $pagenow == 'user-edit.php' ) || ( $pagenow == 'user-new.php' ) || ( $pagenow == 'profile.php' ))) {
         echo '<div class="error">
             <h2>Notice: User rights linked to energyfolks</h2><p>You can use this page to create additional wordpress-only users that can access this system.</p><p>Please note that access rights are also granted through Energyfolks automatically.  These users will have a username of EnergyfolksUser_## in the list below.  Deleting/Altering these automatically created users here will have no effect, as they will be recreated or updated when the user next logs in.  To remove access for an energyfolks user, please use the energyfolks user interface by clicking the <i>energyfolks</i> link at the top left of the screen.</p>
         </div>';
    } elseif ($wp_session['energyfolks_blog_error'] != '') {
        echo '<div class="error">'.$wp_session['energyfolks_blog_error'] .'</div>';
        $wp_session['energyfolks_blog_error'] = null;
    } elseif (get_option('energyfolks_plugin_enabled') != '1') {         
        echo '<div class="error">
             <h2>Setup the EnergyFolks plugin</h2><p>Welcome to EnergyFolks!  To finish plugin installation, please synchronize the plugin with the energyfolks server by <a href="https://www.energyfolks.com/developers/wordpress_sync?return_url=' . urlencode(get_site_url()) . '">clicking here</a>.</p>
         </div>';
    }
}
add_action('admin_notices', 'energyfolks_admin_notice');
//Add energyfolks links to the top admin bar
function energyfolks_add_sumtips_admin_bar_link() {
	global $wp_admin_bar, $current_user, $EnergyFolks;
        if(get_option('energyfolks_plugin_enabled') != '1') return;
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
    if(get_option('energyfolks_plugin_enabled') != '1') return;
    if(comments_open())
        echo "<script language=javascript> 
                document.write(EnergyFolks.Comments_HTML('" . str_replace(get_the_title($post->ID),"'","") . "', 'WORDPRESS_HASH_".get_option('energyfolks_affiliate_id')."_".$post->ID."',true));
            </script>";
    return dirname( __FILE__ ) . '/comments.php'; //Return a blank page to override default comment page
}
add_filter('comments_template','energyfolks_comments_display',100);
/*
 * Shortcode for energyfolks content
 */
function energyfolks_shortcode($atts) {
     $atts=shortcode_atts(array(
	      'source' => '0',
              'type' => '0',
	      'format' => 'list',
              'latitude' => '0',
              'longitude' => '0',
              'radius' => '0',
              'restricttoaffiliate' => '0',
              'restricttohighlighted' => '0',
              'color' => get_option('energyfolks_color'),
     ), $atts);
     if($atts['source'] == '0')
         $atts['source'] = $atts['type'];
     if($atts['source'] == '0') 
         return "<div style='-webkit-border-radius: 3px;border-radius: 3px;border-width: 1px;border-style: solid;background-color: #FFEBE8;padding: 0 .6em;border-color: #C00;'><h2>Energyfolks Misconfiguration</h2><p>Please provide a 'source' in your energyfolks shortcode to generate a valid display.</p><i>Example: [energyfolks source='jobs']</i></div>";
     $returnText='';
     $pid=get_option('energyfolks_affiliate_id'); 
     if(($atts['setcolor'] == '0') && (current_user_can('editor') || current_user_can('administrator')))
         $returnText.= "<div style='-webkit-border-radius: 3px;border-radius: 3px;border-width: 1px;border-style: solid;background-color: lightYellow;padding: 0 .6em;border-color: #E6DB55;'><h2>Energyfolks Missconfiguration</h2><p>Your groups custom color has not loaded properly.  Please re-synchronize with the energyfolks server.<p>This message is only visible to site administrators</p></div>";
     $returnText.="<script language=javascript>
         EnergyFolks.id = ".$pid.";"; 
     if($atts['latitude'] != '0')
          $returnText.="EnergyFolks.map_location_lat = ".$atts['latitude'].";";
     if($atts['longitude'] != '0')
          $returnText.="EnergyFolks.map_location_lng = ".$atts['longitude'].";";
     if($atts['radius'] != '0')
          $returnText.="EnergyFolks.map_location_radius = ".$atts['radius'].";";
     if($atts['restricttoaffiliate'] != '0')
          $returnText.="EnergyFolks.source_restrict = EnergyFolks.AFFILIATE_ONLY;";
     if($atts['restricttohighlighted'] != '0')
          $returnText.="EnergyFolks.source_restrict = EnergyFolks.HIGHLIGHTED_ONLY;";
     if($atts['color'] != '0')
          $returnText.="EnergyFolks.color = '".$atts['color']."';";
     $returnText.="
        EnergyFolks.showPage({ source: '".$atts['source']."', format: '" . $atts['format'] . "'}); 
        </script>";
     return $returnText;
}
add_shortcode('energyfolks', 'energyfolks_shortcode'); //backwards compatibility
add_shortcode('energyfolks_showpage', 'energyfolks_shortcode');
/* 
 * Shortcode for the sidebar...can be used instead of the widget if desired
 */

function energyfolks_sidebar_shortcode($atts) {
     return "<script language=javascript>
                EnergyFolks.Sidebar();
            </script>";
}
add_shortcode('energyfolks_searchbar', 'energyfolks_sidebar_shortcode'); //backwards compatibility
add_shortcode('energyfolks_sidebar', 'energyfolks_sidebar_shortcode');
/*
 * Login shortcodes
 * energyfolks_LoginBox: display the login page.  A profile box is returned if user is logged in
 * energyfolks_ProfileBox: Display a box with user information if logged in, otherwise nothing happens
 * energyfolks_smalllogin: display 2 lines of output if logged in or not
 */

function energyfolks_login_shortcode() {
    global $EnergyFolks;
    if($EnergyFolks->logged) return '';
    return "<script language=javascript>
        EnergyFolks.LoginBox();
            </script>";
}

function energyfolks_login_box() {
    return "<script language=javascript>
        EnergyFolks.LoginBox();
            </script>";
}
add_shortcode('energyfolks_loginbox', 'energyfolks_login_box'); 
add_shortcode('energyfolks_produceloginpage', 'energyfolks_login_shortcode'); //backwards compatibility
function energyfolks_profile_box_shortcode() {
    global $EnergyFolks;
    if(!$EnergyFolks->logged) return '';
    return "<script language=javascript>
        EnergyFolks.LoginBox();
            </script>";
}
add_shortcode('energyfolks_createprofilebox', 'energyfolks_profile_box_shortcode'); //backwards compatibility
function energyfolks_loginsmall_shortcode() {
    global $EnergyFolks;
    if($EnergyFolks->logged) return '';
    return "<script language=javascript>
        EnergyFolks.SmallLoginBox();
            </script>";
}
function energyfolks_smallloginbox_shortcode() {
    return "<script language=javascript>
        EnergyFolks.SmallLoginBox();
            </script>";
}
add_shortcode('energyfolks_smallloginbox', 'energyfolks_smallloginbox_shortcode');
add_shortcode('energyfolks_small_login', 'energyfolks_loginsmall_shortcode'); //backwards compatibility

function energyfolks_loginlinks_shortcode() {
    return "<script language=javascript>
        EnergyFolks.LoginLinks();
            </script>";
}

add_shortcode('energyfolks_loginlinks', 'energyfolks_loginlinks_shortcode');
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
     $atts=shortcode_atts(array(
	      'restricttoaffiliate' => '1'
     ), $atts);
     if($atts['restricttoaffiliate']!='1') {
        if(!$EnergyFolks->logged) return '';
     } else {
        if(!$EnergyFolks->logged) return '';
        if(!(($EnergyFolks->user_details['member'] === true) || ($EnergyFolks->user_details['member'] == 'true'))) return '';
     }
     return do_shortcode($content);
}
add_shortcode("energyfolks_logged_in",'energyfolks_logged_in_tag');
function energyfolks_logged_out_tag($atts,$content=null) {
    global $EnergyFolks;
     $atts=shortcode_atts(array(
	      'restricttoaffiliate' => '1'
     ), $atts);
     if($atts['restricttoaffiliate']!='1') {
        if($EnergyFolks->logged) return '';
     } elseif($EnergyFolks->logged) {
        if(($EnergyFolks->user_details['member'] === true) || ($EnergyFolks->user_details['member'] == 'true')) return '';
     }
     return do_shortcode($content);
}
add_shortcode("energyfolks_logged_out",'energyfolks_logged_out_tag');


/*
 * Create the energyfolks sidebar search box widget
 */
class energyfolks_Search_Widget extends WP_Widget {

	public function __construct() {
		parent::__construct(
	 		'energyfolks_Search_Widget', // Base ID
			'EnergyFolks Filter Panel', // Name
			array( 'description' => __( 'add the energyfolks filter bar to the side of a page.  When used in conjunction with the [energyfolks] shortcode on a page, it creates the filters for that EF page where this widget is placed.  If this widget is not used, filters are instead added just under the search box on EF powered pages.  If the [energyfolks] shortcode isnt present on a page, this widget will be empty.', 'text_domain' ), ) // Args
		);
	}

 	public function form( $instance ) {
	}

	public function update( $new_instance, $old_instance ) {
		$instance = array();
		return $instance;
	}

	public function widget( $args, $instance ) {
		extract( $args );
		echo $before_widget;
                echo $before_title  . $after_title;
                echo "<script language=javascript>
                         EnergyFolks.Sidebar();
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
			array( 'description' => __( 'Add a energyfolks widget to your page.  The widget shows energyfolks content, such as recent jobs or upcoming events, in a small viewbox', 'text_domain' ), ) // Args
		);
	}

 	public function form( $instance ) {
		if ( isset( $instance[ 'type' ] ) ) {
			$type = $instance[ 'type' ];
		}
		else {
			$type = __( 'select', 'text_domain' );
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
		if ( isset( $instance[ 'title' ] ) ) {
			$title = $instance[ 'title' ];
		}
		else {
			$title = __( '', 'text_domain' );
		}
		if ( isset( $instance[ 'restrict' ] ) ) {
			$restrict = $instance[ 'restrict' ];
		}
		else {
			$restrict = __( '0', 'text_domain' );
		}
		?>
		<p>
                    
		<?php _e( 'Content Type:' ); ?>
                <select class="widefat" id="<?php echo $this->get_field_id( 'type' ); ?>" name="<?php echo $this->get_field_name( 'type' ); ?>" >
                    <option value="select" <?php if($type == 'select') echo 'selected';?>>Select a Type</option>
                    <option value="calendar" <?php if($type == 'calendar') echo 'selected';?>>Calendar</option>
                    <option value="jobs" <?php if($type == 'jobs') echo 'selected';?>>Jobs</option>
                    <option value="bulletins" <?php if($type == 'bulletins') echo 'selected';?>>Discussions</option>
                    <option value="blog" <?php if($type == 'blog') echo 'selected';?>>Blogs</option>
                </select>
		</p>
                Title: <input type="text"  id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" value="<?php echo $title;?>"><BR>
                Height: <input type="text"  id="<?php echo $this->get_field_id( 'height' ); ?>" name="<?php echo $this->get_field_name( 'height' ); ?>" value="<?php echo $height;?>" size="5">px<BR>
                Items to show: <input type="text"  id="<?php echo $this->get_field_id( 'number' ); ?>" name="<?php echo $this->get_field_name( 'number' ); ?>" value="<?php echo $number;?>" size="5"><BR>
 
                <label><input type="radio" id="<?php echo $this->get_field_id( 'restrict' ); ?>" name="<?php echo $this->get_field_name( 'restrict' ); ?>" value="0" <?php if($restrict == "0") echo "checked";?>> Show All Posts</label><BR>
                <label><input type="radio" id="<?php echo $this->get_field_id( 'restrict' ); ?>" name="<?php echo $this->get_field_name( 'restrict' ); ?>" value="1" <?php if($restrict == "1") echo "checked";?>> Show Your Group's Posts</label><BR>
                <label><input type="radio" id="<?php echo $this->get_field_id( 'restrict' ); ?>" name="<?php echo $this->get_field_name( 'restrict' ); ?>" value="2" <?php if($restrict == "2") echo "checked";?>> Show Your Group's Highlighted Posts</label>
                <?php
                echo "<BR><BR>";
	}

	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['type'] = strip_tags( $new_instance['type'] );
		$instance['height'] = strip_tags( $new_instance['height'] );
		$instance['number'] = strip_tags( $new_instance['number'] );
		$instance['title'] = strip_tags( $new_instance['title'] );
		$instance['restrict'] = strip_tags( $new_instance['restrict'] );
		return $instance;
	}

	public function widget( $args, $instance ) {
		extract( $args );
		$type= $instance['type'];
		echo $before_widget;
                echo $before_title . $instance['title'] . $after_title;
		if (empty( $type ) || ($type == "select"))
                    echo "<div style='-webkit-border-radius: 3px;border-radius: 3px;border-width: 1px;border-style: solid;background-color: #FFEBE8;padding: 0 .6em;border-color: #C00;'><h2>Energyfolks Widget Error</h2><p>Please provide a 'type' in the widget options menu so that the correct content is displayed. </p></div>";
                else {
                    echo "<script language=javascript>
                        EnergyFolks.id = ".get_option('energyfolks_affiliate_id').";
                        EnergyFolks.showWidget('".$type."', {";
                    if($instance['restrict'] == '1')
                        echo "affiliate_only: true, ";
                    else if($instance['restrict'] == '2')
                        echo "highlighted_only: true, ";
                    echo "items: " . $instance['number'] . ", ";
                    echo "item_height: " . floor(($instance['height']*1) / ($instance['number']*1)) . ", ";
                    echo "title: ''";
                    echo "});
                        </script>";
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
    $wp_session = WP_Session::get_instance();
    if(get_option('energyfolks_plugin_enabled') != '1') return;
    //Verify this is a post 
    if(get_post_type($post_id) != 'post') return;
    //verify post is not a revision
    if (!wp_is_post_revision( $post_id ) ) {

        if((get_post_status($post_id) == 'publish') && (get_post_meta($post_id, '_energyfolks_share',true) != '0'))  { //Our post has just been published!
            $post_title = get_the_title( $post_id );
            $post_url = get_permalink( $post_id );
            $domain = site_url();
            $tags = wp_get_post_tags( $post_id, array( 'fields' => 'names' ) );
            $post_content = str_replace(array("src='/",'src="/',"href='/",'href="/'),array("src='".$domain."/",'src="'.$domain.'/',"href='".$domain."/",'href="'.$domain.'/'),apply_filters('the_content',do_shortcode(get_post_field('post_content',$post_id))));
            //ping energyfolks with content...it will update if already in database.
            $response = wp_remote_post( "https://www.energyfolks.com/blogs/AddWordpressPost?aid=".get_option('energyfolks_affiliate_id')."&hash=".md5(get_option('energyfolks_secret').$post_id), array(
                    'method' => 'POST',
                    'timeout' => 45,
                    'redirection' => 5,
                    'httpversion' => '1.0',
                    'blocking' => true,
                    'headers' => array('user-agent' => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)'),
                    'body' => array( 'announce'=> (get_post_meta($post_id, '_energyfolks_announce',true) == '1'), 'digest' => (get_post_meta($post_id, '_energyfolks_digest',true) == '1'), 'title' => $post_title, 'tags' => implode(",",$tags), 'content' => $post_content, 'url'=>$post_url, 'post_id'=>$post_id,'owner_id'=>$EnergyFolks->userid),
                    'cookies' => array()
                )
            );
            if ( is_wp_error( $response ) )
                $wp_session['energyfolks_blog_error'] =  "<h2>There was an error saving information to energyfolks</h2>".$response->get_error_message();
            elseif(trim($response['body']) != '')
                $wp_session['energyfolks_blog_error'] =  "<h2>There was an error saving information to energyfolks</h2>".$response['body'];
        } else {
            //post is not published.  Ping energyfolks to remove in case it was published and now has been reverted.
            $url="https://www.energyfolks.com/blogs/FreezeWordpressPost?aid=".get_option('energyfolks_affiliate_id')."&post_id=".$post_id."&hash=".md5(get_option('energyfolks_secret').$post_id);
            $response = wp_remote_request($url, array('headers' => array('user-agent' => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)')));
            if ( is_wp_error( $response ) )
                $wp_session['energyfolks_blog_error'] =  "<h2>There was an error saving information to energyfolks</h2>".$response->get_error_message();
            elseif(trim($response['body']) != '')
                $wp_session['energyfolks_blog_error'] =  "<h2>There was an error saving information to energyfolks</h2>".$response['body'];
        }

    }

}
add_action( 'save_post', 'energyfolks_blog_integration',20);
/*
 * Blogs: Delete post integration as well
 */
function energyfolks_blog_delete( $post_id) {
    $wp_session = WP_Session::get_instance();
    //Verify this is a post 
    if(get_option('energyfolks_plugin_enabled') != '1') return;
    if(get_post_type($post_id) != 'post') return;
    if (!wp_is_post_revision( $post_id ) ) {
        $url="https://www.energyfolks.com/blogs/DeleteWordpressPost?aid=".get_option('energyfolks_affiliate_id')."&post_id=".$post_id."&hash=".md5(get_option('energyfolks_secret').$post_id);
        $response = wp_remote_request($url, array('headers' => array('user-agent' => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)')));
        if ( is_wp_error( $response ) )
            $wp_session['energyfolks_blog_error'] =  "<h2>There was an error saving information to energyfolks</h2>".$response->get_error_message();
        elseif(trim($response['body']) != '')
            $wp_session['energyfolks_blog_error'] = "<h2>There was an error saving information to energyfolks</h2>".$response['body'];
    }
}
add_action( 'before_delete_post', 'energyfolks_blog_delete');
/*
 * Add the 'post to energyfolks' meta-box on the 'add a post' page
 */
function energyfolks_add_post_page_box() {
    if(get_option('energyfolks_plugin_enabled') != '1') return;
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
  if(get_option('energyfolks_plugin_enabled') != '1') return;

  // Use nonce for verification
  wp_nonce_field( plugin_basename( __FILE__ ), 'energyfolks_nonce' );
  // The actual fields for data entry
  echo "<img src='https://www.energyfolks.com/assets/ef_logo_white.png'><BR>";
  echo '<label><div style="float:left;height:50px;padding-right:5px;"><input type=checkbox value="1" id="energyfolks_share" name="energyfolks_share" ';
  if(get_post_meta($post->ID, '_energyfolks_share',true) != '0') echo "checked";
  echo "></div>Share this post with other groups through the Energyfolks network</label>";
  if(current_user_can('publish_posts')) { //ONLY AUTHORS CAN DO THIS!
    echo '<div style="clear: left;"></div><label><div style="float:left;height:50px;padding-right:5px;"><input type=checkbox value="1" id="energyfolks_announce" name="energyfolks_announce" ';
    if(get_post_meta($post->ID, '_energyfolks_announce',true) == '1') echo "checked";
    echo "></div>Immediately send via email to your group members (above 'share' checkbox must also be checked)</label>";
    echo '<div style="clear: left;"></div><label><div style="float:left;height:50px;padding-right:5px;"><input type=checkbox value="1" id="energyfolks_digest" name="energyfolks_digest" ';
    if(get_post_meta($post->ID, '_energyfolks_digest',true) == '1') echo "checked";
    echo "></div>Add this to the top of the next automated digest (above 'share' checkbox must also be checked)</label>";
  }
  echo "<h4>Post Analytics</h4>";
  echo "<a href='#' class='EnergyFolks_popup' data-command='blogs/analytics?aid=".get_option('energyfolks_affiliate_id')."&id=".($post->ID)."' data-iframe='true'>View Post Analytics</a>";
}
function energyfolks_page_box($post) {
    if(get_option('energyfolks_plugin_enabled') != '1') return;
    echo "<h4>energyfolk shortcodes</h4>Use energyfolks shortcodes to integrate energyfolks content into this page.  Copy the shortcode into the body of the page, and it will be replaced by the correct energyfolks content.
          <ul style='margin-left:20px;list-style:disc outside none;'>
          <li><b>[energyfolks source='<i>display_type</i>']</b><BR>Show an energyfolks view on your site (such as 'events', 'jobs', or 'users').</li>
          <li><b>[energyfolks_sidebar]</b><BR>Create the filter bar (or use the widget and drop that onto your sidebar)</li>
          <li><b>[energyfolks_logged_in] TEXT [/energyfolks_logged_in]</b><BR>Text to show a logged in user</li>
          <li><b>[energyfolks_logged_out] TEXT [/energyfolks_logged_out]</b><BR>Text to show a logged out user</li></ul>View the full list of shortcodes and full document on our <a href='https://www.energyfolks.com/developers/wordpress' target='_blank'>Wordpress developer page</a>.";
}

function energyfolks_save_postdata( $post_id ) {
  if(get_option('energyfolks_plugin_enabled') != '1') return;
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
  if(current_user_can('publish_posts')) {
    $mydata = $_POST['energyfolks_announce'];
    delete_post_meta($post_id, '_energyfolks_announce');
    if($mydata == '1')
      add_post_meta($post_id, '_energyfolks_announce', '1');
    else
      add_post_meta($post_id, '_energyfolks_announce', '0');
    $mydata = $_POST['energyfolks_digest'];
    delete_post_meta($post_id, '_energyfolks_digest');
    if($mydata == '1')
      add_post_meta($post_id, '_energyfolks_digest', '1');
    else
      add_post_meta($post_id, '_energyfolks_digest', '0');
  }
}
add_action( 'save_post', 'energyfolks_save_postdata', 9 );

/*
 * Add the custom energyfolks menu to the dashboard
 */
add_action('admin_menu', 'energyfolks_register_custom_menu_page');
function energyfolks_register_custom_menu_page() {
    add_menu_page( "Energyfolks", "Energyfolks", 'edit_posts', 'energyfolks', 'energyfolks_display_menu_main', plugin_dir_url( __FILE__ )."icon.png", 57 );
}
function energyfolks_display_menu_main() {
    include(dirname( __FILE__ ) . '/SettingsPage.php');
}
