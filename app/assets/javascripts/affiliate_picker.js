$(function() {
    var createField = function(table, join_table, jid, tid, id, reason, item) {
        if(reason != 'false') {
            var current_reason = item.find(".current_reason").html();
            current_reason = prompt("This affiliate must approve new members.  Please let us know why you would like to join this group",current_reason);
            if(current_reason == null) return;
            item.find(".descriptor").html(" - Reason: <span class='current_reason'>" + current_reason + "</span>");
        }
        if($("#ef_affiliate_"+jid).length == 0) {
            //not in existence, so create form elements
            outtext = '<div id="ef_affiliate_'+jid+'" class="item">';
            outtext += '<input type=hidden id="' + table + '_' + join_table + '_attributes_' + jid + '_affiliate_id" name="' + table + '[' + join_table + '_attributes][' + jid + '][affiliate_id]" value="' + id + '">';
            if(reason != 'false')
                outtext += '<input type=hidden id="' + table + '_' + join_table + '_attributes_' + jid + '_reason" name="' + table + '[' + join_table + '_attributes][' + jid + '][reason]" value="' + current_reason + '">';
            outtext += '<input type=hidden id="' + table + '_' + join_table + '_attributes_' + jid + '__destroy" name="' + table + '[' + join_table + '_attributes][' + jid + '][_destroy]" value="false">';
            if(tid > 0)
                outtext += '<input type=hidden id="' + table + '_' + join_table + '_attributes_' + jid + '_id" name="' + table + '[' + join_table + '_attributes][' + jid + '][id]" value="'+tid+'">';
            outtext += '</div>';
            $("#EnergyFolksAffiliatePicker #form_elements").append(outtext);
        } else {
            //already exists, so just undo any 'destroy' stuff
            var fields = $("#ef_affiliate_"+jid);
            fields.find('#' + table + '_' + join_table + '_attributes_' + jid + '__destroy').val('false');
            if(reason != 'false')
                fields.find('#' + table + '_' + join_table + '_attributes_' + jid + '_reason').val(current_reason);
        }
    };
    var removeField  = function(table, join_table, jid, tid, id) {
        if($("#ef_affiliate_"+jid).length == 0) return;
        var fields = $("#ef_affiliate_"+jid);
        if(tid > 0) {
            fields.find('#' + table + '_' + join_table + '_attributes_' + jid + '__destroy').val('1');
        } else {
            fields.remove();
            $("#" + table + '_' + join_table + '_attributes_' + jid + '_reason_div').remove();
        }
    };
    var ToggleItem = function(item) {
        var id = item.attr('data-id')*1;
        var table = item.attr('data-table');
        var join_table = item.attr('data-join-table');
        var jid = item.attr('data-jid')*1;
        var tid = item.attr('data-tid')*1;
        var reason = item.attr('data-reason');
        if(item.hasClass('selected')) {
            item.removeClass('selected');
            item.addClass('unselected');
            removeField(table, join_table, jid, tid, id);
            item.find(".descriptor").hide();
        } else {
            item.addClass('selected');
            item.removeClass('unselected');
            item.find(".descriptor").show();
            createField(table, join_table, jid, tid, id, reason, item);
        }
    };
    // Create the 'select all' and 'select none' links
    $("#EnergyFolksAffiliatePicker .choose_all_affiliates").on("click", function() {
        if($("#send_to_all_no").is(':checked')) {
            $("#EnergyFolksAffiliatePicker").find("div.selected").each(function() {
                ToggleItem($(this));
            });
            $("#choose_affiliates").hide();
            $("#send_to_all_yes").prop("checked", true);
            var item = $(".affiliate_0");
            var id = item.attr('data-id')*1;
            var table = item.attr('data-table');
            var join_table = item.attr('data-join-table');
            var jid = item.attr('data-jid')*1;
            var tid = item.attr('data-tid')*1;
            var reason = item.attr('data-reason');
            createField(table, join_table, jid, tid, id, reason, item);
        }
        return false;
    });
    $("#EnergyFolksAffiliatePicker .choose_no_affiliates").on("click", function() {
        if($("#send_to_all_yes").is(':checked')) {
            $("#choose_affiliates").show();
            $("#send_to_all_no").prop("checked", true);
            var item = $(".affiliate_0");
            var id = item.attr('data-id')*1;
            var table = item.attr('data-table');
            var join_table = item.attr('data-join-table');
            var jid = item.attr('data-jid')*1;
            var tid = item.attr('data-tid')*1;
            var reason = item.attr('data-reason');
            removeField(table, join_table, jid, tid, id);
        }
        return false;
    });
    // Attach to the elements created by the affiliate picker
    $("#EnergyFolksAffiliatePicker div.affiliate").on("click", function() {
        ToggleItem($(this));
        return false;
    });
    // Run at load to check off all items currently marked as 'current'
    $("#EnergyFolksAffiliatePicker div.selected").each(function() {
        var item = $(this);
        var id = item.attr('data-id')*1;
        var table = item.attr('data-table');
        var join_table = item.attr('data-join-table');
        var jid = item.attr('data-jid')*1;
        var tid = item.attr('data-tid')*1;
        createField(table, join_table, jid, tid, id, 'false', item);
    });
    //TODO: TEST ENERGYFOLKS ONLY STUFF!
    if($("#send_to_all_yes").is(':checked')) {
        var item = $(".affiliate_0");
        var id = item.attr('data-id')*1;
        var table = item.attr('data-table');
        var join_table = item.attr('data-join-table');
        var jid = item.attr('data-jid')*1;
        var tid = item.attr('data-tid')*1;
        var reason = item.attr('data-reason');
        createField(table, join_table, jid, tid, id, reason, item);
    }
});

/*
Format for the nested form elements:
<div class="fields">
    <input id="user_memberships_attributes_0_affiliate_id" name="user[memberships_attributes][0][affiliate_id]" size="30" type="text" value="2">
    <input id="user_memberships_attributes_0__destroy" name="user[memberships_attributes][0][_destroy]" type="hidden" value="false">
    <a href="javascript:void(0)" class="remove_nested_fields" data-association="memberships">Remove</a>
    <input id="user_memberships_attributes_0_id" name="user[memberships_attributes][0][id]" type="hidden" value="4">
</div>
*/