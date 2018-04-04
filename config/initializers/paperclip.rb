Paperclip::Attachment.default_options[:command_path] = SITE_SPECIFIC['paperclip']['image_magic_path']
Paperclip::Attachment.default_options[:swallow_stderr] = false


if Rails.env == 'production'
  AWS.config(access_key_id: ENV['EC2_KEY'], secret_access_key: ENV['EC2_CODE'], region: 'us-west-1')
end
