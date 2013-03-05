source 'https://rubygems.org'

gem 'rails', '3.2.12'
gem 'jquery-rails'
gem 'rails-asset-jqueryui'
gem 'select2-rails', '~> 3.3.0', :git => 'git://github.com/argerim/select2-rails.git'
gem 'nested_form'#, '0.2.3'
gem 'historyjs-rails'
gem 'strip_attributes'
gem 'geokit'
gem 'geokit-rails3'

# For doing either periodic background tasks or any long, one-time task in the background.
gem 'daemons'
gem 'delayed_job_active_record'
gem 'whenever', require: false

gem 'linkedin'   #used to do pull profile info from LinkedIn.com

gem 'exception_notification'

gem 'email_reply_parser'

gem 'mysql2'


# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'
  gem 'uglifier', '>= 1.0.3'
end

# For handling file uploads, particularly pictures
gem "paperclip"

# Deploy with Capistrano
gem 'capistrano'  #, '2.9.0'

# Bundle gems for the local environment. Make sure to
# put test-only gems in this group so their generators
# and rake tasks are available in development mode:
group :development, :test do

  # To debug
  gem 'debugger'

  gem 'rspec-rails', "~> 2.4"
  gem 'factory_girl_rails'  #, 1.5.0
  gem 'simplecov'  #, '0.5.4'

  gem 'sass', :require => 'sass'
  gem 'capybara'
  gem 'launchy'
  gem 'letter_opener'
end