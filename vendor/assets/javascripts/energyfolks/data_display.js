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
        EnergyFolks.limits = 'order'
    }
    //TODO: MORE formats
    EnergyFolks.loadData();
}

EnergyFolks.showData = function(data) {
    EnergyFolks.data = data.data;
    if(EnergyFolks.format == 'list') {
        EnergyFolks.showList();
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

//ListView
EnergyFolks.showList = function() {
    var output = '';
    var first = true;
    EnergyFolks.$.each(EnergyFolks.data, function(i, v) {
        output += "<div class='enfolks_item enfolks_list_item " + (first ? 'ef_first_item ' : '') + "ef_"+EnergyFolks.source+"' data-id='"+v.id+"'>"+EnergyFolks.itemDetailHTML(v)+"</div>";
        first = false;
    });
    EnergyFolks.$('#EnfolksResultDiv').html(output);
}

EnergyFolks.itemDetailHTML = function(item) {
    var output = ''
    var info = EnergyFolks.getItemInfo(item);
    output += '<img src="' + EnergyFolks.server_url + "/affiliates/logo?id=" + output.affiliate_id + '" class="affiliate_logo">';
    if(info.admin_links != '')
        output += '<div class="admin_links">'+info.admin_links+'</div>';
    if(info.logo != '')
        output += '<img src="' + EnergyFolks.server_url + info.logo + '" class="enfolks_logo">';
    else output += "LOGO:"+info.logo;
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
        output.line_one = item.host;        //TODO: Change to date/time information
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

