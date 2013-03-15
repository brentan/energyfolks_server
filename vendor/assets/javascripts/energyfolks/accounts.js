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
    EnergyFolks.$('body').on('submit','.EnFolksExternalLoginForm', function() {
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
        var url=EnergyFolks.server_url + "/users/try_login?user=" + EscapeAll(self.find('.EnFolksUser').val()) +"&pass=" +EscapeAll(self.find('.EnFolksPass').val())+"&cook="+cook+"&"+EnergyFolks.urlhash()+"&aid="+EnergyFolks.id;
        window.open (url, "EnergyFolks_Login_Window","location=0,status=0,scrollbars=0, width=100,height=100");
        self.find('button').hide();
        if(self.find('.login_loading').length == 0) {
            var holder = EnergyFolks.$('<div class="login_loading"><img src="'+EnergyFolks.server_url+'/assets/loader.gif" style="display:inline;"></div>').hide().insertAfter(self.find('button'));
            holder.show();
        } else
            self.find('.login_loading').show();
        return false;
    });

    // Attach listener to hash for handling response of login form upon submit
    EnergyFolks.$(window).on('hashchange',function() {
        var hash = location.hash;
        if(hash.substr(1,6) == 'login_') {
            window.location.hash = '';
            if(hash.substr(7,5) == 'error') {
                EnergyFolks.showNotice("Invalid email address or password","red");
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
    });


    // Attach listener to all 'create account' links
});



/*
 LEGACY LIBRARY: This is provided for backwards compatibility.  Functions below simply access EnergyFolks namepsace functions
 */
function EnergyFolksLogin(callback)
{
    EnergyFolks.callbackURL=callback;
}
/*
 Set an alternative URL to forward to upon successful login, otherwise current page will be refreshed (NOTE FOR SECOND SCENARIO:
 you must use sessions if you refresh the current page, otherwise you will enter an infinite loop!)
 */
EnergyFolksLogin.prototype.ForwardTo = function(url) {
    this.forwardto=url;
}
/*
 Set an affiliate ID.  When set, user who click the 'new account' button will be greeted to a 'create account' screen that is branded
 with your affiliate information and either automatically selects the user to become a member of your affiliate group (if you have an open
 group) or provides instructions to the user on registering with a valid email address to become and affiliate member.
 For more information on becoming an affiliate, visit https://www.energyfolks.com/developer
 To find your affiliate ID to use as an input for this function, visit the affiliate
 details page at energyfolks.com, and look in the location bar.  The URL will be of the form energyfolks.com/partner/detail/ID
 */
EnergyFolksLogin.prototype.SetAffiliate = function(id) {
    EnergyFolks.id = id;
}
/*
 * Hide the top bar (suppress it from displaying)
 */
EnergyFolksLogin.prototype.HideTopbar = function() {
    document.write("<div id='efadminbar' style='display:none;position:relative;'></div>");
}
/*
 * unfix the top bar and make it dissapear when scrolling down
 */
EnergyFolksLogin.prototype.UnFixTopbar = function() {
    this.TopBarFixed=false;
}
/*
 Check Cookies: This should be run on all pages to check client cookie and auto-login if recognized
 */
EnergyFolksLogin.prototype.CheckCookies = function() {

}
// BELOW IS TODO!!! MAKE SURE TO UPDATE THIS STUFF!
/*
 LOGIN BOX: The below will create a login box with username/password and join us links etc
 */
EnergyFolksLogin.prototype.DisplayLogin = function() {
    document.write("<div id='EnFolksLoginDiv_"+this.LoginID+"' style='text-align:center;'><h1>Loading...</h1><img src='https://images.energyfolks.com/images/loader.gif' style='display:inline;' align=center><h6>Contacting energyfolks.com user system...</h6></div>");
    this.loadLoginBox();
}

/*
 * CUSTOM LOGIN BOX: Initialize the script.  Run this after you have added your custom form elements to page.
 */
