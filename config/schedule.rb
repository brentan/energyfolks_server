# Use this file to easily define all of your cron jobs.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Example:
#
# set :output, "/path/to/my/cron_log.log"
#
# every 2.hours do
#   command "/usr/bin/some_great_command"
#   runner "MyModel.some_method"
#   rake "some:great:rake:task"
# end
#
# every 4.days do
#   runner "AnotherModel.prune_old_records"
# end

# Learn more: http://github.com/javan/whenever

# NOTE SERVER TIME IS UTC!  THAT IS 8/9 HOURS FROM PST/PDT

every 1.minute do
  command "cd /var/app/current && bundle exec ensure_one_cron_leader"
end

every 1.day, :at => '10:00 am' do
  rake "clean_up:user_login_hash"
end
every 1.day, :at => '10:05 am' do
  rake "clean_up:sessions"
end
every 1.day, :at => '10:10 am' do
  rake "clean_up:tag_count"
end
every 1.day, :at => '10:15 am' do
  rake "clean_up:old_analytics"
end
every 1.day, :at => '10:20 am' do
  rake "clean_up:scheduled_operations"
end
every 1.day, :at => '9:00 am' do
  rake "nightly:wordpress"
end
every 1.day, :at => '11:00 am' do
  rake "nightly:google"
end
every 1.day, :at => '11:20 am' do
  rake "nightly:mailchimp"
end
every 1.day, :at => '11:40 am' do
  rake "nightly:salesforce"
end
every 1.day, :at => '7:00 pm' do
  rake "nightly:archive"
end
every 1.day, :at => '7:20 pm' do
  rake "nightly:autoimport"
end

every 1.hour do
  rake "digest:daily"
end
every 1.hour do
  rake "digest:weekly"
end
every 2.hours do
  rake "clean_up:fix_bad_submissions"
end
every 6.hours do
  rake "clean_up:delayed_job_test"
end
every 1.day, :at => '2:00 am' do
  rake "nightly:stats"
end

every 1.hour do
  rake "jobs:work"
end

every 10.hours do
 command "cd $EB_CONFIG_APP_CURRENT && RAILS_ENV=production script/delayed_job --pid-dir=$EB_CONFIG_APP_SUPPORT/pids restart"
end