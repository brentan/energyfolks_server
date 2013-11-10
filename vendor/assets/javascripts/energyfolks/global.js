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
    if(url.indexOf("aid=") == -1)
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
    var url = EnergyFolks.server_url+"/"+command+"?"
    if(EnergyFolks.$.type(parameters) === 'object')
        url+=EnergyFolks.$.param(parameters);
    else if(EnergyFolks.$.type(parameters) === 'string')
        url+=parameters;
    url+="&iframe=1&"+EnergyFolks.urlhash();
    if(url.indexOf("aid=") == -1)
        url+="&aid="+EnergyFolks.id;
    if(EnergyFolks.iframe) {
        location.href=url;
    } else {
        EnergyFolks.justSet = false;
        EnergyFolks.direct_popup();
        EnergyFolks.$('#energyfolks_popup_wrapper').css('width',940 + 'px');
        EnergyFolks.$('#energyfolks_popup_content').append("<div id='energyfolks_popup_iframe' style='visibility:hidden;'><iframe src='"+url+"' frameborder='0' border='0' style='border-width:0px;width:900px;height:30px;overflow:auto;'></iframe></div>");
    }
}
EnergyFolks.create_iframe_popup = function(text, command, parameters) {
    return "<a href='#' class='EnergyFolks_popup' data-command='"+command+"' data-iframe='true' data-params='"+EnergyFolks.$.param(parameters)+"'>"+text+"</a>";
}

EnergyFolks.justSet = false;
EnergyFolks.$(function() {
    // Attach listener to hash for handling response of iframe loads
    EnergyFolks.$(window).on('hashchange',function() {
        if(EnergyFolks.justSet) {
            EnergyFolks.justSet = false;
        } else {
            var hash = location.hash;
            if(hash.substr(1,7) == 'iframe_') {
                EnergyFolks.justSet = true;
                window.location.hash = '';
                EnergyFolks.$('#energyfolks_popup_content .energyfolks_loading').remove();
                EnergyFolks.$('#energyfolks_popup_iframe iframe').css('height',hash.replace("#iframe_","") + 'px');
                EnergyFolks.$('#energyfolks_popup_loading').remove();
                EnergyFolks.$('#energyfolks_popup_iframe').css('visibility','visible');
                EnergyFolks.vertically_center_popup();
            } else if(hash.substr(1,10) == 'closepopup') {
                // This will close the popup if 'hide_popup' is called within the iframe window, as it passes back this hash
                EnergyFolks.hide_popup();
            } else if(hash == '') {
                EnergyFolks.$('#energyfolks_popup').remove();
                EnergyFolks.$('#energyfolks_popup_greyout').remove();
            } else {
                var command = EnergyFolks.$.bbq.getState( "command" );
                var params = EnergyFolks.$.bbq.getState( "parameters" );
                if(typeof command != "undefined")
                    EnergyFolks.remote_popup(command, params);
                    EnergyFolks.justSet = false;
            }
        }
    });
});

//Load popup that loads remote content via 'ajax'
EnergyFolks.remote_popup = function(command, parameters) {
    EnergyFolks.direct_popup();
    EnergyFolks.justSet = true;
    EnergyFolks.$.bbq.pushState({ command: command, parameters: parameters }); //Popups are added to history
    EnergyFolks.ajax(command, parameters, function(output) {
        EnergyFolks.$('#energyfolks_popup_wrapper').css('width',output.width + 'px');
        EnergyFolks.$('#energyfolks_popup_content').html(output.html);
        EnergyFolks.globalCallback(EnergyFolks.$('#energyfolks_popup_content'));
        EnergyFolks.vertically_center_popup();
    });
}
EnergyFolks.create_remote_popup = function(text, command, parameters) {
    return "<a href='#' class='EnergyFolks_popup' data-command='"+command+"' data-iframe='false' data-params='"+EnergyFolks.$.param(parameters)+"'>"+text+"</a>";
}

//Load popup and directly insert html
EnergyFolks.direct_popup = function(html) {
    EnergyFolks.initialize_popup();
    if(typeof html != 'undefined')
        EnergyFolks.$('#energyfolks_popup_content').html(html);
    else
        EnergyFolks.loading('#energyfolks_popup_content');
    EnergyFolks.$('#energyfolks_popup').show();
    EnergyFolks.vertically_center_popup();
    EnergyFolks.$('#energyfolks_popup_greyout').show();
}

