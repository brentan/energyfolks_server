//TODO: Check MIT page custom CSS and ensure we use the same class names here

/*
The showPage function is the master function to show energyfolks data.  Params is a JSON array with the following options:
    source:
        events
        jobs
        users (only used with 'list' and 'map' format)
        discussions (does not work with 'map' format)
        blogs
    format:
        list
        calendar
        map
        stream (only blogs and discussions)
 */
EnergyFolks.showPage = function(params) {
    if(typeof params.source !== 'undefined') EnergyFolks.source = params.source
    if(typeof params.format !== 'undefined') EnergyFolks.format = params.format
    document.write("<div id='EnFolksmainbodydiv'><div id='moderation_box_"+EnergyFolks.source+"'></div><div id='EnfolksFilterDiv' class='ef_"+EnergyFolks.source+"'></div><div id='EnfolksResultDiv' ></div></div><div style='display: none;'><img src='"+EnergyFolks.server_url+"/assets/loader.gif' border='0' style='display:inline;'></div>");
    var command = EnergyFolks.$.bbq.getState( "command" );
    var parameters = EnergyFolks.$.bbq.getState( "parameters" );
    if(typeof command != "undefined") {
        EnergyFolks.loading('#EnfolksResultDiv');
        EnergyFolks.ajax(command, parameters, function(output) {
            EnergyFolks.$('#EnfolksResultDiv').html("<div style='padding:3px;'>" + output.html + "</div>");
            if(typeof output.execute !== 'undefined')
                eval(output.execute);
        });
    } else {
        EnergyFolks.$(function() {
            EnergyFolks.showFilters();
        });
        EnergyFolks.resetData();
    }
};
/*
 * Show energyfolks filter bar and sidebar options in the location this is called.  Otherwise, these options are shown at top of data display
 */
EnergyFolks.Sidebar = function() {
    document.write("<div id='EnFolksSidebarDiv' class='ef_side'></div>");
}


/*
 * All following functions are support functions that should not be directly called
 */


