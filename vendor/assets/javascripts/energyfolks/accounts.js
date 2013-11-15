/**
 * energyfolks.com cross-domain login library
 * Library allows external sites to verify users based on energyfolks logins.
 *
 * Two Login scenarios are allowed:
 * - Basic Client-Side: The external site never knows any information about the state of visiting user.  All interactions
 *   are taken care of by the energyfolks servers, and as a result the external site does not know whether the visitor
 *   is logged in, a member, etc.  energyfolks delivered content on the site, however, will be displayed with visitor
 *   information in mind.  Requires a single server side function on the client site to act as a proxy.
 * - Server Side: the external site server communicates with the energyfolks server directly, allowing the
 *   external site to learn the logged state of the visitor.  This allows the site to taylor displays to the user, show
 *   specific information based on status, etc.  This requires server side scripting functionality, and a PHP library is
 *   available to provide this functionality.  Learn more at https://www.energyfolks.com/developer/documentation.php#login
 *   PLEASE NOTE: If you use this scenario, then the PHP library provides functions that output the necessary javascript
 *   code to call the correct functions from this file.  Please refer to the PHP library for usage instructions (you should
 *   not have to use any javascript code directly)
 *
 * Client Side login works as follows:
 * 1-Login checks for a current login.  If one is found, then the requested view is displayed (either nothing, or a box
 *   showing basic user information
 * 2-Display login screen (if user not logged) for user (inline, not iframe)
 * 3-Upon submittal with AJAX, return error if unsuccessful, or refresh page if successful (or forward to forwardURL)
 *
 * Server Side login works as follows:
 * 0 (not performed here): Check session for valid login.  If NOT found, load this script
 * 1-Login checks energyfolks for current login.  If one is found, a hash key is returned and we continue at step 4
 * 2-Display login screen for user (inline, not in iframe)
 * 3-Upon submittal with ajax, return error if unsuccessful, or hash key if successful
 * 4-Launch the callback URL defined by the client in the constructor.
 *      This URL is a server side page on your site which takes the hash key, asks energyfolks what user is associated
 *      with the hash, and then receives the response from the energyfolks server.  The response is a JSON array whose
 *      details are described at https://www.energyfolks.com/developer/documentation.php#login.
 *      PLEASE store this information in a server session to avoid pinging energyfolks for login information on each
 *      pageload of your site (this will drastically improve usability of your site)
 * 5-Your callback script can then load content or forward to the correct page based on user status.  Your site maintains
 *      user session internally and should not re-load this library.
 *      NOTE: repeated logins from an external site in a small matter of time using this script will result in a freeze
 *      on the specific account.  Use local sessions on your server to store user information and avoid freezing out
 *      your users.
 */

/*
 Display a login box, or show current user details if already logged in:
 */
EnergyFolks.LoginBox = function(element_id) {
    var id = EnergyFolks.uniqueId();
    var intext = "<div id='EnFolksLoginDiv_"+id+"' style='text-align:center;'><h1>Loading...</h1><img src='"+EnergyFolks.server_url+"'/assets/loader.gif' style='display:inline;' align=center><h6>Contacting energyfolks.com user system...</h6></div>";
    if(typeof element_id !== 'undefined')
        EnergyFolks.$(element_id).html(intext);
    else
        document.write(intext);
    var callback = function(input) {
        EnergyFolks.$("#EnFolksLoginDiv_"+input.id).html(input.html);
    }
    EnergyFolks.ajax('loginBox', {id: id}, callback);
};

/*
 Display a simpler login box, or show current user details if already logged in:
 */
EnergyFolks.SmallLoginBox = function(element_id) {
    var id = EnergyFolks.uniqueId();
    var intext = "<div id='EnFolksLoginDiv_"+id+"' style='text-align:center;'><h1>Loading...</h1><img src='"+EnergyFolks.server_url+"'/assets/loader.gif' style='display:inline;' align=center><h6>Contacting energyfolks.com user system...</h6></div>";
    if(typeof element_id !== 'undefined')
        EnergyFolks.$(element_id).html(intext);
    else
        document.write(intext);
    var callback = function(input) {
        EnergyFolks.$("#EnFolksLoginDiv_"+input.id).html(input.html);
    }
    EnergyFolks.ajax('smallLoginBox', {id: id}, callback);
};

