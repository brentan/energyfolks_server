$(function () {
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

});
