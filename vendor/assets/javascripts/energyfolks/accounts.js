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
 Display a simple login box, or show current user details if already logged in:
 */
EnergyFolks.LoginBox = function() {
    var id = EnergyFolks.uniqueId();
    document.write("<div id='EnFolksLoginDiv_"+id+"' style='text-align:center;'><h1>Loading...</h1><img src='"+EnergyFolks.server_url+"'/assets/loader.gif' style='display:inline;' align=center><h6>Contacting energyfolks.com user system...</h6></div>");
    var callback = function(input) {
        EnergyFolks.$("#EnFolksLoginDiv_"+input.id).html(input.html);
    }
    EnergyFolks.ajax('loginBox', {id: id}, callback);
};

/*
 Display a simple 'login/get an account' links, or user details if already logged in
 */
EnergyFolks.LoginLinks = function() {
    var id = EnergyFolks.uniqueId();
    document.write("<div id='EnFolksLoginDiv_"+id+"' style='text-align:center;'><h1>Loading...</h1><img src='"+EnergyFolks.server_url+"'/assets/loader.gif' style='display:inline;' align=center><h6>Contacting energyfolks.com user system...</h6></div>");
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

    // Check for cookies and reload page (if newly logged in)
    var url=EnergyFolks.server_url + "/users/try_cookie?"+EnergyFolks.urlhash()+"&aid="+EnergyFolks.id;
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= url;
    head.appendChild(script);


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


















/*
 LEGACY LIBRARY: This is provided for backwards compatibility.  Functions below simply access EnergyFolks namepsace functions
 */
function EnergyFolksLogin(callback) {
    EnergyFolks.callbackURL=callback;
}
EnergyFolksLogin.prototype.ForwardTo = function(url) {
    EnergyFolks.forwardto=url;
}
EnergyFolksLogin.prototype.SetAffiliate = function(id) {
    EnergyFolks.id = id;
}
EnergyFolksLogin.prototype.CheckCookies = function() {}
EnergyFolksLogin.prototype.DisplayLogin = function() {
    EnergyFolks.LoginBox();
}
EnergyFolksLogin.prototype.CustomLogin = function() {}
EnergyFolksLogin.prototype.DisplaySimpleLogin = function(ShowDetails) {
    EnergyFolks.LoginLinks();
}
EnergyFolksLogin.prototype.DisplaySimpleLoginBig = function(ShowDetails) {
    this.DisplaySimpleLogin(ShowDetails);
}
EnergyFolksLogin.prototype.ShowUserDetails = function() {
    //Alias, provided for backwards compatibility
    this.DisplaySimpleLogin(true);
}
EnergyFolksLogin.prototype.Login = function() {
    this.DisplayLogin();
}
EnergyFolksLogin.prototype.LoginEmpty = function() {
    this.CheckCookies();
}
EnergyFolksLogin.prototype.Logout = function(userclass,userstyle) {
    document.write("<a href='#' class='EnFolks_logout'>Logout</a>");
}


//The following functions were internal functions and are no longer used.  Provided simply for compatibility
EnergyFolksLogin.prototype.DisplayTopbar = function() {};
EnergyFolksLogin.prototype.ExecuteLogout = function() {};
EnergyFolksLogin.prototype.FinalLogout = function() {};
EnergyFolksLogin.prototype.FinalLogout2 = function() {};
EnergyFolksLogin.prototype.ExecuteLogout2 = function() {};
EnergyFolksLogin.prototype.callbackWaiter = function() {};
EnergyFolksLogin.prototype.callbackWaiterTop = function() {};
EnergyFolksLogin.prototype.callbackWaiterCustom = function() {};
EnergyFolksLogin.prototype.getCookie = function(c_name) {};
EnergyFolksLogin.prototype.testLogin = function(displayLogin) {};
EnergyFolksLogin.prototype.testLoginScen1 = function(ShowDetails){};
EnergyFolksLogin.prototype.testLoginScen2 = function(ShowDetails){};
EnergyFolksLogin.prototype.testLoginScen3 = function(ShowDetails){};
EnergyFolksLogin.prototype.ShowUserDetailBox = function(){};
EnergyFolksLogin.prototype.AjaxRequest = function(url) {};
EnergyFolksLogin.prototype.SubFormTop = function() {};
EnergyFolksLogin.prototype.SubForm = function() {};
function EnFolksSafariLogin(win,url) {}
EnergyFolksLogin.prototype.SubFormCustom = function() {};
EnergyFolksLogin.prototype.callback = function() {};
EnergyFolksLogin.prototype.EscapeAll = function(str) {};


//TODO: Topbar stuff below needs to be redone!

EnergyFolksLogin.prototype.HideTopbar = function() {
    document.write("<div id='efadminbar' style='display:none;position:relative;'></div>");
}
EnergyFolksLogin.prototype.UnFixTopbar = function() {
    this.TopBarFixed=false;
}
// Add to custome menu at top
EnergyFolksLogin.prototype.AddMenuItem = function(title,url) {
    this.customMenuItems.push({title:title, url:url});
}
// Create the bar that appears at the top of the page when user is logged in
EnergyFolksLogin.prototype.CreateTopBar = function() {
    if(EnFolks_get_object("wpadminbar") && (EnergyFolksUserDetail.user_id > 0)) {
        var outtext='';
        if((EnergyFolksUserDetail.admin == EnFolksAffiliateId) && (EnFolksAffiliateId > 0)) {
            EnFolks_get_object("wp-admin-bar-energyfolks0").innerHTML='<a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/partner/detailExt/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Administrator Tools</a>'+"<div class='ab-sub-wrapper'><ul class='ab-submenu' id='wp-admin-bar-energyfolks0-default'></ul></div>";
            outtext='<li><a class="ab-item" href="/wp-admin">Wordpress Admin Dashboard</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://docs.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://docs.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">Group Documents</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://wiki.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://wiki.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">Group Wiki</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://groups.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://groups.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">Group Email Archives</a></li>';
            EnFolks_get_object("wp-admin-bar-energyfolks0-default").innerHTML=outtext;
        } else if(EnergyFolksUserDetail.super_admin == 1) {
            EnFolks_get_object("wp-admin-bar-energyfolks0").innerHTML='<a class="ab-item" href="https://www.energyfolks.com/admin/">EF Administrator Page</a>'+"<div class='ab-sub-wrapper'><ul class='ab-submenu' id='wp-admin-bar-energyfolks0-default'></ul></div>";
            outtext='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/partner/detailExt/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Partner Control Screen</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://docs.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://docs.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">EF Documents</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://wiki.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://wiki.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">EF Wiki</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://groups.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://groups.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">EF Email Archives</a></li>';
            EnFolks_get_object("wp-admin-bar-energyfolks0-default").innerHTML=outtext;
        } else
            EnFolks_get_object("wp-admin-bar-energyfolks0").style.display='none';
        if((EnergyFolksUserDetail.moderate.announce != -1) ||(EnergyFolksUserDetail.moderate.calendar != -1) ||(EnergyFolksUserDetail.moderate.jobs != -1) ||(EnergyFolksUserDetail.moderate.users != -1)) {
            var tot=Math.max(0,EnergyFolksUserDetail.moderate.announce)+Math.max(0,EnergyFolksUserDetail.moderate.calendar)+Math.max(0,EnergyFolksUserDetail.moderate.jobs)+Math.max(0,EnergyFolksUserDetail.moderate.users);
            outtext='<a class="ab-item" href="javascript:;" ';
            if(tot > 0)
                outtext+='style="background-color:darkred;"'
            outtext+='>Moderation ('+tot+')</a>';
            EnFolks_get_object("wp-admin-bar-energyfolks1").innerHTML=outtext+"<div class='ab-sub-wrapper'><ul class='ab-submenu' id='wp-admin-bar-energyfolks1-default'></ul></div>";
            outtext='';
            if(EnergyFolksUserDetail.moderate.calendar != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/calendar/moderationiframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Events ('+EnergyFolksUserDetail.moderate.calendar+')</a></li>';
            if(EnergyFolksUserDetail.moderate.jobs != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/jobs/moderationiframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Jobs ('+EnergyFolksUserDetail.moderate.jobs+')</a></li>';
            if(EnergyFolksUserDetail.moderate.announce != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/announce/moderationiframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Bulletins ('+EnergyFolksUserDetail.moderate.announce+')</a></li>';
            if(EnergyFolksUserDetail.moderate.users != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/users/moderationiframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Users ('+EnergyFolksUserDetail.moderate.users+')</a></li>';
            EnFolks_get_object("wp-admin-bar-energyfolks1-default").innerHTML=outtext;
        } else {
            EnFolks_get_object("wp-admin-bar-energyfolks1").style.display='none';
        }
        if((EnergyFolksUserDetail.content.announce != -1) ||(EnergyFolksUserDetail.content.calendar != -1) ||(EnergyFolksUserDetail.content.jobs != -1)) {
            var tot=Math.max(0,EnergyFolksUserDetail.content.announce)+Math.max(0,EnergyFolksUserDetail.content.calendar)+Math.max(0,EnergyFolksUserDetail.content.jobs);
            outtext='<a class="ab-item" href="javascript:;" ';
            if(tot > 0)
                outtext+='style="background-color:darkred;"'
            outtext+='>EnergyFolks Queues ('+tot+')</a>';
            EnFolks_get_object("wp-admin-bar-energyfolks2").innerHTML=outtext+"<div class='ab-sub-wrapper'><ul class='ab-submenu' id='wp-admin-bar-energyfolks2-default'></ul></div>";
            outtext='';
            if(EnergyFolksUserDetail.content.calendar != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/calendar/contentcontroliframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Events ('+EnergyFolksUserDetail.content.calendar+')</a></li>';
            if(EnergyFolksUserDetail.content.jobs != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/jobs/contentcontroliframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Jobs ('+EnergyFolksUserDetail.content.jobs+')</a></li>';
            if(EnergyFolksUserDetail.content.announce != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/announce/contentcontroliframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Bulletins ('+EnergyFolksUserDetail.content.announce+')</a></li>';
            EnFolks_get_object("wp-admin-bar-energyfolks2-default").innerHTML=outtext;
        } else {
            EnFolks_get_object("wp-admin-bar-energyfolks2").style.display='none';
        }
        if(EnergyFolksUserDetail.has_posts) {
            outtext='<a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/welcome/Manageiframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Your Posts</a>';
            EnFolks_get_object("wp-admin-bar-energyfolks3").innerHTML=outtext+"<div class='ab-sub-wrapper'><ul class='ab-submenu' id='wp-admin-bar-energyfolks3-default'></ul></div>";
            outtext='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/calendar/mineiframe/'+EnFolksAffiliateId+'#\',1035,650);EnFolksWaitForLoad();">Event Posts ('+EnergyFolksUserDetail.posts.Event+')</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/jobs/mineiframe/'+EnFolksAffiliateId+'#\',1035,650);EnFolksWaitForLoad();">Job Posts ('+EnergyFolksUserDetail.posts.Jobs+')</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/announce/mineiframe/'+EnFolksAffiliateId+'#\',1035,650);EnFolksWaitForLoad();">Bulletin Posts ('+EnergyFolksUserDetail.posts.Announcement+')</a></li>';
            EnFolks_get_object("wp-admin-bar-energyfolks3-default").innerHTML=outtext;
        } else {
            EnFolks_get_object("wp-admin-bar-energyfolks3").style.display='none';
        }
        EnFolks_get_object("wp-admin-bar-energyfolks_welcome_sub1").onclick=function() { EnFolksMessageSize('https://www.energyfolks.com/accounts/ExtProfile/'+EnFolksAffiliateId,1035,650);EnFolksWaitForLoad(); };
        EnFolks_get_object("wp-admin-bar-energyfolks_add_sub5").onclick=function() { EnFolksMessageSize('https://www.energyfolks.com/calendar/externalpost/'+EnFolksAffiliateId+'/-1',1035,650);EnFolksWaitForLoad(); };
        EnFolks_get_object("wp-admin-bar-energyfolks_add_sub6").onclick=function() { EnFolksMessageSize('https://www.energyfolks.com/jobs/externalpost/'+EnFolksAffiliateId+'/-1',1035,650);EnFolksWaitForLoad(); };
        EnFolks_get_object("wp-admin-bar-energyfolks_add_sub7").onclick=function() { EnFolksMessageSize('https://www.energyfolks.com/announce/externalpost/'+EnFolksAffiliateId+'/-1',1035,650);EnFolksWaitForLoad(); };
        return;
    }
    if(EnFolks_get_object("efadminbar")) return;
    if(((EnFolksAffiliateId*1) == 12) || ((EnFolksAffiliateId*1) == 15)) return;
    if(EnergyFolksUserDetail.user_id < 1) {
        var outtext='<div class="quicklinks"><ul class="ab-top-menu">';
        outtext+='<li class="menupop" onmouseout="EnFolks_get_object(\'efadminbar_sub1\').style.display=\'none\';" onmouseover="EnFolks_get_object(\'efadminbar_sub1\').style.display=\'block\';"><a class="ab-item" href="javascript:;" >';
        outtext+='Get an Account or Login</a>';
        outtext+='<div id="efadminbar_sub1" class="ab-sub-wrapper">';
        outtext+='<div id="eftoplogin">';
        outtext+="<div id='EnFolks_top_login_loading' style='width:180px;height:300px;display:none;text-align:center;'><h1>Loading...</h1><img src='https://images.energyfolks.com/images/loader.gif' style='display:inline;' align=center><h6>Contacting energyfolks.com user system...</h6></div>";
        outtext+='<div id="EnFolks_top_login_box" style="text-align:center;"><div class="EnFolksClass"><div style="text-align:center;font-size:14px;color:red;" id="EnFolks_top_login_error"></div> <h3>Login or Sign up with<br>  <a href="javascript:;" onclick="EnFolks_ThirdPartyLogin(\'facebook\');" style="height:auto;display:inline;padding:0px;border:0px;"><img align="absmiddle" style="border:0px;padding-top:4px;height:18px;padding-right:4px;display:inline;" onmouseover="this.src=\'https://images.energyfolks.com/images/social/facebook.png\';" onmouseout="this.src=\'https://images.energyfolks.com/images/social/facebookbw.png\';" src="https://images.energyfolks.com/images/social/facebookbw.png"></a>     <a href="javascript:;" onclick="EnFolks_ThirdPartyLogin(\'linkedin\');" style="border:0px;height:auto;display:inline;padding:0px;"><img align="absmiddle" style="border:0px;padding-top:4px;height:18px;padding-right:4px;display:inline;" onmouseover="this.src=\'https://images.energyfolks.com/images/social/linkedin.png\';" onmouseout="this.src=\'https://images.energyfolks.com/images/social/linkedinbw.png\';" src="https://images.energyfolks.com/images/social/linkedinbw.png"></a>     <a href="javascript:;" onclick="EnFolks_ThirdPartyLogin(\'google\');" style="height:auto;display:inline;padding:0px;border:0px;"><img align="absmiddle" style="border:0px;padding-top:4px;height:18px;padding-right:4px;display:inline;" onmouseover="this.src=\'https://images.energyfolks.com/images/social/google.png\';" onmouseout="this.src=\'https://images.energyfolks.com/images/social/googlebw.png\';" src="https://images.energyfolks.com/images/social/googlebw.png"></a>     <a href="javascript:;" onclick="EnFolks_ThirdPartyLogin(\'twitter\');" style="height:auto;display:inline;padding:0px;border:0px;"><img align="absmiddle" style="border:0px;padding-top:4px;height:18px;padding-right:4px;display:inline;" onmouseover="this.src=\'https://images.energyfolks.com/images/social/twitter.png\';" onmouseout="this.src=\'https://images.energyfolks.com/images/social/twitterbw.png\';" src="https://images.energyfolks.com/images/social/twitterbw.png"></a></h3>';
        outtext+='<hr width="95%" size="1" color="#999999" style="padding:0px;"><div style="text-align:center;padding:2px 2px 6px 2px;"><h3>Join us!</h3> Signup for an <a style="height:auto;display:inline;padding:0px;" href="https://www.energyfolks.com" target="_blank">energyfolks</a> account to gain access to this site.  An account is <b>free</b> and open to <b>anyone</b>.<br>  <button id="EnFolksCreateAccountTop" class="EnFolksLoginButton EnFolksOverride" style="text-align:center;padding:5px;font-size:15px;line-height:17px;">get an account</button> </div><hr width="95%" size="1" color="#999999" style="padding:0px;"> <form method="post" onsubmit="return false;" id="EnFolksExternalLoginFormTop">';
        outtext+='<h3 style="padding-top:7px;">Sign in with your energyfolks account</h3> <div align="center">     <table border="0" cellpadding="1" cellspacing="0" align="center" style="align:center;">         <tbody><tr>             <td align="right">                 email:             </td>             <td>                 <input type="text" name="user" id="EnFolksUserTop" value="" size="13">             </td>         </tr>         <tr>             <td align="right">                 password:             </td>             <td>                 <input type="password" name="passw" id="EnFolksPassTop" size="13"></td>         </tr>         <tr>             <td colspan="2" align="center">                 <label><input type="checkbox" id="EnFolksCookieTop" name="remember" checked="" value="11"> remember me</label>             </td>         </tr>         <tr>             <td align="center" style="font-size:10px;text-align:center;" colspan="2">        <div style="text-align:center;line-height:1.6;">         <a style="height:auto;display:inline;padding:0px;" class="maplink" href=\'javascript:EnFolksMessageSize("https://www.energyfolks.com/accounts/forgotpassOUT/"+EnFolksAffiliateId,650,400);EnFolksWaitForLoad();\'>forgot password</a>          <BR>       <a style="height:auto;display:inline;padding:0px;" class="maplink" href=\'javascript:EnFolksMessageSize("https://www.energyfolks.com/accounts/ReSendActivationOUT/"+EnFolksAffiliateId,550,550);EnFolksWaitForLoad();\'>re-send activation</a></div>                 <button class="EnFolksLoginButton EnFolksOverride" type="submit" style="padding:5px 20px 5px 20px;font-size:15px;line-height:17px;">login</button>             </td>         </tr>     </tbody></table> </div>  </form> </div></div>';

        outtext+='</div></div></li>';
        var tots=this.customMenuItems.length;
        for(var i=0;i<tots;i++)
            outtext+='<li class="menupop"><a class="ab-item" href="'+this.customMenuItems[i].url+'">'+this.customMenuItems[i].title+"</a></li>";
        outtext+='</li></ul><ul class="ab-top-menu ab-top-secondary">';
        outtext+='<li onmouseout="EnFolks_get_object(\'efadminbar_subr\').style.display=\'none\';" onmouseover="EnFolks_get_object(\'efadminbar_subr\').style.display=\'block\';" class="menupop"><a class="ab-item" href="https://www.energyfolks.com/" target="_blank"><i>an <img src="https://images.energyfolks.com/images/toplogoNEW2.png" border=0 style="position:relative;top:-1px;border-width:0px;" class="avatar" align="absmiddle"> affiliate</i></a>';
        outtext+='<div id="efadminbar_subr" class="ab-sub-wrapper"><div style="padding:3px;text-align:left;color:#666666;text-shadow:none;line-height:1.15;"><div style="text-align:center;"><img src="https://www.energyfolks.com/resourceimage/PartnerPic.png" style="display:inline;"></div>We are an energyfolks affiliate organization.  Energyfolks is a not-for-profit network of networks dedicated to connecting energy students and professionals in their neighborhood and around the globe.</div><ul class="ab-submenu">';
        outtext+='<li><a class="ab-item" href="https://www.energyfolks.com/" target="_blank">Learn more...</a></li></ul>';
        outtext+='</div>';
        outtext+='<li class="menupop"><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/welcome/feedback/'+EnFolksAffiliateId+'\',480,520);EnFolksWaitForLoad();">Feedback</a></li>';
        outtext+='</li></ul></div>';
    } else {
        var outtext='<div class="quicklinks"><ul class="ab-top-menu">';
        outtext+='<li class="menupop" onmouseout="EnFolks_get_object(\'efadminbar_sub1\').style.display=\'none\';" onmouseover="EnFolks_get_object(\'efadminbar_sub1\').style.display=\'block\';"><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/accounts/ExtProfile/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">';
        outtext+='<img class="avatar" style="border-width:0px;padding-right:5px;" align="absmiddle" src="'+EnergyFolksUserDetail.picture_url+'">';
        outtext+='Welcome '+EnergyFolksUserDetail.first_name+'</a>';
        outtext+='<div id="efadminbar_sub1" class="ab-sub-wrapper"><ul class="ab-submenu">';
        outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/accounts/ExtProfile/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Update your Profile</a></li>';
        outtext+='<li><a class="ab-item" href="javascript:;" onclick="" id="efadminbar-logout">Logout</a></li>'
        outtext+='</ul></div></li>';
        if((EnergyFolksUserDetail.admin == EnFolksAffiliateId) && (EnFolksAffiliateId > 0)) {
            outtext+='<li class="menupop" onmouseout="EnFolks_get_object(\'efadminbar_sub4\').style.display=\'none\';" onmouseover="EnFolks_get_object(\'efadminbar_sub4\').style.display=\'block\';">';
            outtext+='<a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/partner/detailExt/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Administrator Tools</a>';
            outtext+='<div id="efadminbar_sub4" class="ab-sub-wrapper"><ul class="ab-submenu">';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/partner/detailExt/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Administrator Control Screen</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://docs.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://docs.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">Group Documents</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://wiki.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://wiki.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">Group Wiki</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://groups.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://groups.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">Group Email Archives</a></li>';
            outtext+='</ul></div></li>';
        } else if(EnergyFolksUserDetail.super_admin == 1) {
            outtext+='<li class="menupop" onmouseout="EnFolks_get_object(\'efadminbar_sub4\').style.display=\'none\';" onmouseover="EnFolks_get_object(\'efadminbar_sub4\').style.display=\'block\';">';
            outtext+='<a class="ab-item" href="https://www.energyfolks.com/admin" >EF Administrator Page</a>';
            outtext+='<div id="efadminbar_sub4" class="ab-sub-wrapper"><ul class="ab-submenu">';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/partner/detailExt/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Partner Control Screen</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://docs.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://docs.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">EF Documents</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://wiki.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://wiki.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">EF Wiki</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageDirect(\'<table border=\\\'0\\\' style=\\\'padding:10px 40px 10px 40px;width:500px;\\\'><tbody><tr><td><h1 style=\\\'font-size:26px;text-align:center;line-height:30px;\\\'>Are you signed in to a personal google or gmail account?</h1><div align=\\\'left\\\'><h4>Why yes!</h4><p>energyfolks will log you in to a google account associated with your club.  To avoid conflicts and odd behavior, we recommend you <span style=\\\'font-weight:bold;\\\'>logout of your google/gmail</span> before continuing.</p><h4>Not me...</h4><p>Wonderful!  Click the link below to continue on your way</p></div><h3 align=center><a href=\\\'http://groups.energyfolks.com/\\\' target=\\\'_blank\\\'>Continue on to http://groups.energyfolks.com</a></h3></td></tr></tbody></table>\',400,400);EnFolksWaitForLoad();">EF Email Archives</a></li>';
            outtext+='</ul></div></li>';
        }
        if((EnergyFolksUserDetail.moderate.announce != -1) ||(EnergyFolksUserDetail.moderate.calendar != -1) ||(EnergyFolksUserDetail.moderate.jobs != -1) ||(EnergyFolksUserDetail.moderate.users != -1)) {
            var tot=Math.max(0,EnergyFolksUserDetail.moderate.announce)+Math.max(0,EnergyFolksUserDetail.moderate.calendar)+Math.max(0,EnergyFolksUserDetail.moderate.jobs)+Math.max(0,EnergyFolksUserDetail.moderate.users);
            outtext+='<li class="menupop" onmouseout="EnFolks_get_object(\'efadminbar_subm\').style.display=\'none\';" onmouseover="EnFolks_get_object(\'efadminbar_subm\').style.display=\'block\';">';
            outtext+='<a class="ab-item" href="javascript:;" ';
            if(tot > 0)
                outtext+='style="background-color:darkred;"'
            outtext+='>Moderation ('+tot+')</a>';
            outtext+='<div id="efadminbar_subm" class="ab-sub-wrapper"><ul class="ab-submenu">';
            if(EnergyFolksUserDetail.moderate.calendar != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/calendar/moderationiframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Events ('+EnergyFolksUserDetail.moderate.calendar+')</a></li>';
            if(EnergyFolksUserDetail.moderate.jobs != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/jobs/moderationiframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Jobs ('+EnergyFolksUserDetail.moderate.jobs+')</a></li>';
            if(EnergyFolksUserDetail.moderate.announce != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/announce/moderationiframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Bulletins ('+EnergyFolksUserDetail.moderate.announce+')</a></li>';
            if(EnergyFolksUserDetail.moderate.users != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/users/moderationiframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Users ('+EnergyFolksUserDetail.moderate.users+')</a></li>';
            outtext+='</ul></div></li>';
            if(EnFolks_get_object("wp-admin-bar-energyfolks1"))
                EnFolks_get_object("wp-admin-bar-energyfolks1").innerHTML=outtext2+"</ul></div>";
        } else {
            if(EnFolks_get_object("wp-admin-bar-energyfolks1"))
                EnFolks_get_object("wp-admin-bar-energyfolks1").style.display='none';
        }
        if((EnergyFolksUserDetail.content.announce != -1) ||(EnergyFolksUserDetail.content.calendar != -1) ||(EnergyFolksUserDetail.content.jobs != -1)) {
            var tot=Math.max(0,EnergyFolksUserDetail.content.announce)+Math.max(0,EnergyFolksUserDetail.content.calendar)+Math.max(0,EnergyFolksUserDetail.content.jobs);
            outtext+='<li class="menupop" onmouseout="EnFolks_get_object(\'efadminbar_subc\').style.display=\'none\';" onmouseover="EnFolks_get_object(\'efadminbar_subc\').style.display=\'block\';">';
            outtext+='<a class="ab-item" href="javascript:;" ';
            if(tot > 0)
                outtext+='style="background-color:darkred;"'
            outtext+='>EnergyFolks Queues ('+tot+')</a>';
            outtext+='<div id="efadminbar_subc" class="ab-sub-wrapper"><ul class="ab-submenu">';
            if(EnergyFolksUserDetail.content.calendar != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/calendar/contentcontroliframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Events ('+EnergyFolksUserDetail.content.calendar+')</a></li>';
            if(EnergyFolksUserDetail.content.jobs != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/jobs/contentcontroliframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Jobs ('+EnergyFolksUserDetail.content.jobs+')</a></li>';
            if(EnergyFolksUserDetail.content.announce != -1)
                outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/announce/contentcontroliframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Bulletins ('+EnergyFolksUserDetail.content.announce+')</a></li>';
            outtext+='</ul></div></li>';
            if(EnFolks_get_object("wp-admin-bar-energyfolks2"))
                EnFolks_get_object("wp-admin-bar-energyfolks2").innerHTML=outtext2+"</ul></div>";
        } else {
            if(EnFolks_get_object("wp-admin-bar-energyfolks2"))
                EnFolks_get_object("wp-admin-bar-energyfolks2").style.display='none';
        }
        if(EnergyFolksUserDetail.has_posts) {
            outtext+='<li class="menupop" onmouseout="EnFolks_get_object(\'efadminbar_sub2\').style.display=\'none\';" onmouseover="EnFolks_get_object(\'efadminbar_sub2\').style.display=\'block\';">';
            outtext+='<a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/welcome/Manageiframe/'+EnFolksAffiliateId+'\',1035,650);EnFolksWaitForLoad();">Your Posts</a>';
            outtext+='<div id="efadminbar_sub2" class="ab-sub-wrapper"><ul class="ab-submenu">';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/calendar/mineiframe/'+EnFolksAffiliateId+'#\',1035,650);EnFolksWaitForLoad();">Event Posts ('+EnergyFolksUserDetail.posts.Event+')</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/jobs/mineiframe/'+EnFolksAffiliateId+'#\',1035,650);EnFolksWaitForLoad();">Job Posts ('+EnergyFolksUserDetail.posts.Jobs+')</a></li>';
            outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/announce/mineiframe/'+EnFolksAffiliateId+'#\',1035,650);EnFolksWaitForLoad();">Bulletin Posts ('+EnergyFolksUserDetail.posts.Announcement+')</a></li>';
            outtext+='</ul></div></li>';
            if(EnFolks_get_object("wp-admin-bar-energyfolks3"))
                EnFolks_get_object("wp-admin-bar-energyfolks3").innerHTML=outtext2+"</ul></div>";
        } else {
            if(EnFolks_get_object("wp-admin-bar-energyfolks3"))
                EnFolks_get_object("wp-admin-bar-energyfolks3").style.display='none';
        }
        outtext+='<li class="menupop" onmouseout="EnFolks_get_object(\'efadminbar_sub3\').style.display=\'none\';" onmouseover="EnFolks_get_object(\'efadminbar_sub3\').style.display=\'block\';"><a class="ab-item" href="javascript:;">+ New</a>';
        outtext+='<div id="efadminbar_sub3" class="ab-sub-wrapper"><ul class="ab-submenu">';
        outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/calendar/externalpost/'+EnFolksAffiliateId+'/-1\',1035,650);EnFolksWaitForLoad();">Event Post</a></li>';
        outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/jobs/externalpost/'+EnFolksAffiliateId+'/-1\',1035,650);EnFolksWaitForLoad();">Job Post</a></li>';
        outtext+='<li><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/announce/externalpost/'+EnFolksAffiliateId+'/-1\',1035,650);EnFolksWaitForLoad();">Bulletin Post</a></li>';
        outtext+='</ul></div>';
        var tots=this.customMenuItems.length;
        for(var i=0;i<tots;i++)
            outtext+='<li class="menupop"><a class="ab-item" href="'+this.customMenuItems[i].url+'">'+this.customMenuItems[i].title+"</a></li>";
        outtext+='</li></ul><ul class="ab-top-menu ab-top-secondary"><li onmouseout="EnFolks_get_object(\'efadminbar_subr\').style.display=\'none\';" onmouseover="EnFolks_get_object(\'efadminbar_subr\').style.display=\'block\';" class="menupop"><a class="ab-item" href="https://www.energyfolks.com/" target="_blank"><i>an <img src="https://images.energyfolks.com/images/toplogoNEW2.png" border=0 style="position:relative;top:-1px;border-width:0px;" class="avatar" align="absmiddle"> affiliate</i></a>';
        outtext+='<div id="efadminbar_subr" class="ab-sub-wrapper"><div style="padding:3px;text-align:left;color:#666666;text-shadow:none;line-height:1.15;"><div style="text-align:center;"><img src="https://www.energyfolks.com/resourceimage/PartnerPic.png" style="display:inline;"></div>We are an energyfolks affiliate organization.  Energyfolks is a not-for-profit network of networks dedicated to connecting energy students and professionals in their neighborhood and around the globe.</div><ul class="ab-submenu">';
        outtext+='<li><a class="ab-item" href="https://www.energyfolks.com/" target="_blank">Learn more...</a></li></ul>';
        outtext+='</div>';
        outtext+='<li class="menupop"><a class="ab-item" href="javascript:;" onclick="EnFolksMessageSize(\'https://www.energyfolks.com/welcome/feedback/'+EnFolksAffiliateId+'\',480,520);EnFolksWaitForLoad();">Feedback</a></li>';
        outtext+='</li></ul></div>';
    }
    if(EnFolks_get_object("customefadminbar")) {
        EnFolks_get_object("customefadminbar").innerHTML=outtext+"<div id='efadminbar' style='display:none;'></div>";
        outtext='';
    } else {
        var div = document.createElement('div');
        div.id = 'efadminbar';
        if (document.body.firstChild)
            document.body.insertBefore(div, document.body.firstChild);
        else
            document.body.appendChild(div);
        if(this.TopBarFixed) {
            var div2 = document.createElement('div');
            div2.id = 'efadminbar_spacer';
            if (document.body.firstChild)
                document.body.insertBefore(div2, document.body.firstChild);
            else
                document.body.appendChild(div2);
            EnFolks_get_object("efadminbar").style.position='fixed';
            var animate=this.getCookie('EnFolksTopBarAnimated');
            if((animate == null ) || (animate == "")) {
                var exdate=new Date();
                exdate.setDate(exdate.getDate() + 1);
                var c_value=escape('1') + "; expires="+exdate.toUTCString();
                document.cookie="EnFolksTopBarAnimated=" + c_value;
                EnFolks_get_object("efadminbar").style.overflow='hidden';
                EnFolks_get_object("efadminbar").style.height='0px';
                EnFolks_get_object("efadminbar_spacer").style.height='0px';
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='4px';EnFolks_get_object("efadminbar_spacer").style.height='4px';},50);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='8px';EnFolks_get_object("efadminbar_spacer").style.height='8px';},100);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='12px';EnFolks_get_object("efadminbar_spacer").style.height='12px';},150);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='16px';EnFolks_get_object("efadminbar_spacer").style.height='16px';},200);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='20px';EnFolks_get_object("efadminbar_spacer").style.height='20px';},250);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='24px';EnFolks_get_object("efadminbar_spacer").style.height='24px';},300);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='28px';EnFolks_get_object("efadminbar_spacer").style.height='28px';EnFolks_get_object("efadminbar").style.overflow='visible';},350);
            }
        } else {
            EnFolks_get_object("efadminbar").style.position='relative';
            var animate=this.getCookie('EnFolksTopBarAnimated');
            if((animate == null ) || (animate == "")) {
                var exdate=new Date();
                exdate.setDate(exdate.getDate() + 1);
                var c_value=escape('1') + "; expires="+exdate.toUTCString();
                document.cookie="EnFolksTopBarAnimated=" + c_value;
                EnFolks_get_object("efadminbar").style.overflow='hidden';
                EnFolks_get_object("efadminbar").style.height='0px';
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='4px';},50);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='8px';},100);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='12px';},150);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='16px';},200);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='20px';},250);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='24px';},300);
                window.setTimeout(function() { EnFolks_get_object("efadminbar").style.height='28px';EnFolks_get_object("efadminbar").style.overflow='visible';},350);
            }
        }
    }
    if(!EnFolks_get_object("EnFolksHiddenSubForm")) outtext+="<span style='display:none;'><form method='post' action='" + this.callbackURL + "' id='EnFolksHiddenSubForm'><input type='hidden' name='hash' id='EnFolksHash' value=''><input type='hidden' name='forwardto' id='EnfolksForwardTo' value=''><input type=submit></form></span>";
    EnFolks_get_object("efadminbar").innerHTML=outtext;
    if(EnergyFolksUserDetail.user_id > 0)
        EnFolks_get_object("efadminbar-logout").onclick=function(obj) { return function() { obj.ExecuteLogout(); }; }(this);
    else {
        EnFolks_get_object('EnFolksExternalLoginFormTop').onsubmit=function(obj) {return function() {obj.SubFormTop();return false;};}(this);
        EnFolks_get_object("EnFolksCreateAccountTop").onclick=function(obj) {return function() {EnFolks_get_object("efadminbar_sub1").style.display="none";EnFolksMessageSize("https://www.energyfolks.com/accounts/CreateAccountExternal/"+obj.affiliateid,900,600);EnFolksWaitForLoad();};}(this);
    }
}