EnergyFolksLogin.prototype.CustomLogin = function() {
    EnFolks_get_object('EnFolksExternalCustomLoginForm').onsubmit=function(obj) {return function() {obj.SubFormCustom();return false;};}(this);
    if(EnFolks_get_object("EnFolksCreateAccount"))
        EnFolks_get_object("EnFolksCreateAccount").onclick=function(obj) {return function() {EnFolksMessageSize("https://www.energyfolks.com/accounts/CreateAccountExternal/"+obj.affiliateid,900,600);EnFolksWaitForLoad();};}(this);
    if(!EnFolks_get_object("EnFolksHiddenSubForm"))
        document.write("<div style='display:none;'><form method='post' action='" + this.callbackURL + "' id='EnFolksHiddenSubForm'><input type='hidden' name='hash' id='EnFolksHash' value=''><input type='hidden' name='forwardto' id='EnfolksForwardTo' value=''></form></div>");
}

/*
 SIMPLE LINK BOX: Show a link to the login page and get account page
 */
EnergyFolksLogin.prototype.DisplaySimpleLogin = function(ShowDetails) {
    document.write("<div id='EnFolksLoginDiv_"+this.LoginID+"' style='text-align:center;'><h6>Loading...</h6></div>");
    this.loadSimpleBox(ShowDetails);
}


/*
 ALIAS KEPT FOR BACKWARDS COMPATIBILITY
 */
