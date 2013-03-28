$(function() {
    $('body').on('ajax:before','.resend_activation', function() {
        $(this).hide();
        $(this).after("Email Sent");
    });
});