$(function() {
    $('body').on('ajax:before','.resend_activation', function() {
        $(this).hide();
        $(this).after("Email Sent");
    });
    function TestEdu(el) {
        if(el.val().indexOf('.edu') > 0)
            $('#secondary_email_div').show();
        else {
            $('#secondary_email_div').hide();
            $('#user_secondary_email').val('');
        }
    }
    $('body').on('change', '#user_email', function() {
        TestEdu($(this));
    });

    function TestOptions(el) {
        if((el.val() < 2) || (el.val() == 5))
            el.closest(".affiliate_options").find(".grad_year_select").show();
        else
            el.closest(".affiliate_options").find(".grad_year_select").hide();
        if(el.val() < 6)
            el.closest(".affiliate_options").find(".program_select").show();
        else
            el.closest(".affiliate_options").find(".program_select").hide();
        if((el.val() == 6) || (el.val() == 5))
            el.closest(".affiliate_options").find(".other_select").show();
        else
            el.closest(".affiliate_options").find(".other_select").hide();
    }
    $('body').on('change', '.affiliation_select select', function() {
        TestOptions($(this));
    });
    try {
        TestEdu($('#user_email'));
        $('.affiliation_select select').each(function() {
            TestOptions($(this));
        });
    } catch(err) { }
});