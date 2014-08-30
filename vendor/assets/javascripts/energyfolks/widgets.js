

/*
 The showWidget function is the master function to show energyfolks widgets.

 The first parameters is the source:
  events
  jobs
  discussions
  blogs

 The second parameter is a JSON array with the following [optional] options:
  items: number of items to show (default 5)
  item_height: height (px) of individual item (default 35)
  title: Box title (set to '' to omit a title, default is 'recent posts' or 'upcoming events')
  show_more: link text for 'show more' link at bottom (set to '' to omit a link, default is 'Go to [Job Board, Blog, All Discussions, Calendar]')
  latitude:, longitude: location of point to search around (default is affiliate location)
  radius: radius (miles) to search around (default is affiliate chosen radius, 0 is no restriction)
    - Note: Radius will default to affiliate radius unless a latitude and longitude are also provided.
  affiliate_only: only show items posted from this affiliate (default false)
  highlighted_only: only show items highlighted by this affiliate (default false)
  terms: search terms to use to limit results (default '')
  tags: comma separated list of tags to use to limit results (default '')
 */
EnergyFolks.showWidget = function(source, params) {
    //Backwards compatible
    if(source == 'calendar') source = 'events';
    if(source == 'bulletins') source = 'discussions';
    if(source == 'bulletins-stream') source = 'discussions';
    if(typeof params.items !== 'undefined') var items = params.items; else var items = 5;
    if(typeof params.item_height !== 'undefined') var height = params.item_height; else var height = 35;
    if(typeof params.latitude !== 'undefined') var lat = params.latitude; else var lat = 0;
    if(typeof params.longitude !== 'undefined') var lng = params.longitude; else var lng = 0;
    if(typeof params.radius !== 'undefined') var radius = params.radius; else var radius = 0;
    if(typeof params.terms !== 'undefined') var terms = params.terms; else var terms = '';
    if(typeof params.tags !== 'undefined') var tags = params.tags; else var tags = '';
    if(typeof params.affiliate_only !== 'undefined') var affiliate = params.affiliate_only; else var affiliate = false;
    if(typeof params.highlighted_only !== 'undefined') var highlight = params.highlighted_only; else var highlight = false;
    if(typeof params.title !== 'undefined')
        var title = params.title;
    else if(source == 'events')
        var title = 'Upcoming Events';
    else if(source == 'jobs')
        var title = 'Recent Job Posts';
    else if(source == 'discussions')
        var title = 'Recent Discussions';
    else
        var title = 'Recent Blog Posts';
    if(typeof params.show_more !== 'undefined')
        var show_more = params.show_more;
    else if(source == 'events')
        var show_more = 'Go to Calendar';
    else if(source == 'jobs')
        var show_more = 'Go to Job Board';
    else if(source == 'discussions')
        var show_more = 'Go to All Discussions';
    else
        var show_more = 'Go to Blog';
    var source_restrict = EnergyFolks.ANY_POST;
    if(affiliate) source_restrict = EnergyFolks.AFFILIATE_ONLY;
    if(highlight) source_restrict = EnergyFolks.HIGHLIGHTED_ONLY;
    if(title != '')
        document.write("<h2 class='ef_widget_title'>" + title + "</h2>");
    document.write("<div style='height:" + (items * height) + "px;' class='ef_widget ef_" + source + "' id='ef_widget_" + EnergyFolks.comment_id_count + "'></div>");
    if(show_more != '')
        document.write("<div class='ef_widget_show_more' data-type='" + source + "'>" + show_more + "</div>");
    EnergyFolks.loading('#ef_widget_' + EnergyFolks.comment_id_count);
    var id = EnergyFolks.comment_id_count;
    EnergyFolks.ajax(source, {source: source_restrict, tags: tags, radius: radius, location_lat: lat, location_lng: lng, bounds: '', terms: terms, shift: false, month: 0, per_page: items, page: 0, display: 'list', moderation: false, my_posts: false}, function(data) { EnergyFolks.populateWidget(data, id, height, source); });
    EnergyFolks.comment_id_count++;
}

/*
 * Support functions to populate individual widgets
 */

EnergyFolks.populateWidget = function(data, id, height, source) {
    var output = '';
    var first = true;
    height -= 1;
    if(data.data.length == 0) output = 'No Results Found';
    EnergyFolks.$.each(data.data, function(i, v) {
        var info = EnergyFolks.getItemInfo(v, source);
        output += '<div data-params="' + EnergyFolks.$.param(info.params) + '" class="ef_item' + (first ? ' first' : '') + (v.highlighted ? ' ef_highlight' : '') + '" style="height:' + height + 'px;"><div class="line_one"><h3>' + info.title + '</h3></div><div class="line_two">' + info.widget + '</div></div>';
        first = false;
    });
    EnergyFolks.$('#ef_widget_' + id).html(output);
}

//Listeners
EnergyFolks.$(function() {
    EnergyFolks.$('body').on('click','.ef_item', function() {
        var params = EnergyFolks.$(this).attr("data-params");
        EnergyFolks.remote_popup('show', params);
    });
    EnergyFolks.$('body').on('click', '.ef_widget_show_more', function() {
        var source = EnergyFolks.$(this).attr("data-type");
        window.location.href = eval('EnergyFolks.url_' + source);
    });
});