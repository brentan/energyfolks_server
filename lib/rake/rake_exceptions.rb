class ExceptionNotifier
  module RakePatch
    def self.included(klass)
      klass.class_eval do
        alias_method :display_error_message_without_notifications, :display_error_message
        alias_method :display_error_message, :display_error_message_with_notifications
      end
    end

    def display_error_message_with_notifications(ex)
      display_error_message_without_notifications(ex)
      ErrorMailer.rake_error(ex, reconstruct_command_line).deliver
    end

    def reconstruct_command_line
      "rake #{ARGV.join(' ')}"
    end
  end
end
Rake.application.instance_eval do
  class << self
    include ExceptionNotifier::RakePatch
  end
end