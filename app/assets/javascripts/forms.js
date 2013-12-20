$(function () {
    /* not used, for now
    //the jobs _form partial has a custom-styled file input button.
    //to make that work, the real file input is made transparent,
    //and a div styled as a button is put behind it.
    //in order to show the file chosen, we have to detect the new filename
    //and show it in the visible div behind.
    //the mouseout event is used so you can unselect a file- apparently some browsers don't fire the change event in that case.
    //code adapted from http://www.quirksmode.org/dom/inputfile.html
    var handleFileUploadChange = function () {
        var i = this.value.lastIndexOf("\\") + 1;
        var fileName = this.value.substring(i);
        $(".file_name_label").text(fileName);
    }

    $(".file_inputs > input:file").change( handleFileUploadChange );
    $(".file_inputs > input:file").mouseout( handleFileUploadChange );
    */

    //limit the length of the event synopsis text field
    $("textarea.limitLength").keypress( function () {
        var maxLength = parseInt($(this).attr('maxlength'));
        $(this).parent().find(".limitLength_charsRemaining").html(maxLength - this.value.length);
        }
    );
    var GeoLocateFinish = function(result) {
        if(result.success)
            $('.GoLoader').prev("input").val(result.name);
        else
            EnergyFolks.showNotice('Location could not be found','red');
        $('.GoLoader').remove();
    }
    var GeoLocate = function(element) {
        $('.GoLoader').remove();
        element.after('<span class="GoLoader"><img src="/assets/loader.gif" style="width:20px;height:20px;"></span>');
        $.ajax({
            url: '/energyfolks/locate',
            data: {location: element.val() },
            success: GeoLocateFinish
        });
    };
    $("body").on('blur', '#job_location', function() {
        GeoLocate($(this));
    });
    $("body").on('blur', '#event_location', function() {
        GeoLocate($(this));
    });
    $("body").on('blur', '#user_location', function() {
        GeoLocate($(this));
    });
    $("body").on('blur', '#affiliate_location', function() {
        GeoLocate($(this));
    });
});
