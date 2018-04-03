LINKEDIN_KEY = ENV['LINKEDIN_KEY']
LINKEDIN_SECRET = ENV['LINKEDIN_SECRET']

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :linkedin, LINKEDIN_KEY, LINKEDIN_SECRET, :scope => 'r_basicprofile r_emailaddress'

  OmniAuth.config.on_failure = Proc.new do |env|
    UsersController.action(:omniauth_failure).call(env)
    #this will invoke the omniauth_failure action in UsersController.
  end
end