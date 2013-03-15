/** Global helper functions used throughout the energyfolks library **/

//Functions that create possibly duplicative elements utilize this function to ensure unique ids for each
EnergyFolks.uniqueIdHolder = 0;
EnergyFolks.uniqueId = function() {
    return EnergyFolks.uniqueIdHolder++;
}

/* Ajax here is weird because we have to abide by same-origin policy...this means no 'real' ajax.  Instead,
 * everything is turned into a call to a javascript src file, which then acts on the EnergyFolks object.
 * Ajax function takes 3 inputs:
 * command: the command to run on the server
 * parameters: hash object or string to include as query string in request
 * callback: function to run after ajax is complete.  Output of server is the input to this function
 */
EnergyFolks.callbacks = [];
EnergyFolks.ajax = function(command, parameters, callback) {
    var url = EnergyFolks.server_url + '/ajax/' + command + '.js?'
    // Add input parameters as query string to url
    if(EnergyFolks.$.type(parameters) === 'object')
        url+=EnergyFolks.$.param(parameters);
    else if(EnergyFolks.$.type(parameters) === 'string')
        url+=parameters;
    // Do we have a callback function?  If so, register it
    if(typeof callback !== 'undefined') {
        EnergyFolks.callbacks.push(callback);
        url+="&callback="+(EnergyFolks.callbacks.length-1)
    }
    // Append to the head the javascript load request...upon addition the browser will load the external js file.
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= url;
    head.appendChild(script);
}

//Load popup that has internal iframe that loads external content (show 'loading' while content loads)
EnergyFolks.iframe_popup = function(command, parameters) {
    //TO WRITE: IFRAME popup, Use current code that utilizes 'EnFolksWaitForLoad()'.  Popup appears with 'loading' circle, this goes
    //away once page has loaded thanks to a change in the URL hash which is passed forward to the server
}

//Load popup that loads remote content via 'ajax'
EnergyFolks.remote_popup = function(command, parameters) {
    //TO WRITE: This utilizes the ajax function, but prior to that it must create a popup box and place loading HTML in it
}

//Load popup and directly insert html
EnergyFolks.direct_popup = function(html) {
    //TO WRITE: Show the popup and populate it
}

//Hide the popup
EnergyFolks.hide_popup = function() {
    //TO WRITE: Hide the popup
}

/*
 * Popup listener (any link with class 'EnergyFolks_popup' will launch a popup.
 * link should have the following attributes:
 * data-command: command to run on server
 * data-params: serialized parameter list to include with request
 * data-iframe: boolean ('true'/'false') that sets if load via 'ajax' or in an iframe
 */
EnergyFolks.$(function() {
    EnergyFolks.$('body').on('click','.EnergyFolks_popup', function() {
        var self = EnergyFolks.$(this);
        if(self.attr('data-iframe') == 'true')
            EnergyFolks.iframe_popup(self.attr('data-command'),params);
        else
            EnergyFolks.remote_popup(self.attr('data-command'),params);
        return false;
    });
});

// Returns a hash of the current url for use in a query string that requires the frame to talk with the parent through
// hash tag changes
EnergyFolks.urlhash = function() {
    var current_url=window.location.href;
    return "current_url="+current_url.replace(/#.*/, "").replace(/\./g,"_dot_").replace(/\//g,"_slash_").replace(/\:/g,"_colon_").replace("?","_qmark_").replace(/&/g,"_amp_").replace(/=/g,"_equals_");
}

// Information notices: show a notice at the top of the page, then hide after a certain time.
EnergyFolks.showNotice = function(notice, klass, timeout) {
    if(typeof timeout === 'undefined') timeout = 2500;
    if(typeof klass === 'undefined') klass = 'yellow';
    klass+=' notice';
    while(true) {
        var id = 'notice_id_'+Math.floor(10000000 * Math.random());
        if($('#'+id).length == 0) break;
    }
    if($('.EnergyFolks_notice_holder').length == 0) {
        var holder = $('<div class="EnergyFolks_notice_holder"></div>').hide().appendTo('body');
        holder.show();
    }
    var overlay = $('<div id="'+id+'" class="'+klass+'"></div>').hide().appendTo('.EnergyFolks_notice_holder');
    notice = '<div class="close">X</div>' + notice;
    $('#'+id).html(notice);
    $('#'+id).on('click','.close', function() {
        EnergyFolks.hideNotice(id);
    });
    $('#'+id).slideDown(400);
    window.setTimeout(function() { EnergyFolks.hideNotice(id); }, timeout + 400);
}

// Hide a particular notice
EnergyFolks.hideNotice = function(id) {
    if($('#'+id).length == 0) return;
    $('#'+id).slideUp(400, function() {
        $('#'+id).remove();
        if($('.EnergyFolks_notice_holder').find('.notice').length == 0) $('.EnergyFolks_notice_holder').remove();
    });
}