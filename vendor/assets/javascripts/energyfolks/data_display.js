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
    EnergyFolks.$.each(EnergyFolks.data, function(i, v) {
        output += "<div class='enfolks_list_item' data-id='"+v.id+"'>"+EnergyFolks.itemDetailHTML(v)+"</div>";
    });
    EnergyFolks.$('#EnfolksResultDiv').html(output);
}

EnergyFolks.itemDetailHTML = function(item) {
    //TODO: more sources
    var output = '';
    if(EnergyFolks.source == 'users') {
        output += '<div>';
        if(item.avatar)
            output += '<img src="'+item.avatar_url+'" align=left>';
        output += EnergyFolks.create_remote_popup('<h1>'+item.first_name + ' ' + item.last_name+'</h1>', 'show', {id: item.id, model: 'User'});
        output += '<h3>' + item.position + '</h3>';
        output += item.organization;
        output += '</div><div class="admin_links">';
        if(EnergyFolks.current_user.super_admin) {
            output += EnergyFolks.create_iframe_popup('Global Rights','users/rights',{id: item.id});
            if(item.verified)
                output += EnergyFolks.create_iframe_popup('Freeze Account','users/freeze_account',{id: item.id});
            else
                output += EnergyFolks.create_iframe_popup('Manually Verify','users/manual_verify',{id: item.id});
        }
        if(EnergyFolks.testAdmin(EnergyFolks.ADMIN)) {
            output += EnergyFolks.create_iframe_popup('Admin Rights','affiliates/rights',{id: item.id});
            var approved = false;
            EnergyFolks.$.each(item.affiliates, function(k,v) {
                if((v.id == EnergyFolks.id) && v.approved)
                    approved = true;
            });
            if(approved)
                output += EnergyFolks.create_iframe_popup('Remove From Group','affiliates/reject_or_remove',{id: item.id});
            else {
                output += EnergyFolks.create_iframe_popup('Approve Membership','affiliates/approve',{id: item.id});
                output += EnergyFolks.create_iframe_popup('Reject Membership','affiliates/reject_or_remove',{id: item.id});
            }
        }
        output += '</div>';
    } else if(EnergyFolks.source == 'jobs') {
        output += "<div>";
        if(item.logo)
            output += '<img src="'+item.logo_url+'" align=left>';
        output += EnergyFolks.create_remote_popup('<h1>'+item.name+'</h1>', 'show', {id: item.id, model: 'Job'});
        output += "</div>";
    }
    return output;
};

