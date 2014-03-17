
$(function($) {
    var stripeResponseHandler = function(status, response) {
        var $form = $('#payment-form');

        if (response.error) {
            // Show the errors on the form
            EnergyFolks.showNotice(response.error.message, 'red');
            $form.find('button').prop('disabled', false);
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
});