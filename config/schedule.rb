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

every 1.minute do
  command "cd /var/app/current && bundle exec ensure_one_cron_leader"
end

every 1.day, :at => '2:00 am' do
  rake "clean_up:user_login_hash"
  rake "clean_up:sessions"
  rake "clean_up:tag_count"
  rake "clean_up:old_analytics"
end
every 1.day, :at => '1:00 am' do
  rake "nightly:wordpress"
end
every 1.day, :at => '3:00 am' do
  rake "nightly:google"
end
every 1.day, :at => '11:00 pm' do
  rake "nightly:archive"
end

every 1.day, :at => '6:00 am' do
  rake "digest:daily"
end
every :monday, :at => '6:00 am' do
  rake "digest:weekly"
end