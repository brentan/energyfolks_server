# Be sure to restart your server when you modify this file.

EnergyfolksServer::Application.config.session_store :cookie_store, key: '_energyfolks_server_session', :domain => SITE_SPECIFIC['site_settings']['domain']

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rails generate session_migration")
# EnergyfolksServer::Application.config.session_store :active_record_store
Aes2::Application.config.session_store :active_record_store, :domain => SITE_SPECIFIC['site_settings']['domain']