// Display the filter bar and sidebar
EnergyFolks.showFilters = function() {
    //TODO: Hide if in 'moderation' or 'my posts' views.
    //If sidebar is not used, we add it to the filter bar instead:
    if(EnergyFolks.$('#EnFolksSidebarDiv').length == 0)
        EnergyFolks.$('#EnfolksResultDiv').before("<div id='EnFolksSidebarDiv' class='ef_top'></div>");
    var searchbar = "<div id='ef_search'><div><input type=text placeholder='Search'></div><img src='"+EnergyFolks.server_url+"/assets/magnifier.png'></div>";
    if(EnergyFolks.source != 'users') {
        searchbar += "<div id='ef_views'>View:</div>";
        searchbar += "<div id='ef_list'><img src='"+EnergyFolks.server_url+"/assets/list.png'></div>";
        searchbar += "<div id='ef_cal'><img src='"+EnergyFolks.server_url+"/assets/calendar.png'></div>";
        if(!(EnergyFolks.source == 'discussions'))
            searchbar += "<div id='ef_map'><img src='"+EnergyFolks.server_url+"/assets/map.png'></div>";
        if((EnergyFolks.source == 'blogs') || (EnergyFolks.source == 'discussions'))
            searchbar += "<div id='ef_stream'><img src='"+EnergyFolks.server_url+"/assets/stream.png'></div>";
    }
    EnergyFolks.$('#EnfolksFilterDiv').html(searchbar);
    var filterbar = '';
    if(EnergyFolks.source != 'users')
        filterbar += "<div class='ef_new_post'><button class='EnergyFolks_popup' data-command='"+EnergyFolks.source + "/new' data-iframe='true' data-params=''>Post new "+EnergyFolks.source.replace(/s([^s]*)$/,'$1')+"</button></div>";
    filterbar += "<div class='ef_filter_title'><h3>Filters:</h3></div>";
    filterbar += "<div class='ef_filters'>";
    if(EnergyFolks.source != 'discussions') filterbar += "<div class='ef_filter_house' id='location_filter'>Location: <span class='ef_text'></span><div class='ef_filter_house2'><label><input name='ef_location_radio' type=radio class='ef_location_radio1' value=0>Anywhere</label><input name='ef_location_radio' type=radio class='ef_location_radio2' value=1 checked>Within <input type=text id='ef_filter_radius' value="+EnergyFolks.map_location_radius+"> miles of<BR><input type=text id='ef_filter_location' value='"+EnergyFolks.map_location_name+"'><div id='ef_location_searching'>Finding Location...</div></div></div>";
    filterbar += "<div class='ef_filter_house' id='tags_filter'>Tags: <span class='ef_text'></span><div class='ef_filter_house2'><div id='ef_tags_list'></div><input type=text placeholder='Other Tag'>&nbsp;<a href='#' onclick='return false;'>Add</a></a></div></div>";
    if((EnergyFolks.id > 0) && (EnergyFolks.source != 'users')) {
        filterbar += "<div class='ef_filter_house' id='source_filter'>Source: <span class='ef_text'></span><div class='ef_filter_house2'>";
        filterbar += "<label><input type=radio name='ef_source_radio' class='ef_source_radio1' value=" + EnergyFolks.ANY_POST + (EnergyFolks.source_restrict == EnergyFolks.ANY_POST ? ' checked' : '') + "> Any EnergyFolks Network</label>";
        filterbar += "<label><input type=radio name='ef_source_radio' class='ef_source_radio2' value=" + EnergyFolks.AFFILIATE_ONLY + (EnergyFolks.source_restrict == EnergyFolks.AFFILIATE_ONLY ? ' checked' : '') + "> <span class='ef_a_name'>This Network</span></label>";
        if(EnergyFolks.source != 'blogs') filterbar += "<label><input type=radio name='ef_source_radio' class='ef_source_radio3' value=" + EnergyFolks.HIGHLIGHTED_ONLY + (EnergyFolks.source_restrict == EnergyFolks.HIGHLIGHTED_ONLY ? ' checked' : '') + "> Highlighted Items</label>";
        filterbar += "</div></div>";
    }
    filterbar += "</div><div id='ef_submit_filters'><button>Update</button></div>";
    EnergyFolks.$('#EnFolksSidebarDiv').html(filterbar);
    EnergyFolks.UpdateFilterText();
}
EnergyFolks.UpdateFilterText = function() {
    var restrict = 'Any';
    if(EnergyFolks.source_restrict == EnergyFolks.AFFILIATE_ONLY) var restrict = 'This Network';
    if(EnergyFolks.source_restrict == EnergyFolks.HIGHLIGHTED_ONLY) var restrict = 'Highlighted';
    EnergyFolks.$("#source_filter span.ef_text").html(restrict);
    EnergyFolks.$("#location_filter span.ef_text").html(EnergyFolks.map_location_radius == 0 ? 'Anywhere' : EnergyFolks.map_location_name);
    var tags = EnergyFolks.active_tags.join(', ');
    if(tags.length > 32)
        tags = tags.substr(0,30) + '...';
    if(tags == '') tags = 'Any tag';
    EnergyFolks.$("#tags_filter span.ef_text").html(tags);
    var tag_text = '<label><input type=checkbox value="___" ' + (tags == 'Any tag' ? 'checked' : '') + '>Any tag</label>';
    EnergyFolks.$.each(EnergyFolks.tag_list, function(i, v) {
        if(EnergyFolks.$.inArray(v, EnergyFolks.active_tags) > -1)
            var checked = true;
        else
            var checked = false;
        tag_text += '<label><input type=checkbox value="'+v+'" ' + (checked ? 'checked' : '') + '>' + v + '</label>';
    });
    EnergyFolks.$('#ef_tags_list').html(tag_text);
}
EnergyFolks.HighlightUpdateButton = function() {
    var el = EnergyFolks.$("#ef_submit_filters");
    el.show();
    el.before("<div class='fade_class'></div>");
    el.prev()
        .width(el.width())
        .height(el.height())
        .css({
            "position": "absolute",
            "background-color": "#ffff99",
            "opacity": ".9"
        })
        .fadeOut(500);
}
EnergyFolks.geocoded = function(response) {
    EnergyFolks.$('#ef_location_searching').hide();
    EnergyFolks.$('#ef_submit_filters').show();
    if(response.length == 0)
        EnergyFolks.showNotice("Unrecognized location: " + EnergyFolks.map_location_name,'red');
    else {
        EnergyFolks.map_location_lat = response[0].lat;
        EnergyFolks.map_location_lng = response[0].lon;
        EnergyFolks.UpdateFilterText();
        EnergyFolks.HighlightUpdateButton();
    }
}
//Searchbar and filterbar listeners:
EnergyFolks.$(function() {
    //filterbar
    EnergyFolks.$('body').on('mouseenter', '#EnFolksSidebarDiv.ef_top .ef_filter_house', function() {
        EnergyFolks.$('div.ef_filter_house2').hide();
        EnergyFolks.$('div.ef_filter_house').css('background-color','transparent');
        EnergyFolks.$(this).css('background-color','#f0f0f0');
        EnergyFolks.$(this).find('div.ef_filter_house2').show();
    });
    EnergyFolks.$('body').on('mouseleave', '#EnFolksSidebarDiv.ef_top .ef_filter_house2', function() {
        EnergyFolks.$(this).hide();
        EnergyFolks.$('div.ef_filter_house').css('background-color','transparent');
    });
    EnergyFolks.$('body').on('blur', '#tags_filter input[type=text]', function() {
        var tags = EnergyFolks.$(this).val().split(',');
        EnergyFolks.$.each(tags, function(i, v) {
            v = EnergyFolks.$.trim(v).toLowerCase().replace(/"/g,'');
            v = v.charAt(0).toUpperCase() + v.slice(1);
            if(v == '') return;
            if(EnergyFolks.$.inArray(v, EnergyFolks.tag_list) == -1) {
                EnergyFolks.tag_list.push(v);
                EnergyFolks.active_tags.push(v);
            } else if(EnergyFolks.$.inArray(v, EnergyFolks.active_tags) == -1)
                EnergyFolks.active_tags.push(v);
        });
        EnergyFolks.tag_list.sort();
        EnergyFolks.active_tags.sort();
        EnergyFolks.$(this).val('');
        EnergyFolks.UpdateFilterText();
        EnergyFolks.HighlightUpdateButton();
    });
    EnergyFolks.$('body').on('change', '#tags_filter input[type=checkbox]', function() {
        EnergyFolks.active_tags = new Array();
        if(EnergyFolks.$(this).val() == '___') {
            EnergyFolks.$('#tags_filter input[type=checkbox]:checked').each(function() {
                if(EnergyFolks.$(this).val() == '___') return;
                EnergyFolks.$(this).prop('checked', false);
            });
        } else {
            EnergyFolks.$('#tags_filter input[type=checkbox]:checked').each(function() {
                if(EnergyFolks.$(this).val() == '___')
                    EnergyFolks.$(this).prop('checked', false);
                else
                    EnergyFolks.active_tags.push(EnergyFolks.$(this).val());
            });
            EnergyFolks.active_tags.sort();
        }
        EnergyFolks.UpdateFilterText();
        EnergyFolks.HighlightUpdateButton();
    });
    EnergyFolks.$('body').on('change','#location_filter input[type=radio]', function() {
        var anywhere =  $('#location_filter input[type=radio]:checked').val();
        var val = EnergyFolks.$('#ef_filter_radius').val()*1;
        if(!(val > 0) && (anywhere > 0)) {
            val = 50;
            EnergyFolks.$('#ef_filter_radius').val(50);
        }
        EnergyFolks.map_location_radius = val * anywhere;
        EnergyFolks.UpdateFilterText();
        EnergyFolks.HighlightUpdateButton();
    });
    EnergyFolks.$('body').on('blur','#ef_filter_radius', function() {
        var val = EnergyFolks.$('#ef_filter_radius').val()*1;
        if(val > 0)
            EnergyFolks.$('.ef_location_radio2').prop("checked", true);
        else {
            val = 0;
            EnergyFolks.$('.ef_location_radio1').prop("checked", true);
        }
        EnergyFolks.map_location_radius = val;
        EnergyFolks.UpdateFilterText();
        EnergyFolks.HighlightUpdateButton();
    });
    EnergyFolks.$('body').on('blur','#ef_filter_location', function() {
        var val = EnergyFolks.$('#ef_filter_radius').val()*1;
        if(!(val > 0))
            EnergyFolks.$('#ef_filter_radius').val(50);
        EnergyFolks.map_location_radius = EnergyFolks.$('#ef_filter_radius').val();
        EnergyFolks.$('.ef_location_radio2').prop("checked", true);
        EnergyFolks.map_location_name = EnergyFolks.$('#ef_filter_location').val();
        var script = document.createElement('script');
        script.src = 'http://nominatim.openstreetmap.org/search/?format=json&json_callback=EnergyFolks.geocoded&q=' + encodeURIComponent(EnergyFolks.map_location_name);
        document.body.appendChild(script);
        EnergyFolks.$('#ef_submit_filters').hide();
        EnergyFolks.$('#ef_location_searching').show();
    });
    EnergyFolks.$('body').on('change','#source_filter input[type=radio]', function() {
        EnergyFolks.source_restrict =  $('#source_filter input[type=radio]:checked').val();
        EnergyFolks.UpdateFilterText();
        EnergyFolks.HighlightUpdateButton();
    });
    EnergyFolks.$('body').on('click','#ef_submit_filters button', function() {
        EnergyFolks.$(this).closest('div').hide();
        EnergyFolks.loadData(); return false;
    } );

    //searchbar
    EnergyFolks.$('body').on('click','#ef_list', function() {
        EnergyFolks.format = 'list';
        EnergyFolks.resetData();
    });
    EnergyFolks.$('body').on('click','#ef_cal', function() {
        EnergyFolks.format = 'month';
        EnergyFolks.resetData();
    });
    EnergyFolks.$('body').on('click','#ef_map', function() {
        EnergyFolks.format = 'map';
        EnergyFolks.resetData();
    });
    EnergyFolks.$('body').on('click','#ef_stream', function() {
        EnergyFolks.format = 'stream';
        EnergyFolks.resetData();
    });
    var search_function = function() {
        EnergyFolks.search_terms = EnergyFolks.$('#ef_search input').val();
        EnergyFolks.loadData();
    };
    EnergyFolks.$('body').on('click','#ef_search img', search_function);
    EnergyFolks.$('body').on('keypress','#ef_search input', function( event ) {
        if(event.which == 13) search_function();
    });
});

EnergyFolks.resetData = function() {
    EnergyFolks.$('#location_filter').show();
    if(EnergyFolks.format == 'list') {
        EnergyFolks.page = 0;
    }
    if(EnergyFolks.format == 'map') {
        EnergyFolks.$('#location_filter').hide();
        EnergyFolks.showMap();
        EnergyFolks.moveMap(false);
    }
    if(EnergyFolks.format == 'stream') {
        EnergyFolks.page = 0;
    }
    EnergyFolks.loadData();
}

EnergyFolks.showData = function(data) {
    if(EnergyFolks.get_moderated || EnergyFolks.get_my_posts) {
        EnergyFolks.$('#EnfolksFilterDiv').hide();
        EnergyFolks.$('#EnFolksSidebarDiv').hide();
    }
    EnergyFolks.$('.ef_selected').removeClass('ef_selected');
    EnergyFolks.data = data.data;
    if(data.more_pages)
        EnergyFolks.more_pages = true;
    if(EnergyFolks.source != 'discussions')
        EnergyFolks.$('#location_filter').show();
    // Moderation box
    var modtext = false;
    if(EnergyFolks.user_logged_in) {
        EnergyFolks.$.each(EnergyFolks.current_user.moderation_count.values, function(i, v) {
            if((!EnergyFolks.get_moderated) && (v.method == EnergyFolks.source) && (v.aid == EnergyFolks.id))
                modtext = true
        });
    }
    if(modtext)
        EnergyFolks.$("#moderation_box_" + EnergyFolks.source).html('<div class="moderation_box"><strong>You have items awaiting moderation</strong><a class="get_moderation" href="#">View Moderation Queue</a></div>');
    if(EnergyFolks.format == 'list') {
        EnergyFolks.$('#ef_list').addClass('ef_selected');
        EnergyFolks.showList();
    }
    if(EnergyFolks.format == 'month') {
        EnergyFolks.$('#ef_cal').addClass('ef_selected');
        EnergyFolks.showMonth();
    }
    if(EnergyFolks.format == 'map') {
        EnergyFolks.$('#ef_map').addClass('ef_selected');
        EnergyFolks.$('#location_filter').hide();
        EnergyFolks.populateMap();
    }
    if(EnergyFolks.format == 'stream') {
        EnergyFolks.$('#ef_stream').addClass('ef_selected');
        EnergyFolks.showList();
    }
}

EnergyFolks.loadData = function() {
    var bounds = '';
    if((EnergyFolks.format == 'map') && (EnergyFolks.$('#EnfolksMapDiv').length > 0)) {
        EnergyFolks.loading('#EnfolksMapDiv_loading');
        EnergyFolks.$('#EnfolksMapDiv_loading').show();
        bounds = "" + EnergyFolks.map_bounds[0][0] + "_" + EnergyFolks.map_bounds[0][1] + "_" + EnergyFolks.map_bounds[1][0] + "_" + EnergyFolks.map_bounds[1][1];
    } else if(EnergyFolks.page == 0)
        EnergyFolks.loading('#EnfolksResultDiv');
    else
        EnergyFolks.loading('#EnfolksResultDiv_' + EnergyFolks.page);
    EnergyFolks.ajax(EnergyFolks.source, {source: EnergyFolks.source_restrict, tags: EnergyFolks.active_tags, radius: EnergyFolks.map_location_radius, location_lat: EnergyFolks.map_location_lat, location_lng: EnergyFolks.map_location_lng, bounds: bounds, terms: EnergyFolks.search_terms, shift: EnergyFolks.shift_later, month: EnergyFolks.current_month, per_page: EnergyFolks.per_page, page: EnergyFolks.page, display: EnergyFolks.format, moderation: EnergyFolks.get_moderated, my_posts: EnergyFolks.get_my_posts}, EnergyFolks.showData);
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

//Map View
EnergyFolks.moveMap = function(allow_reload) {
    var bounds = EnergyFolks.map_layer.getBounds();
    var reload = false;
    if(bounds.getSouth() < EnergyFolks.map_bounds[0][0]) { reload=true; EnergyFolks.map_bounds[0][0] = bounds.getSouth(); }
    if(bounds.getWest() < EnergyFolks.map_bounds[0][1]) { reload=true; EnergyFolks.map_bounds[0][1] = bounds.getWest(); }
    if(bounds.getNorth() > EnergyFolks.map_bounds[1][0]) { reload=true; EnergyFolks.map_bounds[1][0] = bounds.getNorth(); }
    if(bounds.getEast() > EnergyFolks.map_bounds[1][1]) { reload=true; EnergyFolks.map_bounds[1][1] = bounds.getEast(); }
    if(reload && allow_reload) EnergyFolks.loadData();
}
EnergyFolks.showMap = function() {
    if (!EnergyFolks.$.support.leadingWhitespace) //TEST FOR IE6-8
        EnergyFolks.$('#EnfolksResultDiv').html("<div id='EnfolksMapDiv'><div class='ef_force_ie8'><div id='EnfolksMapDiv_map'></div><div id='EnfolksMapDiv_loading'></div></div></div>");
    else
        EnergyFolks.$('#EnfolksResultDiv').html("<div id='EnfolksMapDiv'><div id='EnfolksMapDiv_map'></div><div id='EnfolksMapDiv_loading'></div></div>");
    if((EnergyFolks.map_lat == 0) && (EnergyFolks.map_lng == 0)) {
        window.setTimeout(function() {Energyfolks.showMap(); }, 250);
        return;
    }
    EnergyFolks.map_layer = EnergyFolks.Leaflet.map('EnfolksMapDiv_map').setView([EnergyFolks.map_lat, EnergyFolks.map_lng], EnergyFolks.map_zoom);
    EnergyFolks.Leaflet.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(EnergyFolks.map_layer);
    EnergyFolks.marker_layer = new EnergyFolks.Leaflet.LayerGroup([]);
    EnergyFolks.marker_layer.addTo(EnergyFolks.map_layer);
    //Setup listeners
    EnergyFolks.map_layer.on('resize', function(e) {
        EnergyFolks.moveMap(true);
    });
    EnergyFolks.map_layer.on('zoomend', function(e) {
        EnergyFolks.moveMap(true);
    });
    EnergyFolks.map_layer.on('dragend', function(e) {
        EnergyFolks.moveMap(true);
    });
}
EnergyFolks.populateMap = function() {
    if(EnergyFolks.$('#EnfolksMapDiv').length == 0)
        EnergyFolks.showMap();
    EnergyFolks.$('#EnfolksMapDiv_loading').hide();
    EnergyFolks.marker_layer.clearLayers();
    EnergyFolks.$.each(EnergyFolks.data, function(i, v) {
        //EnergyFolks.marker_layer.addLayer(EnergyFolks.Leaflet.marker([v.latitude, v.longitude]).setPopupContent(EnergyFolks.itemDetailHTML(v, false)).openPopup());
        var marker = EnergyFolks.Leaflet.marker([v.latitude, v.longitude]);
        EnergyFolks.marker_layer.addLayer(marker);
        marker.bindPopup(EnergyFolks.itemDetailHTML(v, false) + "<a href='#' class='enfolks_detail_map_popup' style='display:block;text-align:right;'>View Full Details</a>");
    });
}

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
        output += "<a href='#' class='enfolks_prev_next' data-value='" + EnergyFolks.current_month + "'>< Previous</a>"; //due to shift, previous is just start of current month
    else
        output += "<a href='#' class='enfolks_prev_next' data-value='" + (EnergyFolks.current_month-1) + "'>< Previous</a>";
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
        output += "<a href='#' class='enfolks_prev_next' data-value='" + (EnergyFolks.current_month) + "'>Next ></a>";
    else
        output += "<a href='#' class='enfolks_prev_next' data-value='" + (EnergyFolks.current_month+1) + "'>Next ></a>";
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
            else if((EnergyFolks.source == 'events') && (curtime < EnergyFolks.mktime()))
                bgclass += ' past';
            output += "<td class='enfolks_day" + bgclass + (i == 0 ? ' enfolks_first' : '') + (i < 4 ? ' enfolks_right' : '') + "' id='ef_" + EnergyFolks.date("mdY",curtime) + "' valign='top'>";
            if(EnergyFolks.source == 'events')
                output += "<div style='text-align:right;'><a href='#' class='EnergyFolks_popup ef_add_event' style='display:none;' data-command='events/new' data-iframe='true' data-params='date=" + curtime +"' >Add Event</a> "+EnergyFolks.date('j',curtime)+"</div>";
            else
                output += "<div style='text-align:right;'>"+EnergyFolks.date('j',curtime)+"</div>";
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
    EnergyFolks.$('body').on('click','.enfolks_prev_next', function() {
        EnergyFolks.current_month = $(this).attr('data-value')*1;
        EnergyFolks.shift_later = false;
        EnergyFolks.loadData();
    });
});

