class ErrorMailer < ActionMailer::Base
  def experror(e)
    @err=e
    mail(:to => EXCEPTION_RECIPIENTS,
        :from => EXCEPTION_SENDER,
        :subject => "#{EXCEPTION_PREFIX}#{e.message}")
  end
end