EnergyFolksLogin.prototype.DisplaySimpleLoginBig = function(ShowDetails) {
    //Alias, provided for backwards compatibility
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
/*
 SERVER SIDE TYPE LOGIN FUNCTION:
 Initialize the script.  Will display a link that says 'logout'.  This will forward to the 'forwardto' address, or reload page
 when clicked, after logging out the current user.  Only call this function if you have verified the user is already logged in
 using session variables in PHP
 */
EnergyFolksLogin.prototype.Logout = function(userclass,userstyle) {
    document.write("<span id='EnFolksLogoutSpan3'><a href='javascript:;' id='EnFolksLogoutLink' class='"+userclass+"' style='"+userstyle+"'>Logout</a></span>");
    if(!EnFolks_get_object("EnFolksHiddenSubForm")) document.write("<span style='display:none;'><form method='post' action='" + this.callbackURL + "' id='EnFolksHiddenSubForm'><input type='hidden' name='hash' id='EnFolksHash' value=''><input type='hidden' name='forwardto' id='EnfolksForwardTo' value=''></form></span>");
    EnFolks_get_object("EnFolksLogoutLink").onclick=function(obj){return function() {obj.ExecuteLogout();return false;};}(this);
}
/*
 SERVER SIDE FUNCTION: Should be called on ALL pages to ensure the top display bar is shown (only run if logged in)
 */
EnergyFolksLogin.prototype.DisplayTopbar = function() {
    this.ShowUserDetails();
    EnFolks_get_object('EnFolksDetsDiv').style.display='none';
}

//The following functions are internal functions and should not need to be called directly

// Performs the full logout
EnergyFolksLogin.prototype.ExecuteLogout = function() {
    var tExpDate=new Date();
    tExpDate.setTime( tExpDate.getTime()-(60*1000) );
    document.cookie= "EnFolksSuccessLogin=" +escape(0)+";expires="+ tExpDate.toGMTString();
    var url=this.forwardto
    if(url == "")
        url=location.href;
    EnFolks_get_object('EnfolksForwardTo').value=url;
    if((this.callbackURL != null) && (this.callbackURL != "")) {
        var ajaxRequest;  // The variable that makes Ajax possible!
        try{
            // Opera 8.0+, Firefox, Safari
            ajaxRequest = new XMLHttpRequest();
        } catch (e){
            // Internet Explorer Browsers
            try{
                ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try{
                    ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e){
                    // Something went wrong
                    alert("Your browser does not seem to support AJAX calls.  You will not be able to login.");
                    return false;
                }
            }
        }
        // Create a function that will receive data sent from the server
        ajaxRequest.onreadystatechange = function(obj){return function(){
            if(ajaxRequest.readyState == 4) {
                obj.FinalLogout();
            }
        };}(this);
        ajaxRequest.open("GET",this.callbackURL, true);
        ajaxRequest.send(null);
    } else
        this.FinalLogout();
    EnFolks_get_object('EnFolksLoginDiv').innerHTML="<h1>Loading...</h1><img src='https://images.energyfolks.com/images/loader.gif' style='display:inline;' align=center><h6>Contacting energyfolks.com user system...</h6>";
}
EnergyFolksLogin.prototype.FinalLogout = function() {
    var tExpDate=new Date();
    tExpDate.setTime( tExpDate.getTime()-(60*1000) );
    document.cookie= "EnFolksSuccessLogin=" +escape(0)+";expires="+ tExpDate.toGMTString();
    EnFolks_get_object('EnFolksHiddenSubForm').action="https://www.energyfolks.com/accounts/external_Logout";
    EnFolks_get_object('EnFolksHiddenSubForm').submit();
}
EnergyFolksLogin.prototype.FinalLogout2 = function() {
    var tExpDate=new Date();
    tExpDate.setTime( tExpDate.getTime()-(60*1000) );
    document.cookie= "EnFolksSuccessLogin=" +escape(0)+";expires="+ tExpDate.toGMTString();
    EnFolks_get_object('EnFolksHiddenSubForm2').action="https://www.energyfolks.com/accounts/external_Logout";
    EnFolks_get_object('EnFolksHiddenSubForm2').submit();
}
EnergyFolksLogin.prototype.ExecuteLogout2 = function() {
    var tExpDate=new Date();
    tExpDate.setTime( tExpDate.getTime()-(60*1000) );
    document.cookie= "EnFolksSuccessLogin=" +escape(0)+";expires="+ tExpDate.toGMTString();
    var url=this.forwardto;
    if(url == "")
        url=location.href;
    EnFolks_get_object('EnfolksForwardTo2').value=url;
    if(this.callbackURL != null) {
        var ajaxRequest;  // The variable that makes Ajax possible!
        try{
            // Opera 8.0+, Firefox, Safari
            ajaxRequest = new XMLHttpRequest();
        } catch (e){
            // Internet Explorer Browsers
            try{
                ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try{
                    ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e){
                    // Something went wrong
                    alert("Your browser does not seem to support AJAX calls.  You will not be able to login.");
                    return false;
                }
            }
        }
        // Create a function that will receive data sent from the server
        ajaxRequest.onreadystatechange = function(obj){return function(){
            if(ajaxRequest.readyState == 4) {
                obj.FinalLogout2();
            }
        };}(this);
        ajaxRequest.open("GET",this.callbackURL, true);
        ajaxRequest.send(null);
    } else
        this.FinalLogout2();
    EnFolks_get_object('EnFolksDetsDiv').innerHTML="<h1>Loading...</h1><img src='https://images.energyfolks.com/images/loader.gif' style='display:inline;' align=center><h6>Contacting energyfolks.com user system...</h6>";
}
var EnergyFolksLoginCallback=new Array();
var EnergyFolksHashKey="";
var EnFolksIsMobile=false;
var AlertedEnFolksIsMobile=false;
// Callback waiter...simply wait for server response and issue callback
EnergyFolksLogin.prototype.callbackWaiter = function() {
    //if(EnFolksIsMobile && !AlertedEnFolksIsMobile) {
    //   AlertedEnFolksIsMobile=true;
    //   if(confirm("Welcome!  Press 'OK' to view this page on our mobile-optimized site.")) {
    //       var cur_url=window.location.href;
    //       cur_url=cur_url.replace(/#.*/, "").replace(/\./g,"_dot_").replace(/\//g,"_slash_").replace(/\:/g,"_colon_").replace("?","_qmark_").replace(/&/g,"_amp_").replace(/=/g,"_equals_");
    //       window.location="https://www.energyfolks.com/mobile/ExtForward/"+this.affiliateid+"/"+cur_url+"/"+window.location.hash.replace("#","");
    //   }
    //}
    if(EnergyFolksLoginCallback[this.LoginID] == 1) {
        var tExpDate=new Date();
        tExpDate.setTime( tExpDate.getTime()+(60*1000) );
        document.cookie= "EnFolksSuccessLogin=" +(Subdata)+";expires="+ tExpDate.toGMTString();
        this.hash_key=EnergyFolksHashKey;
        this.callback();
    } else if(EnergyFolksLoginCallback[this.LoginID] == -1) {
        if(EnFolks_get_object('EnFolksExternalLoginForm')) {
            var nameEQ = "EnFolksSuccessLogin=";
            var ca = document.cookie.split(';');
            cook=0;
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) {cook= c.substring(nameEQ.length,c.length); break; }
            }
            if(cook != 0) {

                /* Below is part of a kludge to deal with browser that have disabled 3rd party cookies.  Flow is as follows:
                 * - user logs in
                 * - if login successful, this script stores credentials in cookie from client domain and reloads page
                 * - if on page reload the server responds that user is not logged in, client knows login was successful, so issue must be rejected 3rd party cookie
                 * - script will now forward to new window on server to log user in
                 * - new window is at 3rd party, so it can set cookies.  it sets login cookie, then issues a 'history.back();' request to send browser back
                 * - this code here checks that this occured, and does 1 final page refresh to force browser to again ask for user credentials from server...this time is should log user in
                 */
                var tExpDate=new Date();
                tExpDate.setTime( tExpDate.getTime()-(60*1000) );
                document.cookie= "EnFolksSuccessLogin=" +escape(0)+";expires="+ tExpDate.toGMTString();
                cook=cook.split("ENFOLKSSEPERATION")
                var subval="user="+cook[0]+"&pass="+cook[1]+"&cook="+cook[2];
                var cur_url=window.location.href;
                window.location.href="https://www.energyfolks.com/externallogin.php?ID=nocookie"+cur_url.replace(/#.*/, "").replace(/\./g,"_dot_").replace(/\//g,"_slash_").replace(/\:/g,"_colon_").replace("?","_qmark_").replace(/&/g,"_amp_").replace(/=/g,"_equals_")+"&"+subval;
            }
            EnFolks_get_object('EnFolksExternalLoginForm').onsubmit=function(obj) {return function() {obj.SubForm();return false;};}(this);
        }
        if(EnFolks_get_object("EnFolksCreateAccount"))
            EnFolks_get_object("EnFolksCreateAccount").onclick=function(obj) {return function() {EnFolksMessageSize("https://www.energyfolks.com/accounts/CreateAccountExternal/"+obj.affiliateid,900,600);EnFolksWaitForLoad();};}(this);
        if(EnFolks_get_object("EnFolksLogoutSpan")) {
            if(!EnFolks_get_object("EnFolksHiddenSubForm"))
                EnFolks_get_object("EnFolksLogoutSpan").innerHTML="<a href='javascript:;' id='EnFolksLogoutLink'>Logout</a><span style='display:none;'><form method='post' action='" + this.callbackURL + "' id='EnFolksHiddenSubForm'><input type='hidden' name='hash' id='EnFolksHash' value=''><input type='hidden' name='forwardto' id='EnfolksForwardTo' value=''></form></span>";
            else
                EnFolks_get_object("EnFolksLogoutSpan").innerHTML="<a href='javascript:;' id='EnFolksLogoutLink'>Logout</a>";
            EnFolks_get_object("EnFolksLogoutLink").onclick=function(obj){return function() {obj.ExecuteLogout();return false;};}(this);
        }
        if(EnFolks_get_object("EnFolksLogoutSpan2")) {
            if(!EnFolks_get_object("EnFolksHiddenSubForm2"))
                EnFolks_get_object("EnFolksLogoutSpan2").innerHTML="<a href='javascript:;' id='EnFolksLogoutLink2'>Logout</a><span style='display:none;'><form method='post' action='" + this.callbackURL + "' id='EnFolksHiddenSubForm2'><input type='hidden' name='hash' id='EnFolksHash2' value=''><input type='hidden' name='forwardto' id='EnfolksForwardTo2' value=''></form></span>";
            else
                EnFolks_get_object("EnFolksLogoutSpan2").innerHTML="<a href='javascript:;' id='EnFolksLogoutLink2'>Logout</a>";
            EnFolks_get_object("EnFolksLogoutLink2").onclick=function(obj){return function() {obj.ExecuteLogout();return false;};}(this);
        }
        this.CreateTopBar();
    } else {
        window.setTimeout(function(obj){return function() {obj.callbackWaiter();}}(this),250);
    }
}
EnergyFolksLogin.prototype.callbackWaiterTop = function() {
    if(EnergyFolksLoginCallback[234567] == 1) {
        var tExpDate=new Date();
        tExpDate.setTime( tExpDate.getTime()+(60*1000) );
        document.cookie= "EnFolksSuccessLogin=" +(Subdata)+";expires="+ tExpDate.toGMTString();
        this.hash_key=EnergyFolksHashKey;
        this.callback();
    } else if(EnergyFolksLoginCallback[234567] == -1) {
        var nameEQ = "EnFolksSuccessLogin=";
        var ca = document.cookie.split(';');
        cook=0;
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) {cook= c.substring(nameEQ.length,c.length); break; }
        }
        if(cook != 0) {

            /* Below is part of a kludge to deal with browser that have disabled 3rd party cookies.  Flow is as follows:
             * - user logs in
             * - if login successful, this script stores credentials in cookie from client domain and reloads page
             * - if on page reload the server responds that user is not logged in, client knows login was successful, so issue must be rejected 3rd party cookie
             * - script will now forward to new window on server to log user in
             * - new window is at 3rd party, so it can set cookies.  it sets login cookie, then issues a 'history.back();' request to send browser back
             * - this code here checks that this occured, and does 1 final page refresh to force browser to again ask for user credentials from server...this time is should log user in
             */
            var tExpDate=new Date();
            tExpDate.setTime( tExpDate.getTime()-(60*1000) );
            document.cookie= "EnFolksSuccessLogin=" +escape(0)+";expires="+ tExpDate.toGMTString();
            cook=cook.split("ENFOLKSSEPERATION")
            var subval="user="+cook[0]+"&pass="+cook[1]+"&cook="+cook[2];
            var cur_url=window.location.href;
            window.location.href="https://www.energyfolks.com/externallogin.php?ID=nocookie"+cur_url.replace(/#.*/, "").replace(/\./g,"_dot_").replace(/\//g,"_slash_").replace(/\:/g,"_colon_").replace("?","_qmark_").replace(/&/g,"_amp_").replace(/=/g,"_equals_")+"&"+subval;
        }
    } else {
        window.setTimeout(function(obj){return function() {obj.callbackWaiterTop();}}(this),250);
    }
}
EnergyFolksLogin.prototype.callbackWaiterCustom = function() {
    //if(EnFolksIsMobile && !AlertedEnFolksIsMobile) {
    //   AlertedEnFolksIsMobile=true;
    //   if(confirm("Welcome!  Press 'OK' to view this page on our mobile-optimized site.")) {
    //       var cur_url=window.location.href;
    //       cur_url=cur_url.replace(/#.*/, "").replace(/\./g,"_dot_").replace(/\//g,"_slash_").replace(/\:/g,"_colon_").replace("?","_qmark_").replace(/&/g,"_amp_").replace(/=/g,"_equals_");
    //       window.location="https://www.energyfolks.com/mobile/ExtForward/"+this.affiliateid+"/"+cur_url+"/"+window.location.hash.replace("#","");
    //   }
    //}
    if(EnergyFolksLoginCallback[123456] == 1) {
        var tExpDate=new Date();
        tExpDate.setTime( tExpDate.getTime()+(60*1000) );
        document.cookie= "EnFolksSuccessLogin=" +(Subdata)+";expires="+ tExpDate.toGMTString();
        this.hash_key=EnergyFolksHashKey;
        this.callback();
    } else if(EnergyFolksLoginCallback[123456] == -1) {
        EnFolks_get_object('login_loading').style.display='none';
        if(EnFolks_get_object('EnFolksExternalLoginForm')) {
            var nameEQ = "EnFolksSuccessLogin=";
            var ca = document.cookie.split(';');
            cook=0;
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) {cook= c.substring(nameEQ.length,c.length); break; }
            }
            if(cook != 0) {

                /* Below is part of a kludge to deal with browser that have disabled 3rd party cookies.  Flow is as follows:
                 * - user logs in
                 * - if login successful, this script stores credentials in cookie from client domain and reloads page
                 * - if on page reload the server responds that user is not logged in, client knows login was successful, so issue must be rejected 3rd party cookie
                 * - script will now forward to new window on server to log user in
                 * - new window is at 3rd party, so it can set cookies.  it sets login cookie, then issues a 'history.back();' request to send browser back
                 * - this code here checks that this occured, and does 1 final page refresh to force browser to again ask for user credentials from server...this time is should log user in
                 */
                var tExpDate=new Date();
                tExpDate.setTime( tExpDate.getTime()-(60*1000) );
                document.cookie= "EnFolksSuccessLogin=" +escape(0)+";expires="+ tExpDate.toGMTString();
                cook=cook.split("ENFOLKSSEPERATION")
                var subval="user="+cook[0]+"&pass="+cook[1]+"&cook="+cook[2];
                var cur_url=window.location.href;
                window.location.href="https://www.energyfolks.com/externallogin.php?ID=nocookie"+cur_url.replace(/#.*/, "").replace(/\./g,"_dot_").replace(/\//g,"_slash_").replace(/\:/g,"_colon_").replace("?","_qmark_").replace(/&/g,"_amp_").replace(/=/g,"_equals_")+"&"+subval;
            }

            EnFolks_get_object('EnFolksExternalLoginForm').onsubmit=function(obj) {return function() {obj.SubFormCustom();return false;};}(this);
        }
        if(EnFolks_get_object("EnFolksCreateAccount"))
            EnFolks_get_object("EnFolksCreateAccount").onclick=function(obj) {return function() {EnFolksMessageSize("https://www.energyfolks.com/accounts/CreateAccountExternal/"+obj.affiliateid,900,600);EnFolksWaitForLoad();};}(this);
        this.CreateTopBar();
    } else {
        window.setTimeout(function(obj){return function() {obj.callbackWaiterCustom();}}(this),250);
    }
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
EnergyFolksLogin.prototype.getCookie = function(c_name)
{
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name)
        {
            return unescape(y);
        }
    }
}
// Contacts energyfolks and tests for current login
EnergyFolksLogin.prototype.testLogin = function(displayLogin){
    this.AjaxRequest("https://www.energyfolks.com/accounts/externalcookie/"+this.LoginID+"/"+displayLogin+"/"+this.affiliateid);
    EnergyFolksLoginCallback[this.LoginID]=0;
    window.setTimeout(function(obj){return function() {obj.callbackWaiter();}}(this),250);
}

