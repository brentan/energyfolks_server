# ___THE COMMAND SYNTAX TO DEPLOY TO DIFFERENT ENVIRONMENTS___
#
# cap deploy should work
# if error on github checkout, run ssh-add locally first.

require 'bundler/capistrano'
require "delayed/recipes"
require "whenever/capistrano"

default_run_options[:pty] = true  # Must be set for the password prompt from git to work
set :repository, "git@github.com:brentan/energyfolks_server.git"
set :scm, "git"
set :deploy_via, :remote_cache
set :application, "EnergyfolksServer"
set :ssh_options, {:forward_agent => true}
set :use_sudo, false
set :user, 'ec2-user'
ssh_options[:keys] = ["~/.ssh/id_rsa", "~/.ssh/brentan.pem"]

set :branch, "master"

set :deploy_to, "/home/#{user}/#{application}"
set :normalize_asset_timestamps, false

set :location, "ec2-54-215-175-10.us-west-1.compute.amazonaws.com"
role :app, location
role :web, location
role :db,  location, :primary => true


set :rails_env, "production"

set :whenever_command, "bundle exec whenever"

after "deploy", "deploy:migrate"

after "deploy:stop",    "delayed_job:stop"
after "deploy:start",   "delayed_job:start"
after "deploy:restart", "delayed_job:restart"
