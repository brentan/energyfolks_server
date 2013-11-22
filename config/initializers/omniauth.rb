Rails.application.config.middleware.use OmniAuth::Builder do
  provider :linkedin, "key", "secret", :scope => 'r_fullprofile r_emailaddress'
end