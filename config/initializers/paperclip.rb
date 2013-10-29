Paperclip::Attachment.default_options[:command_path] = SITE_SPECIFIC['paperclip']['image_magic_path']
Paperclip::Attachment.default_options[:swallow_stderr] = false


if Rails.env == 'production'
  ec2info = YAML.load_file("#{Rails.root}/config/ec2.yml")
  AWS.config(access_key_id: ec2info[:aws_access_key_id], secret_access_key: ec2info[:aws_secret_access_key], region: ec2info[:aws_params][:region])
end
