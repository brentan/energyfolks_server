
EnergyFolks.$(function() {
    var ShowNotice = function(result) {
        EnergyFolks.showNotice(result.notice);
        EnergyFolks.$("#"+result.element_id).replaceWith(result.new_item);
        EnergyFolks.$("#ef_item_"+result.remove_item).hide(250);
    };
    EnergyFolks.$('body').on('click', '.EnergyFolks_ajax', function() {
        var self = EnergyFolks.$(this);
        var ranid = Math.floor(Math.random()*10000000000)
        var params = self.attr('data-params') + '&element_id=ef_' + ranid
        EnergyFolks.ajax(self.attr('data-command'), params, ShowNotice);
        self.replaceWith('<span id="ef_'+ranid+'" style="ef_ajax_loading">Loading...</span>')
        return false;
    });
    EnergyFolks.$('body').on('click', '.EnergyFolks_delete', function() {
        if (confirm("Are you sure you want to delete this item?  Once deleted, it cannot be restored.")) {
            var self = EnergyFolks.$(this);
            var ranid = Math.floor(Math.random()*10000000000)
            var params = self.attr('data-params') + '&element_id=ef_' + ranid
            EnergyFolks.ajax(self.attr('data-command'), params, ShowNotice);
            self.replaceWith('<span id="ef_'+ranid+'" style="ef_ajax_loading">Loading...</span>')
        }
        return false
    });
});