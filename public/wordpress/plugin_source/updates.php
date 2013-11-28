<?php

/*
// TEMP: Enable update check on every request. Normally you don't need this! This is for testing only!
// NOTE: The 
//	if (empty($checked_data->checked))
//		return $checked_data; 
// lines will need to be commented in the check_for_plugin_update function as well.

set_site_transient('update_plugins', null);

// TEMP: Show which variables are being requested when query plugin API
add_filter('plugins_api_result', 'aaa_result', 10, 3);
function aaa_result($res, $action, $args) {
	print_r($res);
	return $res;
}
// NOTE: All variables and functions will need to be prefixed properly to allow multiple plugins to be updated
*/


$ef_api_url = 'http://dev.energyfolks.com:3000/developers/update_check';
$ef_plugin_slug = 'energyfolks';


// Take over the update check
add_filter('pre_set_site_transient_update_plugins', 'ef_check_for_plugin_update');

function ef_check_for_plugin_update($checked_data) {
	global $ef_api_url, $ef_plugin_slug;
	
	//Comment out these two lines during testing.
	//if (empty($checked_data->checked))
	//	return $checked_data;
	
	$args = array(
		'slug' => $ef_plugin_slug,
		'version' => $checked_data->checked[$ef_plugin_slug .'/'. $ef_plugin_slug .'.php'],
	);
	$request_string = array(
			'body' => array(
				'r_action' => 'basic_check',
				'affiliate_id' => get_option('energyfolks_affiliate_id'),
				'request' => serialize($args),
				'api-key' => md5(get_bloginfo('url'))
			),
			'user-agent' => 'WordPress/' . $wp_version . '; ' . get_bloginfo('url')
		);
	
	// Start checking for an update
	$raw_response = wp_remote_post($ef_api_url, $request_string);
	
	if (!is_wp_error($raw_response) && ($raw_response['response']['code'] == 200))
		$response = ef_array_to_object(unserialize($raw_response['body']));
	
	if (is_object($response) && !empty($response)) // Feed the update data into WP updater
		$checked_data->response[$ef_plugin_slug .'/'. $ef_plugin_slug .'.php'] = $response;
        return $checked_data;
}


// Take over the Plugin info screen
add_filter('plugins_api', 'ef_plugin_api_call', 10, 3);

function ef_plugin_api_call($def, $action, $args) {
	global $ef_plugin_slug, $ef_api_url;
	if (($args->slug != $ef_plugin_slug) && ($args->slug != ''))
		return false;
	// Get the current version
	$plugin_info = get_site_transient('update_plugins');
	$current_version = $plugin_info->checked[$ef_plugin_slug .'/'. $ef_plugin_slug .'.php'];
	$args->version = $current_version;
	
	$request_string = array(
			'body' => array(
				'r_action' => $action,
				'request' => serialize(Array()),
				'affiliate_id' => get_option('energyfolks_affiliate_id'),
				'api-key' => md5(get_bloginfo('url'))
			),
			'user-agent' => 'WordPress/' . $wp_version . '; ' . get_bloginfo('url')
		);
	
	$request = wp_remote_post($ef_api_url, $request_string);
	if (is_wp_error($request)) {
		$res = new WP_Error('plugins_api_failed', __('An Unexpected HTTP Error occurred during the API request.</p> <p><a href="?" onclick="document.location.reload(); return false;">Try again</a>'), $request->get_error_message());
	} else {
		$res = ef_array_to_object(unserialize($request['body']));
		
		if ($res === false)
			$res = new WP_Error('plugins_api_failed', __('An unknown error occurred'), $request['body']);
	}
	
	return $res;
}

function ef_array_to_object( $array = array( ) ) {
    if ( empty( $array ) || !is_array( $array ) )
        return false;

    $data = new stdClass;
    foreach ( $array as $akey => $aval )
        $data->{$akey} = $aval;
    return $data;
}


?>