# Load the rails application
require File.expand_path('../application', __FILE__)

# Read in the site-specific information so that the initializers can take advantage of it.
config_file = File.join(Rails.root, "config", "site.yml")
if File.exists?(config_file)
  SITE_SPECIFIC = YAML.load(ERB.new(File.read(config_file)).result)
else
  puts "***"
  puts "*** Failed to load site configuration. Did you create #{config_file}?"
  puts "***"
end

# Initialize the rails application
EnergyfolksServer::Application.initialize!
