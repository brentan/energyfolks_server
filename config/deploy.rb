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
require "delayed/recipes"
require "whenever/capistrano"

default_run_options[:pty] = true  # Must be set for the password prompt from git to work
set :repository, "git@github.com:brentan/energyfolks_server.git"
set :scm, "git"
set :deploy_via, :remote_cache
set :domain, 'ec2-54-215-158-64.us-west-1.compute.amazonaws.com'


role :web, domain # Your HTTP server, Apache/etc
role :app, domain # This may be the same as your `Web` server
role :db, domain, :primary => true # This is where Rails migrations will run


set :application, "EnergyfolksServer"

set :deploy_to, "/var/app"

set :user, "ec2-user"
set :use_sudo, true

set :ssh_options, {:forward_agent => true, :keys => ['~/.ssh/brentan', '~/.ssh/id_rsa']}

set :normalize_asset_timestamps, false

set :rails_env, "production"

set :whenever_command, "bundle exec whenever"

set :branch, "ec2"



after "deploy", "deploy:migrate"

after "deploy:stop",    "delayed_job:stop"
after "deploy:start",   "delayed_job:start"
after "deploy:restart", "delayed_job:restart"
