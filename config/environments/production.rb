EnergyfolksServer::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb

  # Code is not reloaded between requests
  config.cache_classes = true

  # Full error reports are disabled and caching is turned on
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Disable Rails's static asset server (Apache or nginx will already do this)
  config.serve_static_assets = false

  # Compress JavaScripts and CSS
  config.assets.compress = true

  # Don't fallback to assets pipeline if a precompiled asset is missed
  config.assets.compile = false

  # Generate digests for assets URLs
  config.assets.digest = true

  # Defaults to nil and saved in location specified by config.assets.prefix
  # config.assets.manifest = YOUR_PATH

  # Specifies the header that your server uses for sending files
  # config.action_dispatch.x_sendfile_header = "X-Sendfile" # for apache
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for nginx

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = true

  # See everything in the log (default is :info)
  # config.log_level = :debug

  # Prepend all log lines with the following tags
  # config.log_tags = [ :subdomain, :uuid ]

  # Use a different logger for distributed setups
  # config.logger = ActiveSupport::TaggedLogging.new(SyslogLogger.new)

  # Use a different cache store in production
  # config.cache_store = :mem_cache_store

  # Enable serving of images, stylesheets, and JavaScripts from an asset server
  # config.action_controller.asset_host = "http://assets.example.com"

  # Precompile additional assets (application.js, application.css, and all non-JS/CSS are already added)
  config.assets.precompile += %w( energyfolks.js energyfolks.css )

  # Disable delivery errors, bad email addresses will be ignored
  # config.action_mailer.raise_delivery_errors = false

  # Enable threaded mode
  # config.threadsafe!

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found)
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners
  config.active_support.deprecation = :notify

  # Log the query plan for queries taking more than this (works
  # with SQLite, MySQL, and PostgreSQL)
  # config.active_record.auto_explain_threshold_in_seconds = 0.5


  AMAZON_CLOUDSEARCH_ENDPOINT = ENV['EC2_ENDPOINT']
  AMAZON_REGION = 'us-west-1'
  USE_CLOUDSEARCH = false # true
  config.paperclip_defaults = {
      :url => ':s3_domain_url',
      :s3_protocal => 'https',
      :storage => :s3,
      :bucket => ENV['EC2_BUCKET'],
      :s3_credentials => {:access_key_id => ENV['EC2_KEY'], :secret_access_key => ENV['EC2_CODE']},
      :s3_permissions => 'public-read'
  }

  # Load certs from S3
  require 'rubygems'
  require 'aws-sdk-v1'

  s3 = AWS::S3.new()

  unless File.exist?("#{Rails.root}/config/google_cert.txt")
    document = s3.buckets['energyfolks-uploads'].objects['google_cert.txt']

    File.open("#{Rails.root}/config/google_cert.txt", "w") do |f|
      f.write(document.read)
    end
    document = s3.buckets['energyfolks-uploads'].objects['google_key.txt']

    File.open("#{Rails.root}/config/google_key.txt", "w") do |f|
      f.write(document.read)
    end
    document = s3.buckets['energyfolks-uploads'].objects['google_privatekey.p12']

    File.open("#{Rails.root}/config/google_privatekey.p12", "w:ASCII-8BIT") do |f|
      f.write(document.read)
    end
  end

  # load google cert and key for SAML
  file = File.open("#{Rails.root}/config/google_cert.txt", "rb")
  SamlIdp.config.x509_certificate = file.read
  file.close
  file = File.open("#{Rails.root}/config/google_key.txt", "rb")
  SamlIdp.config.secret_key = file.read
  file.close
end
