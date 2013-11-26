/*
 * Deprecated functions or calls are placed here that may still be utilized for backwards compatibility reasons
 */

function EnFolks_closemessage() {
}

function EnFolksMessageSize(url, width, height) {
   // https://www.energyfolks.com/accounts/forgotpassOUT/18 --> reset_password
   // https://www.energyfolks.com/accounts/ReSendActivationOUT --> resend_activation
   // EnFolksMessageSize('https://www.energyfolks.com/accounts/CreateAccountExternal/18',900,600);EnFolksWaitForLoad(); NEEDS TO REDIRECT CORRECTLY TO users/new?aid=
}

function EnFolksWaitForLoad() {
}

function EnFolks_ThirdPartyLogin(type) {
    //type = 'facebook' or 'linkedin' or 'google' or 'twitter'.  This is the onclick event
    document.write(EnergyFolks.ThirdPartyLogin(type));
}

function EnFolks_Add_Onload(code) {
    EnergyFolks.$(code);
}





/*
 LEGACY ACCOUNTS LIBRARY
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
EnergyFolksLogin.prototype.RestrictToAffiliate = function(id) {
    EnergyFolks.id = id;
    EnergyFolks.source_restrict = EnergyFolks.AFFILIATE_ONLY;
}
EnergyFolksLogin.prototype.RestrictToHighlighted = function(id) {
    EnergyFolks.id = id;
    EnergyFolks.source_restrict = EnergyFolks.HIGHLIGHTED_ONLY;
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
EnergyFolksLogin.prototype.HideTopbar = function() {
    EnergyFolks.HideTopbar();
}
EnergyFolksLogin.prototype.UnFixTopbar = function() {
    EnergyFolks.UnFixTopbar();
}
EnergyFolksLogin.prototype.AddMenuItem = function(title,url) { EnergyFolks.AddMenuItem(title,url)};
EnergyFolksLogin.prototype.CreateTopBar = function() { EnergyFolks.CreateTopBar(); };

//The following functions were internal functions and are no longer used.  Provided simply for compatibility
EnergyFolksLogin.wordpress = false;
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

