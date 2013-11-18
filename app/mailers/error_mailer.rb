class ErrorMailer < ActionMailer::Base
  def experror(e, u, a, r)
    @err=e
    @user = u
    @aff = a
    @req = r
    mail(:to => EXCEPTION_RECIPIENTS,
        :from => EXCEPTION_SENDER,
        :subject => "#{EXCEPTION_PREFIX}#{e.message}")
  end

  def mailerror(e)
    @err = e
    mail(:to => EXCEPTION_RECIPIENTS,
         :from => EXCEPTION_SENDER,
         :subject => "#{EXCEPTION_PREFIX}Mail Error")
  end


  def error_back_to_sender(email, subject, original_subject, error)
    @error = error
    @original_subject = original_subject
    mail(to: email, subject: subject)
  end

  def message_back_to_sender(email, subject, original_subject, item)
    @item = item
    @original_subject = original_subject
    mail(to: email, subject: subject)
  end

end