//Hide the popup
EnergyFolks.hide_popup = function() {
    if(EnergyFolks.$('body').find('#energyfolks_popup').length == 0)
        window.parent.location=EnergyFolks.parent_url+'#closepopup';
    else {
        EnergyFolks.justSet = true;
        window.location.hash = '';
        EnergyFolks.$('#energyfolks_popup').remove();
        EnergyFolks.$('#energyfolks_popup_greyout').remove();
    }
}
/*
 * Create ajax links
 */
EnergyFolks.ajax_link = function(text, command, parameters) {
    return "<a href='#' class='EnergyFolks_ajax' data-command='" + command + "' data-params='" + EnergyFolks.$.param(parameters) + "'>" + text + "</a>"
}

/*
 * Helper functions: Not meant to be called directly
 */
// Add loading message to a div
EnergyFolks.loading = function(divname) {
    EnergyFolks.$(divname).html('<div align=center class="energyfolks_loading" style="text-align:center;"><h1>Loading...</h1><br><img src="'+EnergyFolks.server_url+'/assets/loader.gif" border="0" style="display:inline;"></div>');
}
// Create the popup elements if they dont already exist, and add loading message.  hide to start
EnergyFolks.initialize_popup = function() {
    if(EnergyFolks.$('body').find('#energyfolks_popup').length == 0) {
        EnergyFolks.$('body').append("<div id='energyfolks_popup_greyout' style='display:none;'></div>");
        EnergyFolks.$('body').append("<div id='energyfolks_popup' "+ (EnergyFolks.iframe ? "class='iframe' " : "") +"style='display:none;'><div id='energyfolks_popup_wrapper'><div id='energyfolks_popup_back'><a href='#'><- Back</a></div><div id='energyfolks_popup_close'><img src='"+EnergyFolks.server_url+"/assets/closegreycircle.png'></div><div id='energyfolks_popup_content'></div></div></div>");
    }
    EnergyFolks.$('#energyfolks_popup_content').html('<div id="energyfolks_popup_loading"></div>');
    EnergyFolks.loading("energyfolks_popup_loading");
}
// Center the popup box vertically on the screen.  If too big for the screen, display 100px below the top of the viewport.
EnergyFolks.vertically_center_popup = function() {
    if(!EnergyFolks.iframe) {
        var el_height = EnergyFolks.$('#energyfolks_popup_wrapper').height();
        var view_height = EnergyFolks.$(window).height();
        var scroll_location = EnergyFolks.$(document).scrollTop();
        var offset = Math.max(Math.round((view_height - el_height)/2)-70,100);
        EnergyFolks.$('#energyfolks_popup_wrapper').css('padding-top',(scroll_location + offset) + 'px');
    }
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
    EnergyFolks.$('body').on('click','.EnergyFolks_popup_confirm', function() {
        var self = EnergyFolks.$(this);
        if(confirm(self.attr('data-message'))) {
            if(self.attr('data-iframe') == 'true')
                EnergyFolks.iframe_popup(self.attr('data-command'),self.attr('data-params'));
            else
                EnergyFolks.remote_popup(self.attr('data-command'),self.attr('data-params'));
        }
        return false;
    });
    EnergyFolks.$('body').on('click','#energyfolks_popup_close img', EnergyFolks.hide_popup);
    EnergyFolks.$('body').on('click','#energyfolks_popup_back a', EnergyFolks.hide_popup);
    EnergyFolks.$('body').on('click','#energyfolks_popup_wrapper', function(event) { event.stopPropagation(); } );
    EnergyFolks.$('body').on('click','#energyfolks_popup', EnergyFolks.hide_popup);
});

/* Returns a hash of the current url for use in a query string that requires the frame to talk with the parent through
 * hash tag changes
 */
EnergyFolks.urlhash = function() {
    if(EnergyFolks.iframe)
        var current_url = EnergyFolks.parent_url;
    else
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

/*
 * Test if the current user is the specified admin level for the current affiliate
 */
EnergyFolks.testAdmin = function(level) {
    var admin = false;
    EnergyFolks.$.each(EnergyFolks.current_user.affiliates, function(k,v) {
        if((v.id == EnergyFolks.id) && (v.admin_level >= level) && (v.approved))
            admin = true;
    });
    return admin;
}

/*
 * Cookie functions
 */
EnergyFolks.cookie = function(name, value, days) {
    if(value) {
        //Write cookie
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else var expires = "";
        document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
    } else {
        //Read cookie
        var nameEQ = escape(name) + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length, c.length));
        }
        return null;
    }
}