// Contacts energyfolks and tests for current login
EnergyFolksLogin.prototype.testLoginScen1 = function(ShowDetails){
    this.AjaxRequest("https://www.energyfolks.com/accounts/externalcookie2/"+this.LoginID+"/"+ShowDetails+"/"+this.affiliateid);
    EnergyFolksLoginCallback[this.LoginID]=0;
    window.setTimeout(function(obj){return function() {obj.callbackWaiter();}}(this),250);
}
// Contacts energyfolks and tests for current login
EnergyFolksLogin.prototype.testLoginScen2 = function(ShowDetails){
    this.AjaxRequest("https://www.energyfolks.com/accounts/externalcookie3/"+this.LoginID+"/"+ShowDetails+"/"+this.affiliateid);
    EnergyFolksLoginCallback[this.LoginID]=0;
    window.setTimeout(function(obj){return function() {obj.callbackWaiter();}}(this),250);
}
// Contacts energyfolks and tests for current login
EnergyFolksLogin.prototype.testLoginScen3 = function(ShowDetails){
    this.AjaxRequest("https://www.energyfolks.com/accounts/externalcookie4/"+this.LoginID+"/"+ShowDetails+"/"+this.affiliateid);
    EnergyFolksLoginCallback[this.LoginID]=0;
    window.setTimeout(function(obj){return function() {obj.callbackWaiter();}}(this),250);
}
// Contacts energyfolks and tests for current login
EnergyFolksLogin.prototype.ShowUserDetailBox = function(){
    this.AjaxRequest("https://www.energyfolks.com/accounts/externaldets/"+this.LoginID+"/"+this.affiliateid);
    EnergyFolksLoginCallback[this.LoginID]=0;
    window.setTimeout(function(obj){return function() {obj.callbackWaiter();}}(this),250);
}