//ListView
EnergyFolks.showList = function() {
    var output = '';
    var first = (EnergyFolks.page == 0);
    var last_date = '';
    EnergyFolks.$.each(EnergyFolks.data, function(i, v) {
        if ((EnergyFolks.source == 'events') && (v.start_date != last_date)) {
            output += "<div class='enfolks_date_item" + (EnergyFolks.mmddyyyy == v.mmddyyyy ? ' enfolks_today' : '') + "' " + (EnergyFolks.mmddyyyy == v.mmddyyyy ? ('style="background-color:#' + EnergyFolks.color + ';" ') : '') + ">" + v.start_date + "</div>";
            last_date = v.start_date;
        }
        output += "<div id='enfolks_item_" + v.id + "' class='enfolks_item enfolks_list_item " + (EnergyFolks.format == 'stream' ? 'ef_stream ' : '') + (first ? 'ef_first_item ' : '') + (v.highlighted ? 'ef_highlight ' : '') + "ef_"+EnergyFolks.source+"' data-id='"+v.id+"'>"+EnergyFolks.itemDetailHTML(v)+"</div>";
        first = false;
    });
    if(EnergyFolks.data.length == 0)
        output = "<h2>No Results</h2>There were no results returned for this search.";
    else if(!EnergyFolks.auto_load_on_scroll && EnergyFolks.more_pages)
        output += "<div class='ef_load_more'>Show More Results</div>";
    if(EnergyFolks.page == 0)
        EnergyFolks.$('#EnfolksResultDiv').html(output);
    else
        EnergyFolks.$('#EnfolksResultDiv_' + EnergyFolks.page).html(output);
}
EnergyFolks.$(function() {
    EnergyFolks.$( window ).scroll(function() {
        if(!(EnergyFolks.more_pages && EnergyFolks.auto_load_on_scroll)) return;
        var y_last = EnergyFolks.$('#EnfolksResultDiv_' + EnergyFolks.page).offset().top + EnergyFolks.$('#EnfolksResultDiv_' + EnergyFolks.page).height();
        var win_y = EnergyFolks.$( window ).scrollTop() + EnergyFolks.$( window ).height();
        if(win_y > y_last) {
            EnergyFolks.more_pages = false;
            EnergyFolks.page++;
            EnergyFolks.$('#EnfolksResultDiv').append('<div id="EnfolksResultDiv_' + EnergyFolks.page + '" style="padding:0px;margin:0px;"></div>');
            EnergyFolks.loadData();
        }
    });
});

