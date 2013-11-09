//TODO: Check MIT page custom CSS and ensure we use the same class names here

/*
The showpage function is the master function to show energyfolks data.  Params is a JSON array with the following options:
    source:
        events
        jobs
        users (only used with 'list' format)
        bulletins
        blogs
    format:
        list
        calendar
        weekly (only with events)
        map
        stream
 */
EnergyFolks.showPage = function(params) {
    if(typeof params.source !== 'undefined') EnergyFolks.source = params.source
    if(typeof params.format !== 'undefined') EnergyFolks.format = params.format
    document.write("<div id='EnFolksmainbodydiv'><div id='moderation_box_"+EnergyFolks.source+"'></div><div id='EnfolksResultDiv' ></div></div>");
    var command = EnergyFolks.$.bbq.getState( "command" );
    var parameters = EnergyFolks.$.bbq.getState( "parameters" );
    if(typeof command != "undefined") {
        EnergyFolks.ajax(command, parameters, function(output) {
            EnergyFolks.$('#EnfolksResultDiv').html("<div style='padding:3px;'>" + output.html + "</div>");
        });
    } else
        EnergyFolks.resetData();
};
/*
Show energyfolks filter bar and sidebar options in the location this is called.  Otherwise, these options are shown at top of data display
 */
EnergyFolks.Sidebar = function() {
    document.write("<div id='EnFolksSidebarDiv'><div id='ef_sidebar'></div></div>");
}


/*
    All following functions are support functions that should not be directly called
 */
EnergyFolks.resetData = function() {
    //TODO: Add code to create searchbar at top of page, buttons to switch around, etc.
    if(EnergyFolks.format == 'list') {
        EnergyFolks.data_start = 0;
        EnergyFolks.data_end = EnergyFolks.per_page - 1;
        EnergyFolks.data_limits = 'order'
    }
    if(EnergyFolks.format == 'month') {
        EnergyFolks.data_start = EnergyFolks.current_month; //this is an offset from current month (current = 0)
        EnergyFolks.data_limits = EnergyFolks.shift_later ? 'month-shift' : 'month'
    }
    //TODO: MORE formats
    EnergyFolks.loadData();
}

EnergyFolks.showData = function(data) {
    EnergyFolks.data = data.data;
    if(EnergyFolks.format == 'list') {
        EnergyFolks.showList();
    }
    if(EnergyFolks.format == 'month') {
        EnergyFolks.showMonth();
    }
    //TODO: more formats
}

EnergyFolks.loadData = function() {
    EnergyFolks.loading('#EnfolksResultDiv');
    EnergyFolks.ajax(EnergyFolks.source, {start: EnergyFolks.data_start, end: EnergyFolks.data_end, limits: EnergyFolks.data_limits, moderation: EnergyFolks.get_moderated, my_posts: EnergyFolks.get_my_posts}, EnergyFolks.showData);
}

/*
 associations at startup
 */
EnergyFolks.$(function() {
    EnergyFolks.$("body").on("click", ".get_moderation", function() {
        var self = EnergyFolks.$(this);
        self.closest(".moderation_box").hide();
        EnergyFolks.get_moderated = true;
        EnergyFolks.loadData();
    });
});

