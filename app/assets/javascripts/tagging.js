$(function() {
    $(".tag_box").select2({
        multiple: true,
        placeholder: "",
        tokenSeparators: [ " ", "," ],
        minimumInputLength: 2,
        ajax: {
            url: '/ajax/tags.json',
            dataType: "json",
            data: function(term, page) {
                return {
                    q: term
                };
            },
            results: function(data, page) {
                return {results: data};
            }
        },
        createSearchChoice: function(term) {
            if(term.length < 2) return null;
            return {
                id: term,
                text: term
            };
        },
        initSelection : function (element, callback) {
            var data = [];
            $(element.val().split(",")).each(function () {
                data.push({id: this, text: this});
            });
            callback(data);
        }
    });
});