EnergyFolksLogin.prototype.AjaxRequest = function(url) {
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= url;
    head.appendChild(script);
}
var Subdata='';
EnergyFolksLogin.prototype.SubFormTop = function() {
    if(EnFolks_get_object('EnFolksCookieTop').checked)
        var cook=1;
    else
        var cook=0;
    EnFolks_get_object('EnFolks_top_login_loading').style.display='block';EnFolks_get_object('EnFolks_top_login_box').style.display='none';EnFolks_get_object('EnFolks_top_login_error').innerHTML='';
    Subdata=this.EscapeAll(EnFolks_get_object('EnFolksUserTop').value) +"ENFOLKSSEPERATION" +this.EscapeAll(EnFolks_get_object('EnFolksPassTop').value)+"ENFOLKSSEPERATION"+cook;
    var url="https://www.energyfolks.com/externallogin.php?ID=234567&user=" + this.EscapeAll(EnFolks_get_object('EnFolksUserTop').value) +"&pass=" +this.EscapeAll(EnFolks_get_object('EnFolksPassTop').value)+"&cook="+cook;
    url2=url+"&safari=1";
    var win=window.open (url2, "safari_bug_window","location=0,status=0,scrollbars=0, width=300,height=300");
    window.setTimeout(function(win,url) { return function() {
        EnFolksSafariLogin(win,url);
    }}(win,url),100);
    EnergyFolksLoginCallback[234567]=0;
    window.setTimeout(function(obj){return function() {obj.callbackWaiterTop();}}(this),250);
}
EnergyFolksLogin.prototype.SubForm = function() {
    if(EnFolks_get_object('EnFolksCookie').checked)
        var cook=1;
    else
        var cook=0;
    Subdata=this.EscapeAll(EnFolks_get_object('EnFolksUser').value) +"ENFOLKSSEPERATION" +this.EscapeAll(EnFolks_get_object('EnFolksPass').value)+"ENFOLKSSEPERATION"+cook;
    var url="https://www.energyfolks.com/externallogin.php?ID="+this.LoginID+"&user=" + this.EscapeAll(EnFolks_get_object('EnFolksUser').value) +"&pass=" +this.EscapeAll(EnFolks_get_object('EnFolksPass').value)+"&cook="+cook;
    url2=url+"&safari=1";
    var win=window.open (url2, "safari_bug_window","location=0,status=0,scrollbars=0, width=300,height=300");
    window.setTimeout(function(win,url) { return function() {
        EnFolksSafariLogin(win,url);
    }}(win,url),100);
    EnergyFolksLoginCallback[this.LoginID]=0;
    window.setTimeout(function(obj){return function() {obj.callbackWaiter();}}(this),250);
    EnFolks_get_object('EnFolksLoginDiv').innerHTML="<h1>Loading...</h1><img src='https://images.energyfolks.com/images/loader.gif' style='display:inline;' align=center><h6>Contacting energyfolks.com user system...</h6>";
}
function EnFolksSafariLogin(win,url) {
    if (win && win.closed) {
        var head= document.getElementsByTagName('head')[0];
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= url;
        head.appendChild(script);
    } else {
        window.setTimeout(function(win,url) { return function() {
            EnFolksSafariLogin(win,url);
        }}(win,url),1000);
    }
}
EnergyFolksLogin.prototype.SubFormCustom = function() {
    if(EnFolks_get_object('EnFolksCookie').checked)
        var cook=1;
    else
        var cook=0;
    Subdata=this.EscapeAll(EnFolks_get_object('EnFolksUser').value) +"ENFOLKSSEPERATION" +this.EscapeAll(EnFolks_get_object('EnFolksPass').value)+"ENFOLKSSEPERATION"+cook;
    var url="https://www.energyfolks.com/externallogin.php?ID=123456&user=" + this.EscapeAll(EnFolks_get_object('EnFolksUser').value) +"&pass=" +this.EscapeAll(EnFolks_get_object('EnFolksPass').value)+"&cook="+cook;
    url2=url+"&safari=1";
    var win=window.open (url2, "safari_bug_window","location=0,status=0,scrollbars=0, width=300,height=300");
    window.setTimeout(function(win,url) { return function() {
        EnFolksSafariLogin(win,url);
    }}(win,url),100);
    EnergyFolksLoginCallback[this.LoginID]=0;
    window.setTimeout(function(obj){return function() {obj.callbackWaiterCustom();}}(this),250);
    EnFolks_get_object('login_loading').style.display='block';
    EnFolks_get_object('login_loading').innerHTML="<h1>Loading...</h1><img src='https://images.energyfolks.com/images/loader.gif' style='display:inline;' align=center><h6>Contacting energyfolks.com user system...</h6>";
}
EnergyFolksLogin.prototype.callback = function() {
    if(this.callbackURL == null) {
        var url=this.forwardto;
        if(this.wordpress != false) {
            if(url == "") url=location.href;
            url=url.split("#");
            url=url[0].split("?");
            url=url[0]+"?enfolks_hash="+this.hash_key;
            var head= document.getElementsByTagName('head')[0];
            var script= document.createElement('script');
            script.type= 'text/javascript';
            script.src= url;
            head.appendChild(script);
            //document.write("<script language=javascript src='"+url+"'></script>");
            return;
        }
        if(url == "")
            location.reload(true);
        else
            location.href=url;
    } else {
        EnFolks_get_object('EnFolksHash').value=this.hash_key;
        var url=this.forwardto;
        if(url == "") url=location.href;
        EnFolks_get_object('EnfolksForwardTo').value=url;
        EnFolks_get_object('EnFolksHiddenSubForm').submit();
    }
}
var EnergyFolksUserDetail={user_id:0};
EnergyFolksLogin.prototype.EscapeAll = function(str) {
    var val=encodeURIComponent(str.replace(/%/g,"ENFOLKSPERCENT").replace(/'/g,"ENFOLKSPERCENT27").replace(/\\/g,"ENFOLKSPERCENT5C"));
    if(val == "")
        return "BLANK";
    else
        return val;
}