//CalendarView
EnergyFolks.showMonth = function() {
    var month = EnergyFolks.date("n",EnergyFolks.mktime())*1;
    var year = EnergyFolks.date("Y",EnergyFolks.mktime())*1;
    month += EnergyFolks.current_month;
    while(month > 12) {
        month -= 12;
        year += 1;
    }
    while(month < 1) {
        month += 12;
        year -= 1;
    }
    //Find time corresponding to start/end of current displayed month
    var start_time = EnergyFolks.mktime(0,0,1,month,1,year);
    m_end = month+1;
    y_end = year;
    if(m_end == 13) {m_end = 1;y_end++;}
    m_p = month-1;
    y_p = year;
    if(m_p == 0) {m_p = 12;y_p--;}
    var end_time=EnergyFolks.mktime(0,0,1,m_end,1,y_end)-2;
    //Expand to also show days in same week but different month at start, end
    start_time = start_time - 3600*24*EnergyFolks.date("w",start_time)*1;
    end_time = end_time + 3600*24*(6-EnergyFolks.date("w",end_time)*1);
    //If this is initial view, we shift month if we are too late in month (for example, if today is the 22nd, we shift to show first few weeks of next month too)
    if(EnergyFolks.shift_later) {
        if(EnergyFolks.source == 'events') {
            if((EnergyFolks.date('j',EnergyFolks.mktime())*1)>15) {
                start_time+=3600*24*14+3601;
                end_time+=3600*24*14;
            } else EnergyFolks.shift_later=false;
        } else {
            if((EnergyFolks.date('j',EnergyFolks.mktime())*1)<15) {
                start_time+= -3600*24*14+3601;
                end_time+= -3600*24*14;
            } else EnergyFolks.shift_later=false;
        }
    }
    var wide = Math.floor(Math.max(60,EnergyFolks.$('#EnfolksResultDiv').width()/7));
    var output = "<table cellpadding=0 cellspacing=0 class='enfolks_calendar' style='width:"+(7*wide)+"px;'><tr>";
    output += "<td class='enfolks_prev'>";
    if(EnergyFolks.shift_later && (EnergyFolks.source == 'events'))
        output += "PREV(0)"; //due to shift, previous is just start of current month
    else
        output += "PREV(-1)";
    output += "</td><td colspan=5 class='enfolks_calendar_title'>";
    if(EnergyFolks.shift_later) {
        if(EnergyFolks.source == 'events')
            output += EnergyFolks.date("F",EnergyFolks.mktime(0,0,1,month,1,year))+"/"+EnergyFolks.date("F Y",EnergyFolks.mktime(0,0,1,m_end,1,y_end));
        else
            output += EnergyFolks.date("F",EnergyFolks.mktime(0,0,1,m_p,1,y_p))+"/"+EnergyFolks.date("F Y",EnergyFolks.mktime(0,0,1,month,1,year));
    } else
        output += EnergyFolks.date("F Y",EnergyFolks.mktime(0,0,1,month,1,year));
    output += "</td><td class='enfolks_next'>";
    if(EnergyFolks.shift_later && (EnergyFolks.source != 'events'))
        output += "NEXT(0)"; //due to shift, next is just start of current month
    else
        output += "NEXT(1)";
    output += "</td></tr><tr>";
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    for(var i=0;i<7;i++) {
        output += "<td class='enfolks_day_header" + (i == 0 ? ' enfolks_first' : '') + "' style='width:" + wide + "px;background-color:#" + EnergyFolks.color + ";'>" + days[i] + "</td>";
    }
    output += "</tr>";
    var curtime = start_time;
    while(curtime < end_time) {
        output += "<tr>";
        for(var i=0;i<7;i++) {
            if(EnergyFolks.date("m",curtime) == EnergyFolks.date("m",EnergyFolks.mktime(0,0,1,month,1,year)))
                var bgclass=" enfolks_current_month";
            else
                var bgclass=" enfolks_other_month";
            if(EnergyFolks.date("j m Y",curtime) == EnergyFolks.date("j m Y",EnergyFolks.mktime()))
                var bgclass=' enfolks_today_month';
            output += "<td class='enfolks_day" + bgclass + (i == 0 ? ' enfolks_first' : '') + (i < 4 ? ' enfolks_right' : '') + "' id='ef_" + EnergyFolks.date("mdY",curtime) + "' valign='top'>";
            output += "<div style='text-align:right;'><a href='#' class='EnergyFolks_popup ef_add_event' style='display:none;' data-command='events/new' data-iframe='true' data-params='date" + curtime +"' >Add Event</a> "+EnergyFolks.date('j',curtime)+"</div>";
            output += "</td>";
            // DST FIX:
            if(EnergyFolks.date("j m Y",curtime) == EnergyFolks.date("j m Y",curtime+3600*24))
                curtime+=3600*25;
            else
                curtime+=3600*24;
        }
        output += "</tr>";
    }
    output += "</table>";
    EnergyFolks.$('#EnfolksResultDiv').html(output);
    // Calendar view has been created, now we populate it
    EnergyFolks.$.each(EnergyFolks.data, function(i, v) {
        var box = EnergyFolks.$('#ef_' + v.mmddyyyy);
        var right_display = box.hasClass('enfolks_right');
        output = "<div class='enfolks_calendar_item'>";
        output += "<div class='enfolks_calendar_item_content" + (v.highlighted ? ' highlight' : '') + "'>" + v.name + "</div>";
        output += "<div class='enfolks_detail_popup_white'>" + v.name + "</div>";
        output += "<div class='enfolks_detail_popup " + (right_display ? 'right' : 'left') + "'>" + EnergyFolks.itemDetailHTML(v, false) + "</div>";
        output += "<div class='enfolks_detail_popup_white_2 " + (right_display ? 'right' : 'left') + "'></div>";
        output += "</div>";
        box.append(output);
    });
}
EnergyFolks.$(function() {
    EnergyFolks.$('body').on('mouseenter','.enfolks_day', function() {
        EnergyFolks.$(this).find('.ef_add_event').show();
    });
    EnergyFolks.$('body').on('mouseenter','.enfolks_calendar_item', function() {
        EnergyFolks.$(this).find('.enfolks_detail_popup').show();
        EnergyFolks.$(this).find('.enfolks_detail_popup_white').show();
        EnergyFolks.$(this).find('.enfolks_detail_popup_white_2').show();
    });
    EnergyFolks.$('body').on('mouseleave','.enfolks_day', function() {
        EnergyFolks.$(this).find('.ef_add_event').hide();
    });
    EnergyFolks.$('body').on('mouseleave','.enfolks_detail_popup_white', function() {
        EnergyFolks.$(this).closest('.enfolks_day').find('.enfolks_detail_popup').hide();
        EnergyFolks.$(this).closest('.enfolks_day').find('.enfolks_detail_popup_white_2').hide();
        EnergyFolks.$(this).hide();
    });
});

