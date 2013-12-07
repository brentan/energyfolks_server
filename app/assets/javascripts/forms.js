$(function () {

    var handleFileUploadChange = function () {
        var i = this.value.lastIndexOf("\\") + 1;
        var fileName = this.value.substring(i);
        $(".file_name_label").text(fileName);
    }

    $(".file_inputs > input:file").change( handleFileUploadChange );
    $(".file_inputs > input:file").mouseout( handleFileUploadChange );

});
