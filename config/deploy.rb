# ___THE COMMAND SYNTAX TO DEPLOY TO DIFFERENT ENVIRONMENTS___
#
# STAGING deployment (http://staging.energysociety.org):
# 1. Commit any outstanding files, then type:
# 2. $ cap staging
#
# PRODUCTION deployment (http://energysociety.org):
# 1. Merge development branch into master, then type:
# 2. $ cap production

require 'bundler/capistrano'
require 'delayed/recipes'
require 'whenever/capistrano'
require 'capify-ec2/capistrano'

default_run_options[:pty] = true  # Must be set for the password prompt from git to work
set :repository, "git@github.com:brentan/energyfolks_server.git"
set :scm, "git"
set :deploy_via, :remote_cache
set :domain, 'ec2-54-215-158-64.us-west-1.compute.amazonaws.com'

ec2_roles :name=>"web", :options => {:default=>true}
ec2_roles :name=>"app", :options => {:default=>true}
ec2_roles :name=>"db", :options => {:default=>true}

role :web, domain # Your HTTP server, Apache/etc
role :app, domain # This may be the same as your `Web` server
role :db, domain, :primary => true # This is where Rails migrations will run


set :application, "EnergyfolksServer"

set :deploy_to, "/var/app"

set :user, "ec2-user"
set :use_sudo, false

set :ssh_options, {:forward_agent => true, :keys => ['~/.ssh/brentan', '~/.ssh/id_rsa']}

set :normalize_asset_timestamps, false

set :rails_env, "production"

set :whenever_command, "bundle exec whenever"

set :branch, "ec2"



after "deploy", "deploy:migrate"

after "deploy:stop",    "delayed_job:stop"
after "deploy:start",   "delayed_job:start"
after "deploy:restart", "delayed_job:restart"

after "deploy:migrate", :setup_group
task :setup_group do
  run "sudo chgrp -R webapp #{deploy_to}/releases"#" && chmod -R g+s #{deploy_to}"
  run 'sudo /etc/init.d/passenger restart'
end

after "deploy:assets:symlink" do
  run "ln -nfs #{shared_path}/config/whenever-elasticbeanstalk.yml #{release_path}/config/whenever-elasticbeanstalk.yml"
  run "ln -nfs #{shared_path}/config/site.yml #{release_path}/config/site.yml"
end