//ListView
EnergyFolks.showList = function() {
    var output = '';
    var first = true;
    var last_date = '';
    EnergyFolks.$.each(EnergyFolks.data, function(i, v) {
        if ((EnergyFolks.source == 'events') && (v.start_date != last_date)) {
            output += "<div class='enfolks_date_item" + (EnergyFolks.mmddyyyy == v.mmddyyyy ? ' enfolks_today' : '') + "' " + (EnergyFolks.mmddyyyy == v.mmddyyyy ? ('style="background-color:#' + EnergyFolks.color + ';" ') : '') + ">" + v.start_date + "</div>";
            last_date = v.start_date;
        }
        output += "<div class='enfolks_item enfolks_list_item " + (first ? 'ef_first_item ' : '') + (v.highlighted ? 'ef_highlight ' : '') + "ef_"+EnergyFolks.source+"' data-id='"+v.id+"'>"+EnergyFolks.itemDetailHTML(v)+"</div>";
        first = false;
    });
    EnergyFolks.$('#EnfolksResultDiv').html(output);
}

EnergyFolks.itemDetailHTML = function(item, show_links) {
    if(typeof show_links === 'undefined') show_links = true;
    var output = ''
    var info = EnergyFolks.getItemInfo(item);
    output += '<img src="' + EnergyFolks.server_url + "/affiliates/logo?id=" + info.affiliate_id + '" class="affiliate_logo">';
    if((info.admin_links != '') && (show_links))
        output += '<div class="admin_links">'+info.admin_links+'</div>';
    if(info.logo != '')
        output += '<img src="' + info.logo + '" class="enfolks_logo">';
    output += EnergyFolks.create_remote_popup('<h1 class="title">'+info.title+'</h1>', 'show', info.params);
    output += '<h3 class="line1">' + info.line_one + '</h3>';
    output += '<span class="line2">' + info.line_two + '</span>';
    return output;
}
// Listener for clicks on entries
EnergyFolks.$(function() {
    EnergyFolks.$('body').on('click','.enfolks_item', function() {
        var params = EnergyFolks.$(this).find('h1.title').closest("a.EnergyFolks_popup").attr("data-params");
        EnergyFolks.remote_popup('show', params);
    });
});
EnergyFolks.getItemInfo = function(item) {
    var output = {};
    if(EnergyFolks.source == 'users') {
        output.affiliate_id = item.affiliate_id;
        output.logo = item.avatar ? item.avatar_url : '';
        output.params = {id: item.id, model: 'User'};
        output.title = item.first_name + ' ' + item.last_name;
        output.line_one = item.position;
        output.line_two = item.organization;
        var admin_links = '';
        if(EnergyFolks.current_user.super_admin) {
            admin_links += EnergyFolks.create_iframe_popup('Global Rights','users/rights',{id: item.id});
            if(item.verified)
                admin_links += EnergyFolks.create_iframe_popup('Freeze Account','users/freeze_account',{id: item.id});
            else
                admin_links += EnergyFolks.create_iframe_popup('Manually Verify','users/manual_verify',{id: item.id});
        }
        if(EnergyFolks.testAdmin(EnergyFolks.ADMIN)) {
            admin_links += EnergyFolks.create_iframe_popup('Admin Rights','affiliates/rights',{id: item.id});
            var approved = false;
            EnergyFolks.$.each(item.affiliates, function(k,v) {
                if((v.id == EnergyFolks.id) && v.approved)
                    approved = true;
            });
            if(approved)
                admin_links += EnergyFolks.create_iframe_popup('Remove From Group','affiliates/reject_or_remove',{id: item.id});
            else {
                admin_links += EnergyFolks.create_iframe_popup('Approve Membership','affiliates/approve',{id: item.id});
                admin_links += EnergyFolks.create_iframe_popup('Reject Membership','affiliates/reject_or_remove',{id: item.id});
            }
        }
        output.admin_links = admin_links;
    } else if(EnergyFolks.source == 'jobs') {
        output.affiliate_id = item.affiliate_id;
        output.logo = item.logo ? item.logo_url : '';
        output.title = item.name;
        output.params = {id: item.id, model: 'Job'};
        output.line_one = item.employer;
        output.line_two = item.location;
        var admin_links = '';
        if(EnergyFolks.get_moderated) {
            //TODO: Links for moderation queue
            admin_links = 'MODERATION LINKS'
        } else if(EnergyFolks.current_user.super_admin) {
            admin_links += EnergyFolks.create_iframe_popup('Edit Post','jobs/edit',{id: item.id});
        } else if(EnergyFolks.current_user.id == item.user_id) {
            admin_links += '<strong>This is your post</strong>' + EnergyFolks.create_iframe_popup('Edit Post','jobs/edit',{id: item.id});
        }
        output.admin_links = admin_links;
    } else if(EnergyFolks.source == 'events') {
        output.affiliate_id = item.affiliate_id;
        output.logo = item.logo ? item.logo_url : '';
        output.title = item.name;
        output.params = {id: item.id, model: 'Event'};
        output.line_one = item.start_time + " - " + item.end_time + " " + item.tz;
        output.line_two = item.location;
        var admin_links = '';
        if(EnergyFolks.get_moderated) {
            //TODO: Links for moderation queue
            admin_links = 'MODERATION LINKS'
        } else if(EnergyFolks.current_user.super_admin) {
            admin_links += EnergyFolks.create_iframe_popup('Edit Post','events/edit',{id: item.id});
        } else if(EnergyFolks.current_user.id == item.user_id) {
            admin_links += '<strong>This is your post</strong>' + EnergyFolks.create_iframe_popup('Edit Post','events/edit',{id: item.id});
        }
        output.admin_links = admin_links;
    } else if(EnergyFolks.source == 'bulletins') {
        output.affiliate_id = item.affiliate_id;
        output.logo = '';
        output.title = item.name;
        output.params = {id: item.id, model: 'Bulletin'};
        output.line_one = '';
        output.line_two = '';
        var admin_links = '';
        if(EnergyFolks.get_moderated) {
            //TODO: Links for moderation queue
            admin_links = 'MODERATION LINKS'
        } else if(EnergyFolks.current_user.super_admin) {
            admin_links += EnergyFolks.create_iframe_popup('Edit Post','bulletins/edit',{id: item.id});
        } else if(EnergyFolks.current_user.id == item.user_id) {
            admin_links += '<strong>This is your post</strong>' + EnergyFolks.create_iframe_popup('Edit Post','bulletins/edit',{id: item.id});
        }
        output.admin_links = admin_links;
    }
    return output;
};