/*
 Display a simple 'login/get an account' links, or user details if already logged in
 */
EnergyFolks.LoginLinks = function(element_id) {
    var id = EnergyFolks.uniqueId();
    var intext = "<div id='EnFolksLoginDiv_"+id+"' style='text-align:center;'><h1>Loading...</h1><img src='"+EnergyFolks.server_url+"'/assets/loader.gif' style='display:inline;' align=center><h6>Contacting energyfolks.com user system...</h6></div>";
    if(typeof element_id !== 'undefined')
        EnergyFolks.$(element_id).html(intext);
    else
        document.write(intext);
    var callback = function(input) {
        EnergyFolks.$("#EnFolksLoginDiv_"+input.id).html(input.html);
    }
    EnergyFolks.ajax('loginLinks', {id: id}, callback);
};


// Create callback function used when a successful login is found
EnergyFolks.login_callback = function(hash) {
    if(EnergyFolks.callbackURL == '') {
        // No callback means no server side functionality.  Hash isnt used, just refresh or forward
        if(EnergyFolks.forwardto == "")
            location.reload(true);
        else
            location.href=EnergyFolks.forwardto;
    } else {
        // If a callbackURL is provided, use it...the callback should log user in, then simply call a
        // window.reload (or forward the user) in order to refresh the contents on the screen and complete
        // the login process
        var url = EnergyFolks.callbackURL;
        url=url.split("#");
        url=url[0].split("?");
        url=url[0]+"?enfolks_hash="+hash;
        var head= document.getElementsByTagName('head')[0];
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= url;
        head.appendChild(script);
    }
}
// Create the callback function to use when a successful logout is completed
EnergyFolks.logout_callback = function() {
    if(EnergyFolks.callbackURL == '') {
        // No callback means no server side functionality.  Hash isnt used, just refresh or forward
        if(EnergyFolks.forwardto == "")
            location.reload(true);
        else
            location.href=EnergyFolks.forwardto;
    } else {
        // If a callbackURL is provided, use it...the callback should log user out, then simply call a
        // window.reload (or forward the user) in order to refresh the contents on the screen and complete
        // the logout process
        var url = EnergyFolks.callbackURL;
        url=url.split("#");
        url=url[0].split("?");
        url=url[0]+"?logout=true";
        var head= document.getElementsByTagName('head')[0];
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= url;
        head.appendChild(script);
    }
}

/*
 Pageload tasks
 */