EnergyFolks.removeCookie = function(name) {
    EnergyFolks.cookie(name, "", -1);
}

/*
 * Time functions
*/

EnergyFolks.date = function(format, timestamp) {
    var that = this,
        jsdate, f, formatChr = /\\?([a-z])/gi,
        formatChrCb,
    // Keep this here (works, but for code commented-out
    // below for file size reasons)
    //, tal= [],
        _pad = function (n, c) {
            if ((n = n + "").length < c) {
                return new Array((++c) - n.length).join("0") + n;
            } else {
                return n;
            }
        },
        txt_words = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','January','February','March','April','May','June','July','August','September','October','November','December'],
        txt_ordin = {
            1: "st",
            2: "nd",
            3: "rd",
            21: "st",
            22: "nd",
            23: "rd",
            31: "st"
        };
    formatChrCb = function (t, s) {
        return f[t] ? f[t]() : s;
    };
    f = {
        // Day
        d: function () { // Day of month w/leading 0; 01..31
            return _pad(f.j(), 2);
        },
        D: function () { // Shorthand day name; Mon...Sun
            return f.l().slice(0, 3);
        },
        j: function () { // Day of month; 1..31
            return jsdate.getDate();
        },
        l: function () { // Full day name; Monday...Sunday
            return txt_words[f.w()];// + 'day';
        },
        N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
            return f.w() || 7;
        },
        S: function () { // Ordinal suffix for day of month; st, nd, rd, th
            return txt_ordin[f.j()] || 'th';
        },
        w: function () { // Day of week; 0[Sun]..6[Sat]
            return jsdate.getDay();
        },
        z: function () { // Day of year; 0..365
            var a = new Date(f.Y(), f.n() - 1, f.j()),
                b = new Date(f.Y(), 0, 1);
            return Math.round((a - b) / 864e5) + 1;
        },

        // Week
        W: function () { // ISO-8601 week number
            var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3),
                b = new Date(a.getFullYear(), 0, 4);
            return 1 + Math.round((a - b) / 864e5 / 7);
        },

        // Month
        F: function () { // Full month name; January...December
            return txt_words[6 + f.n()];
        },
        m: function () { // Month w/leading 0; 01...12
            return _pad(f.n(), 2);
        },
        M: function () { // Shorthand month name; Jan...Dec
            return f.F().slice(0, 3);
        },
        n: function () { // Month; 1...12
            return jsdate.getMonth() + 1;
        },
        t: function () { // Days in month; 28...31
            return (new Date(f.Y(), f.n(), 0)).getDate();
        },

        // Year
        L: function () { // Is leap year?; 0 or 1
            return new Date(f.Y(), 1, 29).getMonth() === 1 | 0;
        },
        o: function () { // ISO-8601 year
            var n = f.n(),
                W = f.W(),
                Y = f.Y();
            return Y + (n === 12 && W < 9 ? -1 : n === 1 && W > 9);
        },
        Y: function () { // Full year; e.g. 1980...2010
            return jsdate.getFullYear();
        },
        y: function () { // Last two digits of year; 00...99
            return (f.Y() + "").slice(-2);
        },

        // Time
        a: function () { // am or pm
            return jsdate.getHours() > 11 ? "pm" : "am";
        },
        A: function () { // AM or PM
            return f.a().toUpperCase();
        },
        B: function () { // Swatch Internet time; 000..999
            var H = jsdate.getUTCHours() * 36e2,
            // Hours
                i = jsdate.getUTCMinutes() * 60,
            // Minutes
                s = jsdate.getUTCSeconds(); // Seconds
            return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
        },
        g: function () { // 12-Hours; 1..12
            return f.G() % 12 || 12;
        },
        G: function () { // 24-Hours; 0..23
            return jsdate.getHours();
        },
        h: function () { // 12-Hours w/leading 0; 01..12
            return _pad(f.g(), 2);
        },
        H: function () { // 24-Hours w/leading 0; 00..23
            return _pad(f.G(), 2);
        },
        i: function () { // Minutes w/leading 0; 00..59
            return _pad(jsdate.getMinutes(), 2);
        },
        s: function () { // Seconds w/leading 0; 00..59
            return _pad(jsdate.getSeconds(), 2);
        },
        u: function () { // Microseconds; 000000-999000
            return _pad(jsdate.getMilliseconds() * 1000, 6);
        },

        // Timezone
        e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
            // The following works, but requires inclusion of the very large
            // timezone_abbreviations_list() function.
            /*              return this.date_default_timezone_get();
             */
            throw 'Not supported (see source code of date() for timezone on how to add support)';
        },
        I: function () { // DST observed?; 0 or 1
            // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
            // If they are not equal, then DST is observed.
            var a = new Date(f.Y(), 0),
            // Jan 1
                c = Date.UTC(f.Y(), 0),
            // Jan 1 UTC
                b = new Date(f.Y(), 6),
            // Jul 1
                d = Date.UTC(f.Y(), 6); // Jul 1 UTC
            return 0 + ((a - c) !== (b - d));
        },
        O: function () { // Difference to GMT in hour format; e.g. +0200
            var a = jsdate.getTimezoneOffset();
            return (a > 0 ? "-" : "+") + _pad(Math.abs(a / 60 * 100), 4);
        },
        P: function () { // Difference to GMT w/colon; e.g. +02:00
            var O = f.O();
            return (O.substr(0, 3) + ":" + O.substr(3, 2));
        },
        T: function () { // Timezone abbreviation; e.g. EST, MDT, ...
            // The following works, but requires inclusion of the very
            // large timezone_abbreviations_list() function.
            /*              var abbr = '', i = 0, os = 0, default = 0;
             if (!tal.length) {
             tal = that.timezone_abbreviations_list();
             }
             if (that.php_js && that.php_js.default_timezone) {
             default = that.php_js.default_timezone;
             for (abbr in tal) {
             for (i=0; i < tal[abbr].length; i++) {
             if (tal[abbr][i].timezone_id === default) {
             return abbr.toUpperCase();
             }
             }
             }
             }
             for (abbr in tal) {
             for (i = 0; i < tal[abbr].length; i++) {
             os = -jsdate.getTimezoneOffset() * 60;
             if (tal[abbr][i].offset === os) {
             return abbr.toUpperCase();
             }
             }
             }
             */
            return 'UTC';
        },
        Z: function () { // Timezone offset in seconds (-43200...50400)
            return -jsdate.getTimezoneOffset() * 60;
        },

        // Full Date/Time
        c: function () { // ISO-8601 date.
            return 'Y-m-d\\Th:i:sP'.replace(formatChr, formatChrCb);
        },
        r: function () { // RFC 2822
            return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
        },
        U: function () { // Seconds since UNIX epoch
            return jsdate.getTime() / 1000 | 0;
        }
    };
    this.date = function (format, timestamp) {
        that = this;
        jsdate = ((typeof timestamp === 'undefined') ? new Date() : // Not provided
            (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
                new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
            );
        return format.replace(formatChr, formatChrCb);
    };
    return this.date(format, timestamp);
}
EnergyFolks.mktime = function() {
    var d = new Date(),
        r = arguments,
        i = 0,
        e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear'];

    for (i = 0; i < e.length; i++) {
        if (typeof r[i] === 'undefined') {
            r[i] = d['get' + e[i]]();
            r[i] += (i === 3); // +1 to fix JS months.
        } else {
            r[i] = parseInt(r[i], 10);
            if (isNaN(r[i])) {
                return false;
            }
        }
    }

    // Map years 0-69 to 2000-2069 and years 70-100 to 1970-2000.
    r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0);

    // Set year, month (-1 to fix JS months), and date.
    // !This must come before the call to setHours!
    d.setFullYear(r[5], r[3] - 1, r[4]);

    // Set hours, minutes, and seconds.
    d.setHours(r[0], r[1], r[2]);

    // Divide milliseconds by 1000 to return seconds and drop decimal.
    // Add 1 second if negative or it'll be off from PHP by 1 second.
    return (d.getTime() / 1e3 >> 0) - (d.getTime() < 0);
}