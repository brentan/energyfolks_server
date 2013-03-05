# Create incoming mail logfile and logger to monitor the incoming mail stream
class IncomingMailLogger < Logger
	def format_message(severity, timestamp, progname, msg)
        "#{timestamp}: #{msg}\n"
    end
end
logfile = File.open(Rails.root + 'log/incoming_mail.log', File::WRONLY|File::APPEND|File::CREAT, 0666)
logfile.sync = true
IncomingMailLoggerObject = IncomingMailLogger.new(logfile)
class Object
	def incoming_mail_log(mssg)
		IncomingMailLoggerObject.info(mssg)
	end
end


# config/initializers/setup_mail.rb

ActionMailer::Base.smtp_settings = {
		:address => SITE_SPECIFIC['smtp_settings']['address'],
		:port => SITE_SPECIFIC['smtp_settings']['port'],
		:domain => SITE_SPECIFIC['smtp_settings']['domain'],
		:user_name => SITE_SPECIFIC['smtp_settings']['user_name'],
		:password => SITE_SPECIFIC['smtp_settings']['password'],
		:authentication => SITE_SPECIFIC['smtp_settings']['authentication'],
		:enable_starttls_auto => SITE_SPECIFIC['smtp_settings']['enable_starttls_auto']
}

# This is for sendgrid: it helps with the statistics on the sendgrid site.
if SITE_SPECIFIC['smtp_settings']['xsmtpapi'].present?
	ActionMailer::Base.default "X-SMTPAPI" => "{\"category\": \"#{SITE_SPECIFIC['smtp_settings']['xsmtpapi']}\"}"
end

ActionMailer::Base.default_url_options[:host] = SITE_SPECIFIC['smtp_settings']['return_path']
ActionMailer::Base.default_url_options[:protocol] = 'https' unless SITE_SPECIFIC['smtp_settings']['return_path'].include?('dev.')

# If the site.yml is set up to intercept mail, the MailInterceptor will be set up.
# Then it will intercept any mail that is not in the white list and send it to the specified email

class MailInterceptor
	def self.delivering_email(message)
		# We want all the emails to appear like they are coming from this address.
		message.from = SITE_SPECIFIC['smtp_settings']['from'] if message.from.blank?

		# Check to see if we want to intercept the email.
		return if SITE_SPECIFIC['mail_intercept']['deliver_email']

		# Intercept the email
		message.subject = "INTERCEPTED: #{message.to} #{message.subject}"
		message.to = SITE_SPECIFIC['mail_intercept']['email_list']
	end
end

ActionMailer::Base.register_interceptor(MailInterceptor)

