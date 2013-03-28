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
    url+="&aid="+EnergyFolks.id;
    // Append to the head the javascript load request...upon addition the browser will load the external js file.
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= url;
    head.appendChild(script);
}

/*
 * Popup functions: Used to create modal popup dialogs used by energyfolks
 */

//Load popup that has internal iframe that loads external content (show 'loading' while content loads)
EnergyFolks.iframe_popup = function(command, parameters) {
    EnergyFolks.direct_popup();
    var url = EnergyFolks.server_url+"/"+command+"?"
    if(EnergyFolks.$.type(parameters) === 'object')
        url+=EnergyFolks.$.param(parameters);
    else if(EnergyFolks.$.type(parameters) === 'string')
        url+=parameters;
    url+="&iframe=1&"+EnergyFolks.urlhash();
    url+="&aid="+EnergyFolks.id;
    EnergyFolks.$('#energyfolks_popup_wrapper').css('width',940 + 'px');
    EnergyFolks.$('#energyfolks_popup_content').append("<div id='energyfolks_popup_iframe' style='visibility:hidden;'><iframe src='"+url+"' frameborder='0' border='0' style='border-width:0px;width:900px;height:30px;overflow:auto;'></iframe></div>");
}
EnergyFolks.$(function() {
    // Attach listener to hash for handling response of iframe loads
    EnergyFolks.$(window).on('hashchange',function() {
        var hash = location.hash;
        if(hash.substr(1,7) == 'iframe_') {
            window.location.hash = '';
            EnergyFolks.$('#energyfolks_popup_iframe iframe').css('height',hash.replace("#iframe_","") + 'px');
            EnergyFolks.$('#energyfolks_popup_loading').remove();
            EnergyFolks.$('#energyfolks_popup_iframe').css('visibility','visible');
            EnergyFolks.vertically_center_popup();
        }
        // This will close the popup if 'hide_popup' is called within the iframe window, as it passes back this hash
        if(hash.substr(1,10) == 'closepopup') {
            window.location.hash = '';
            EnergyFolks.hide_popup();
        }
    });
});

//Load popup that loads remote content via 'ajax'
EnergyFolks.remote_popup = function(command, parameters) {
    EnergyFolks.direct_popup();
    EnergyFolks.ajax(command, parameters, function(output) {
        EnergyFolks.$('#energyfolks_popup_wrapper').css('width',output.width + 'px');
        EnergyFolks.$('#energyfolks_popup_content').html(output.html);
        EnergyFolks.globalCallback(EnergyFolks.$('#energyfolks_popup_content'));
        EnergyFolks.vertically_center_popup();
    });
}

//Load popup and directly insert html
EnergyFolks.direct_popup = function(html) {
    EnergyFolks.initialize_popup();
    if(html != '')
        EnergyFolks.$('#energyfolks_popup_content').html(html);
    EnergyFolks.$('#energyfolks_popup').show();
    EnergyFolks.vertically_center_popup();
    EnergyFolks.$('#energyfolks_popup_greyout').show();
}

//Hide the popup
EnergyFolks.hide_popup = function() {
    if(EnergyFolks.$('body').find('#energyfolks_popup').length == 0)
        window.parent.location=EnergyFolks.parent_url+'#closepopup';
    else {
        EnergyFolks.$('#energyfolks_popup').remove();
        EnergyFolks.$('#energyfolks_popup_greyout').remove();
    }
}

/*
 * Helper functions: Not meant to be called directly
 */
// Create the popup elements if they dont already exist, and add loading message.  hide to start
EnergyFolks.initialize_popup = function() {
    if(EnergyFolks.$('body').find('#energyfolks_popup').length == 0) {
        EnergyFolks.$('body').append("<div id='energyfolks_popup_greyout' style='display:none;'></div>");
        EnergyFolks.$('body').append("<div id='energyfolks_popup' style='display:none;'><div id='energyfolks_popup_wrapper'><div id='energyfolks_popup_close'><img src='"+EnergyFolks.server_url+"/assets/closegreycircle.png'></div><div id='energyfolks_popup_content'></div></div></div>");
    }
    EnergyFolks.$('#energyfolks_popup_content').html('<div id="energyfolks_popup_loading"><h1>Loading...</h1><br><img src="'+EnergyFolks.server_url+'/assets/loader.gif" border="0"></div>');
}
// Center the popup box vertically on the screen.  If too big for the screen, display 100px below the top of the viewport.
EnergyFolks.vertically_center_popup = function() {
    var el_height = EnergyFolks.$('#energyfolks_popup_wrapper').height();
    var view_height = EnergyFolks.$(window).height();
    var scroll_location = EnergyFolks.$(document).scrollTop();
    var offset = Math.max(Math.round((view_height - el_height)/2)-70,100);
    EnergyFolks.$('#energyfolks_popup_wrapper').css('padding-top',(scroll_location + offset) + 'px');
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
            EnergyFolks.iframe_popup(self.attr('data-command'),self.attr('data-params'));
        else
            EnergyFolks.remote_popup(self.attr('data-command'),self.attr('data-params'));
        return false;
    });
    EnergyFolks.$('body').on('click','#energyfolks_popup_close img', EnergyFolks.hide_popup);
    EnergyFolks.$('body').on('click','#energyfolks_popup_wrapper', function(event) { event.stopPropagation(); } );
    EnergyFolks.$('body').on('click','#energyfolks_popup', EnergyFolks.hide_popup);
});

/* Returns a hash of the current url for use in a query string that requires the frame to talk with the parent through
 * hash tag changes
 */
EnergyFolks.urlhash = function() {
    var current_url=window.location.href;
    return "current_url="+current_url.replace(/#.*/, "").replace(/\./g,"_dot_").replace(/\//g,"_slash_").replace(/\:/g,"_colon_").replace("?","_qmark_").replace(/&/g,"_amp_").replace(/=/g,"_equals_");
}

/*
 * Notices functions (red/green/yellow bars that appear at the top of the screen
 */
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

/*
 * Global callback: called on an element (el) to do common tasks, like convert timestamps into local time
 */
EnergyFolks.globalCallback = function(el) {

}
