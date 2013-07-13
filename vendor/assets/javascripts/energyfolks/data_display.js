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
    document.write("<div id='EnFolksmainbodydiv'><div id='EnfolksResultDiv' ></div></div>");
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
    EnergyFolks.ajax(EnergyFolks.source, {start: EnergyFolks.data_start, end: EnergyFolks.data_end, limits: EnergyFolks.data_limits}, EnergyFolks.showData);
}

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
        output += '<h1>'+item.first_name + ' ' + item.last_name+'</h1>';
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
    }
    return output;
};

