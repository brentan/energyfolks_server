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
end