EnergyFolks.$(function() {
    if(EnergyFolks.checkCookies) {
        // Check for cookies and reload page (if newly logged in)
        var url=EnergyFolks.server_url + "/users/try_cookie?"+EnergyFolks.urlhash()+"&aid="+EnergyFolks.id;
        var head= document.getElementsByTagName('head')[0];
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= url;
        head.appendChild(script);
    }

    // Attach listener to all login forms
    var login_form_submit = function() {
        var self = EnergyFolks.$(this);
        if(self.find('.EnFolksCookie').prop('checked'))
            var cook=1;
        else
            var cook=0;
        var EscapeAll = function(str) {
            var val=encodeURIComponent(str.replace(/%/g,"ENFOLKSPERCENT").replace(/'/g,"ENFOLKSPERCENT27").replace(/\\/g,"ENFOLKSPERCENT5C"));
            if(val == "")
                return "BLANK";
            else
                return val;
        }
        var url=EnergyFolks.server_url + "/users/try_login?iframe_next=1&user=" + EscapeAll(self.find('.EnFolksUser').val()) +"&pass=" +EscapeAll(self.find('.EnFolksPass').val())+"&cook="+cook+"&"+EnergyFolks.urlhash()+"&aid="+EnergyFolks.id;
        window.open (url, "EnergyFolks_Login_Window","location=0,status=0,scrollbars=0, width=100,height=100");
        self.find('button').hide();
        if(self.find('.login_loading').length == 0) {
            var holder = EnergyFolks.$('<div class="login_loading"><img src="'+EnergyFolks.server_url+'/assets/loader.gif" style="display:inline;"></div>').hide().insertAfter(self.find('button'));
            holder.show();
        } else
            self.find('.login_loading').show();
        return false;
    };
    EnergyFolks.$('body').on('submit','.EnFolksExternalCustomLoginForm', login_form_submit);
    EnergyFolks.$('body').on('submit','.EnFolksExternalLoginForm', login_form_submit);

    // Attach listener to hash for handling response of login form upon submit
    EnergyFolks.$(window).on('hashchange',function() {
        var hash = location.hash;
        if(hash.substr(1,6) == 'login_') {
            window.location.hash = '';
            if(hash.substr(7,5) == 'error') {
                EnergyFolks.showNotice("Invalid email address or password, or account not activated","red");
                EnergyFolks.$('.EnFolksExternalLoginForm button').show();
                EnergyFolks.$('.EnFolksExternalLoginForm .login_loading').hide();
            } else if(hash.substr(7,8) == 'success_')
                EnergyFolks.login_callback(hash.substr(15,40));
        }
    });

    // Attach listener to all logout links
    EnergyFolks.$('body').on('click','.EnFolks_logout', function() {
        EnergyFolks.$(this).after('<div class="login_loading"><img src="'+EnergyFolks.server_url+'/assets/loader.gif" style="display:inline;height:20px;"></div>');
        EnergyFolks.$(this).hide();
        var url=EnergyFolks.server_url + "/users/logout?"+EnergyFolks.urlhash()+"&aid="+EnergyFolks.id;
        var head= document.getElementsByTagName('head')[0];
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= url;
        head.appendChild(script);
        return false;
    });

    // Attach listener to all 'forgot pass' links
    EnergyFolks.$('body').on('click','.EnFolks_forgot_pass', function() {
        EnergyFolks.iframe_popup('users/reset_password',{step: 1});
        return false;
    });

    // Attach listener to all 'resend activation' links
    EnergyFolks.$('body').on('click','.EnFolks_reactivate', function() {
        EnergyFolks.iframe_popup('users/resend_activation',{step: 1});
        return false;
    });

    // Attach listener to all 'create account' links
    var NewAccount = function() {
        var url=EnergyFolks.server_url + "/users/new?iframe_next=1&aid="+EnergyFolks.id;
        window.open (url, "EnergyFolks_NewAccount_Window","location=0,status=0,scrollbars=0, width=900,height=650");
        return false;
    };
    EnergyFolks.$('body').on('click', '#EnFolksCreateAccount', NewAccount); //LEGACY
    EnergyFolks.$('body').on('click', '.EnFolks_create_account', NewAccount);
});



//Hide the top account bar (basically create the bar but with no display to prevent its appearance)
EnergyFolks.HideTopbar = function() {
    document.write("<div id='efadminbar' style='display:none;position:relative;'></div>");
}
//'unfix' topbar so that it doesnt stick to the top of the window.
EnergyFolks.UnFixTopbar = function() {
    EnergyFolks.TopBarFixed = false;
}
// Add to custom menu at top
EnergyFolks.AddMenuItem = function(title,url) {
    EnergyFolks.customMenuItems.push({title:title, url:url});
}

EnergyFolks.CreateTopBar = function() {
    if((EnergyFolks.$("#wpadminbar").length > 0) && (EnergyFolks.user_logged_in)) {
        var outtext='';
        if(EnergyFolks.testAdmin(EnergyFolks.CONTRIBUTOR)) {
            EnergyFolks.$("#wp-admin-bar-energyfolks0").html("<a href='#' class='ab-item'>Administrator Tools</a><div class='ab-sub-wrapper'><ul class='ab-submenu' id='wp-admin-bar-energyfolks0-default'></ul></div>");
            outtext = '';
            if(EnergyFolks.testAdmin(EnergyFolks.ADMIN)) outtext += "<li><a href='#' class='ab-item EnergyFolks_popup' data-command='affiliates/"+EnergyFolks.id+"/edit' data-iframe='true' data-params=''>EnergyFolks Dashboard</a></li>";
            outtext += '<li><a class="ab-item" href="../wp-admin">Wordpress Dashboard</a></li>';
            EnergyFolks.$("wp-admin-bar-energyfolks0-default").html(outtext);
        } else if(EnergyFolks.current_user.super_admin) {
            EnergyFolks.$("#wp-admin-bar-energyfolks0").html('<a class="ab-item EnergyFolks_popup" href="#" data-command="admins/index" data-iframe="true" data-params="">EF Administrator Page</a>'+"<div class='ab-sub-wrapper'><ul class='ab-submenu' id='wp-admin-bar-energyfolks0-default'></ul></div>");
            EnergyFolks.$("#wp-admin-bar-energyfolks0-default").html('<li><a class="ab-item EnergyFolks_popup" href="#" data-command="affiliates/'+EnergyFolks.id+'/edit" data-iframe="true" data-params="">Partner Control Screen</a></li>');
        } else
            EnergyFolks.$("#wp-admin-bar-energyfolks0").css('display','none');
        var tot=EnergyFolks.current_user.moderation_count.total;
        if(tot > 0) {
            outtext='<a class="ab-item" href="#" style="background-color:darkred;">Moderation ('+tot+')</a>';
            EnergyFolks.$("#wp-admin-bar-energyfolks1").html(outtext+"<div class='ab-sub-wrapper'><ul class='ab-submenu' id='wp-admin-bar-energyfolks1-default'></ul></div>");
            outtext='';
            EnergyFolks.$.each(EnergyFolks.current_user.moderation_count.values, function(i, v) {
                outtext +='<li><a class="ab-item EnergyFolks_popup" href="#" data-command="'+ v.method+'/moderation" data-iframe="true" data-params="aid='+ v.aid+'">'+ v.title+' ('+ v.count+')</a></li>';
            });
            EnergyFolks.$("#wp-admin-bar-energyfolks1-default").html(outtext);
        } else
            EnergyFolks.$("#wp-admin-bar-energyfolks1").css('display','none');
        EnergyFolks.$("#wp-admin-bar-energyfolks2").css('display','none'); //TODO: Remove this reference from wordpress plugin
        if(EnergyFolks.current_user.user_posts.total > 0) {
            outtext='';
            EnergyFolks.$("#wp-admin-bar-energyfolks3").html("<a class='ab-item' href='#'>Your Posts</a><div class='ab-sub-wrapper'><ul class='ab-submenu' id='wp-admin-bar-energyfolks3-default'></ul></div>");
            EnergyFolks.$.each(EnergyFolks.current_user.user_posts.values, function(i, v) {
                outtext +='<li><a class="ab-item EnergyFolks_popup" href="#" data-command="'+ v.method+'/myposts" data-iframe="true" data-params="">'+ v.title+' ('+ v.count+')</a></li>';
            });
            EnergyFolks.$("#wp-admin-bar-energyfolks3-default").html(outtext);
        } else {
            EnergyFolks.$("#wp-admin-bar-energyfolks3").css('display','none');
        }
        EnergyFolks.$("#wp-admin-bar-energyfolks_welcome_sub1").replaceWith('<a class="ab-item EnergyFolks_popup" href="#" data-command="users/profiles" data-iframe="true">Update Profile</a>');
        EnergyFolks.$("#wp-admin-bar-energyfolks_add_sub5").replaceWith('<a class="ab-item EnergyFolks_popup" href="#" data-command="events/new" data-iframe="true">Event Post</a>');
        EnergyFolks.$("#wp-admin-bar-energyfolks_add_sub6").replaceWith('<a class="ab-item EnergyFolks_popup" href="#" data-command="jobs/new" data-iframe="true">Job Post</a>');
        EnergyFolks.$("#wp-admin-bar-energyfolks_add_sub7").replaceWith('<a class="ab-item EnergyFolks_popup" href="#" data-command="bulletins/new" data-iframe="true">Bulletin Post</a>');
        return;
    }
    if(EnergyFolks.$("#efadminbar").length > 0) return;
    if(!EnergyFolks.user_logged_in) {
        var outtext='<div class="quicklinks"><ul class="ab-top-menu">';
        outtext+='<li class="menupop" onmouseout="EnergyFolks.$(\'#efadminbar_sub1\').hide();" onmouseover="EnergyFolks.$(\'#efadminbar_sub1\').show();"><a class="ab-item" href="#" >';
        outtext+='Get an Account or Login</a>';
        outtext+='<div id="efadminbar_sub1" class="ab-sub-wrapper">';
        outtext+='<div id="eftoplogin">';
        outtext+='</div></div></li>';
        var tots=EnergyFolks.customMenuItems.length;
        for(var i=0;i<tots;i++)
            outtext+='<li class="menupop"><a class="ab-item" href="'+EnergyFolks.customMenuItems[i].url+'">'+EnergyFolks.customMenuItems[i].title+"</a></li>";
        outtext+='</ul><ul class="ab-top-menu ab-top-secondary">';
        outtext+='<li onmouseout="EnergyFolks.$(\'#efadminbar_subr\').hide();" onmouseover="EnergyFolks.$(\'#efadminbar_subr\').show();" class="menupop"><a class="ab-item" href="https://www.energyfolks.com/" target="_blank"><i>an <img src="https://images.energyfolks.com/images/toplogoNEW2.png" border=0 style="position:relative;top:-1px;border-width:0px;" class="avatar" align="absmiddle"> affiliate</i></a>';
        outtext+='<div id="efadminbar_subr" class="ab-sub-wrapper"><div style="padding:3px;text-align:left;color:#666666;text-shadow:none;line-height:1.15;"><div style="text-align:center;"><img src="https://www.energyfolks.com/resourceimage/PartnerPic.png" style="display:inline;"></div>We are an energyfolks affiliate organization.  Energyfolks is a not-for-profit network of networks dedicated to connecting energy students and professionals in their neighborhood and around the globe.</div><ul class="ab-submenu">';
        outtext+='<li><a class="ab-item" href="https://www.energyfolks.com/" target="_blank">Learn more...</a></li></ul>';
        outtext+='</div>';
        outtext+='<li class="menupop"><a class="ab-item EnergyFolks_popup" href="#" data-command="feedback/new" data-iframe="true">Feedback</a></li>';
        outtext+='</ul></div>';
    } else {
        var outtext='<div class="quicklinks"><ul class="ab-top-menu">';
        outtext+='<li class="menupop EnergyFolks_popup" onmouseout="EnergyFolks.$(\'#efadminbar_sub1\').hide();" onmouseover="EnergyFolks.$(\'#efadminbar_sub1\').show();"><a class="ab-item EnergyFolks_popup" href="#" data-command="users/profile" data-iframe="true">';
        outtext+='<img class="avatar" style="border-width:0px;padding-right:5px;" align="absmiddle" src="'+EnergyFolks.current_user.avatar_url+'">';
        outtext+='Welcome '+EnergyFolks.current_user.first_name+'</a>';
        outtext+='<div id="efadminbar_sub1" class="ab-sub-wrapper"><ul class="ab-submenu">';
        outtext+='<li><a class="ab-item EnergyFolks_popup" href="#" data-command="users/profile" data-iframe="true">Update your Profile</a></li>';
        outtext+='<li><a class="ab-item EnFolks_logout" href="#">Logout</a></li>'
        outtext+='</ul></div></li>';
        if(EnergyFolks.testAdmin(EnergyFolks.ADMIN)) {
            outtext+='<li class="menupop" onmouseout="EnergyFolks.$(\'#efadminbar_sub4\').hide();" onmouseover="EnergyFolks.$(\'#efadminbar_sub4\').show();">';
            outtext+="<a href='#' class='ab-item EnergyFolks_popup' data-command='affiliates/"+EnergyFolks.id+"/edit' data-iframe='true' data-params=''>Administrator Tools</a>";
            outtext+='<div id="efadminbar_sub4" class="ab-sub-wrapper"><ul class="ab-submenu">';
            outtext += "<li><a href='#' class='ab-item EnergyFolks_popup' data-command='affiliates/"+EnergyFolks.id+"/edit' data-iframe='true' data-params=''>EnergyFolks Dashboard</a></li>";
            outtext+='</ul></div></li>';
        } else if(EnergyFolks.current_user.super_admin) {
            outtext+='<li class="menupop" onmouseout="EnergyFolks.$(\'#efadminbar_sub4\').hide();" onmouseover="EnergyFolks.$(\'#efadminbar_sub4\').show();">';
            outtext+='<a  class="ab-item EnergyFolks_popup" href="#" data-command="admins/index" data-iframe="true" data-params="">EF Administrator Page</a>';
            outtext+='<div id="efadminbar_sub4" class="ab-sub-wrapper"><ul class="ab-submenu">';
            if(EnergyFolks.id > 0)
                outtext += "<li><a href='#' class='ab-item EnergyFolks_popup' data-command='affiliates/"+EnergyFolks.id+"/edit' data-iframe='true' data-params=''>Affiliate Dashboard</a></li>";
            outtext += '<li><a class="ab-item EnergyFolks_popup" href="#" data-command="admins/index" data-iframe="true" data-params="">EF Administrator Page</a></li>'
            outtext+='</ul></div></li>';
        }
        var tot=EnergyFolks.current_user.moderation_count.total;
        if(tot > 0) {
            outtext+='<li class="menupop" onmouseout="EnergyFolks.$(\'#efadminbar_subm\').hide();" onmouseover="EnergyFolks.$(\'#efadminbar_subm\').show();">';
            outtext+='<a class="ab-item" href="#" style="background-color:darkred;">Moderation ('+tot+')</a>';
            outtext+='<div id="efadminbar_subm" class="ab-sub-wrapper"><ul class="ab-submenu">';
            EnergyFolks.$.each(EnergyFolks.current_user.moderation_count.values, function(i, v) {
                outtext +='<li><a class="ab-item EnergyFolks_popup" href="#" data-command="'+ v.method+'/moderation" data-iframe="true" data-params="aid='+ v.aid+'">'+ v.title+' ('+ v.count+')</a></li>';
            });
            outtext+='</ul></div></li>';
        }
        if(EnergyFolks.current_user.user_posts.total > 0) {
            outtext+='<li class="menupop" onmouseout="EnergyFolks.$(\'#efadminbar_sub2\').hide();" onmouseover="EnergyFolks.$(\'#efadminbar_sub2\').show();">';
            outtext+="<a class='ab-item' href='#'>Your Posts</a><div id='efadminbar_sub2' class='ab-sub-wrapper'><ul class='ab-submenu'>";
            EnergyFolks.$.each(EnergyFolks.current_user.user_posts.values, function(i, v) {
                outtext +='<li><a class="ab-item EnergyFolks_popup" href="#" data-command="'+ v.method+'/myposts" data-iframe="true" data-params="">'+ v.title+' ('+ v.count+')</a></li>';
            });
            outtext+='</ul></div></li>'
        }
        outtext+='<li class="menupop" onmouseout="EnergyFolks.$(\'#efadminbar_sub3\').hide();" onmouseover="EnergyFolks.$(\'#efadminbar_sub3\').show();"><a class="ab-item" href="#">+ New</a>';
        outtext+='<div id="efadminbar_sub3" class="ab-sub-wrapper"><ul class="ab-submenu">';
        outtext+='<li><a class="ab-item EnergyFolks_popup" href="#" data-command="events/new" data-iframe="true">Event Post</a></li>';
        outtext+='<li><a class="ab-item EnergyFolks_popup" href="#" data-command="jobs/new" data-iframe="true">Job Post</a></li>';
        outtext+='<li><a class="ab-item EnergyFolks_popup" href="#" data-command="bulletins/new" data-iframe="true">Bulletin Post</a></li>';
        outtext+='</ul></div>';
        var tots=EnergyFolks.customMenuItems.length;
        for(var i=0;i<tots;i++)
            outtext+='<li class="menupop"><a class="ab-item" href="'+EnergyFolks.customMenuItems[i].url+'">'+EnergyFolks.customMenuItems[i].title+"</a></li>";
        outtext+='</li></ul><ul class="ab-top-menu ab-top-secondary"><li onmouseout="EnergyFolks.$(\'#efadminbar_subr\').hide();" onmouseover="EnergyFolks.$(\'#efadminbar_subr\').show();" class="menupop"><a class="ab-item" href="https://www.energyfolks.com/" target="_blank"><i>an <img src="https://images.energyfolks.com/images/toplogoNEW2.png" border=0 style="position:relative;top:-1px;border-width:0px;" class="avatar" align="absmiddle"> affiliate</i></a>';
        outtext+='<div id="efadminbar_subr" class="ab-sub-wrapper"><div style="padding:3px;text-align:left;color:#666666;text-shadow:none;line-height:1.15;"><div style="text-align:center;"><img src="https://www.energyfolks.com/resourceimage/PartnerPic.png" style="display:inline;"></div>We are an energyfolks affiliate organization.  Energyfolks is a not-for-profit network of networks dedicated to connecting energy students and professionals in their neighborhood and around the globe.</div><ul class="ab-submenu">';
        outtext+='<li><a class="ab-item" href="https://www.energyfolks.com/" target="_blank">Learn more...</a></li></ul>';
        outtext+='</div>';
        outtext+='<li class="menupop"><a class="ab-item EnergyFolks_popup" href="#" data-command="feedback/new" data-iframe="true">Feedback</a></li>';
        outtext+='</ul></div>';
    }
    if(EnergyFolks.$("#customefadminbar").length > 0) {
        EnergyFolks.$("#customefadminbar").html(outtext+"<div id='efadminbar' style='display:none;'></div>");
        outtext='';
    } else {
        var div = document.createElement('div');
        div.id = 'efadminbar';
        if (document.body.firstChild)
            document.body.insertBefore(div, document.body.firstChild);
        else
            document.body.appendChild(div);
        if(EnergyFolks.TopBarFixed) {
            var div2 = document.createElement('div');
            div2.id = 'efadminbar_spacer';
            if (document.body.firstChild)
                document.body.insertBefore(div2, document.body.firstChild);
            else
                document.body.appendChild(div2);
            EnergyFolks.$("#efadminbar").css('position','fixed');
            var animate=EnergyFolks.cookie('EnFolksTopBarAnimated');
            if(typeof animate === 'Undefined' ) {
                EnergyFolks.cookie('EnFolksTopBarAnimated', {path: '/'});
                EnergyFolks.$("#efadminbar").css('overflow','hidden');
                EnergyFolks.$("#efadminbar").css('height','0px');
                EnergyFolks.$("#efadminbar_spacer").css('height','0px');
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','4px');EnergyFolks.$("#efadminbar_spacer").css('height','4px');},50);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','8px');EnergyFolks.$("#efadminbar_spacer").css('height','8px');},100);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','12px');EnergyFolks.$("#efadminbar_spacer").css('height','12px');},150);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','16px');EnergyFolks.$("#efadminbar_spacer").css('height','16px');},200);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','20px');EnergyFolks.$("#efadminbar_spacer").css('height','20px');},250);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','24px');EnergyFolks.$("#efadminbar_spacer").css('height','24px');},300);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','28px');EnergyFolks.$("#efadminbar_spacer").css('height','28px');EnergyFolks.$("#efadminbar").css('overflow','visible');},350);
            }
        } else {
            EnergyFolks.$("#efadminbar").css('position','relative');
            var animate=EnergyFolks.cookie('EnFolksTopBarAnimated');
            if(typeof animate === 'Undefined' ) {
                EnergyFolks.cookie('EnFolksTopBarAnimated', {path: '/'});
                EnergyFolks.$("#efadminbar").css('overflow','hidden');
                EnergyFolks.$("#efadminbar").css('height','0px');
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','4px');},50);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','8px');},100);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','12px');},150);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','16px');},200);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','20px');},250);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','24px');},300);
                window.setTimeout(function() { EnergyFolks.$("#efadminbar").css('height','28px');EnergyFolks.$("#efadminbar").css('overflow','visible');},350);
            }
        }
    }
    EnergyFolks.$("#efadminbar").html(outtext);
    if(!EnergyFolks.user_logged_in)
        EnergyFolks.LoginBox('#eftoplogin');
}