EnergyFolks.itemDetailHTML = function(item, show_links) {
    if(typeof show_links === 'undefined') show_links = true;
    var output = ''
    var info = EnergyFolks.getItemInfo(item);
    output += EnergyFolks.affiliateLogo(info.affiliate_id, EnergyFolks.source == 'users' ? 'User is a member of' : 'Posted from the website of');
    if((info.admin_links != '') && (show_links))
        output += '<div class="admin_links">'+info.admin_links+'</div>';
    if(info.logo != '')
        output += '<img src="' + info.logo + '" class="enfolks_logo">';
    output += EnergyFolks.create_remote_popup('<h1 class="title">'+info.title+'</h1>', 'show', info.params);
    output += '<h3 class="line1">' + info.line_one + '</h3>';
    if(EnergyFolks.format == 'stream')
        output += '<div class="html">' + info.html + EnergyFolks.Comments_HTML(info.title, info.hash, true) + '</div>';
    else
        output += '<span class="line2">' + info.line_two + '</span>';
    return output;
}
// Listener for clicks on entries
EnergyFolks.$(function() {
    EnergyFolks.$('body').on('click','.enfolks_item', function() {
        if(EnergyFolks.$(this).hasClass('ef_stream')) return;
        var params = EnergyFolks.$(this).find('h1.title').closest("a.EnergyFolks_popup").attr("data-params");
        EnergyFolks.remote_popup('show', params);
    });
    EnergyFolks.$('body').on('click','.enfolks_detail_popup_white', function() {
        var params = EnergyFolks.$(this).parent().find('h1.title').closest("a.EnergyFolks_popup").attr("data-params");
        EnergyFolks.remote_popup('show', params);
    });
    EnergyFolks.$('body').on('click','.enfolks_detail_map_popup', function() {
        var params = EnergyFolks.$(this).parent().find('h1.title').closest("a.EnergyFolks_popup").attr("data-params");
        EnergyFolks.remote_popup('show', params);
        return false;
    });
    EnergyFolks.$('body').on('click','.ef_load_more', function() {
        EnergyFolks.$(this).hide();
        EnergyFolks.auto_load_on_scroll = true;
        EnergyFolks.more_pages = false;
        EnergyFolks.page++;
        EnergyFolks.$('#EnfolksResultDiv').append('<div id="EnfolksResultDiv_' + EnergyFolks.page + '" style="padding:0px;margin:0px;"></div>');
        EnergyFolks.loadData();
    });
});
EnergyFolks.getItemInfo = function(item, source) {
    var output = {};
    if(typeof source === 'undefined') source = EnergyFolks.source;
    if(source == 'users') {
        output.affiliate_id = item.affiliate_id;
        output.logo = item.avatar ? item.avatar_url : '';
        output.params = {id: item.id, model: 'User'};
        output.title = item.first_name + ' ' + item.last_name;
        output.line_one = item.position;
        output.line_two = item.organization;
        output.widget = output.line_one;
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
    } else if(source == 'jobs') {
        output.affiliate_id = item.affiliate_id;
        output.logo = item.logo ? item.logo_url : '';
        output.title = item.name;
        output.params = {id: item.id, model: 'Job'};
        output.line_one = item.employer;
        output.line_two = item.location;
        output.widget = output.line_one;
        output.admin_links = EnergyFolks.adminLink(item, 'jobs');
    } else if(source == 'events') {
        output.affiliate_id = item.affiliate_id;
        output.logo = item.logo ? item.logo_url : '';
        output.title = item.name;
        output.params = {id: item.id, model: 'Event'};
        output.line_one = item.start_time + " - " + item.end_time + " " + item.tz;
        output.line_two = item.location;
        output.widget = item.start_data + ", " + output.line_one;
        output.admin_links = EnergyFolks.adminLink(item, 'events');
    } else if(source == 'discussions') {
        output.affiliate_id = item.affiliate_id;
        output.logo = '';
        output.title = item.name;
        output.params = {id: item.id, model: 'Discussion'};
        output.line_one = '';
        output.line_two = '';
        output.widget = output.line_one;
        output.html = item.html;
        output.hash = "Discussion_" + item.id;
        output.admin_links = EnergyFolks.adminLink(item, 'discussions');
    }
    return output;
};
EnergyFolks.adminLink = function(item, source) {
    var model = 'User';
    if(source == 'events') model = 'Event';
    else if(source == 'jobs') model = 'Job';
    else if(source == 'discussions') model = 'Discussion';
    else if(source == 'blogs') model = 'Blog';
    var admin_links = '';
    if(EnergyFolks.get_moderated) {
        admin_links += "<a href='#' class='ef_approve_link' data-params='" + EnergyFolks.$.param({model: model, id: item.id, highlight: true}) + "'>Approve and Highlight</a>";
        admin_links += "<a href='#' class='ef_approve_link' data-params='" + EnergyFolks.$.param({model: model, id: item.id, highlight: false}) + "'>Approve</a>";
        admin_links += "<a href='#' class='ef_reject_link' data-model='" + model + "' data-id='" + item.id + "'>Reject</a>";
    } else if(EnergyFolks.current_user.super_admin) {
        admin_links += EnergyFolks.create_iframe_popup('Edit Post',source + '/edit',{id: item.id});
    } else if(EnergyFolks.current_user.id == item.user_id) {
        admin_links += '<strong>This is your post</strong>' + EnergyFolks.create_iframe_popup('Edit Post',source + '/edit',{id: item.id});
    }
    return admin_links;
}
EnergyFolks.$(function() {
    EnergyFolks.$('body').on('click', '.ef_approve_link', function() {
        EnergyFolks.$(this).before('<div><i>Loading...</i></div>');
        EnergyFolks.$(this).hide();
        EnergyFolks.ajax('approve', EnergyFolks.$(this).attr('data-params'), function(data) {
            EnergyFolks.$('#enfolks_item_' + data.remove_item).slideUp();
            EnergyFolks.showNotice(data.notice);
        });
        return false;
    });
    EnergyFolks.$('body').on('click', '.ef_reject_link', function() {
        var reason = prompt('Please profide a reason for rejection');
        if((typeof reason === 'undefined') || (reason.trim() == '')) {
            EnergyFolks.showNotice('You must provide a reason', 'red');
            return false;
        }
        EnergyFolks.$(this).before('<div><i>Loading...</i></div>');
        EnergyFolks.$(this).hide();
        EnergyFolks.ajax('reject', {model: EnergyFolks.$(this).attr('data-model'), id: EnergyFolks.$(this).attr('data-id'), reason: reason}, function(data) {
            EnergyFolks.$('#enfolks_item_' + data.remove_item).slideUp();
            EnergyFolks.showNotice(data.notice);
        });
        return false;
    });
});

