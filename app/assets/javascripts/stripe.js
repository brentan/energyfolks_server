
$(function($) {
    var stripeResponseHandler = function(status, response) {
        var $form = $('#payment-form');

        if (response.error) {
            // Show the errors on the form
            EnergyFolks.showNotice(response.error.message, 'red');
            $form.find('button').prop('disabled', false);
            $form.find('button').show();
            $form.find('#loading_button').hide();
        } else {
            // token contains id, last4, and card type
            var token = response.id;
            // Insert the token into the form so it gets submitted to the server
            $form.append($('<input type="hidden" name="token" />').val(token));
            $form.append($('<input type="hidden" name="last4" />').val(response.card.last4));
            $form.append($('<input type="hidden" name="card_type" />').val(response.card.type));
            // and submit
            $form.get(0).submit();
        }
    };
    $('#payment-form').submit(function(event) {
        var $form = $(this);

        if(($form.find('#amount').val()*1) > 0) {

            // Disable the submit button to prevent repeated clicks
            $form.find('button').prop('disabled', true);
            $form.find('button').hide();
            $form.find('#loading_button').show();
            if($('#selected_card').val() == 'new')
                Stripe.card.createToken($form, stripeResponseHandler);
            else
                return true;
        } else
            EnergyFolks.showNotice('Please Enter a Valid Amount','red');
        // Prevent the form from submitting with the default action
        return false;
    });
    $('body').on('click', '.card_item', function() {
        $this = $(this);
        if($this.hasClass('selected_no_yellow')) return;
        $this.closest('.card').find('.card_item').removeClass('selected');
        $this.addClass('selected');
        $('#selected_card').val($this.attr('data-id'));
    });
    $('body').on('click', 'a.remove_stripe', function() {
        $this = $(this);
        EnergyFolks.ajax('remove_stripe', {id: $this.attr('data-id')}, function(data) {
            $this.closest('tr').hide({duration: 400});
        });
        $this.hide();
        $this.after('<i>Working...</i>');
        return false;
    });
    $('body').on('click', 'a.stripe_refund', function() {
        $this = $(this);

        if(!confirm('Refund this charge? (ID: ' + $this.attr('data-sid') + ', Amount: $' + $this.attr('data-amt') + ')')) return false;
        EnergyFolks.ajax('refund_stripe', {id: $this.attr('data-id')}, function(data) {
            if(data.complete) {
                EnergyFolks.showNotice('Donation has been refunded (ID: ' + $this.attr('data-sid') + ', Amount: $' + $this.attr('data-amt') + ')');
                $this.closest('tr').hide({duration: 400});
            } else {
                $this.next('i').hide();
                EnergyFolks.showNotice('Something went wrong.  Are you logged in?  Has this charge been removed from Stripe?','red');
            }
        });
        $this.hide();
        $this.after('<i>Working...</i>');
        return false;
    });
    $( "#donation_slider" ).slider({
        range: "min",
        value:parseInt($("#donation_slider").attr('data-val')),
        min: 50,
        max: 750,
        step: 50,
        slide: function( event, ui ) {
            $( "#donate_amount" ).html( "$" + ui.value );
            $( "#amount" ).val( ui.value );
            $( "#donate_button").html('Donate $' + ui.value + '!')
        }
    });
});