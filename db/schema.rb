# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130803161045) do

  create_table "affiliates", :force => true do |t|
    t.datetime "created_at",                               :null => false
    t.datetime "updated_at",                               :null => false
    t.string   "name"
    t.string   "short_name"
    t.string   "email_name"
    t.string   "url"
    t.string   "url_calendar"
    t.string   "url_jobs"
    t.string   "url_bulletins"
    t.string   "url_users"
    t.string   "url_blog"
    t.string   "email"
    t.boolean  "live",               :default => false
    t.integer  "open",               :default => 1
    t.boolean  "visible",            :default => true
    t.string   "color",              :default => "777777"
    t.text     "email_header"
    t.text     "web_header"
    t.string   "location"
    t.float    "latitude"
    t.float    "longitude"
    t.integer  "moderate_bulletins", :default => 2
    t.integer  "moderate_jobs",      :default => 2
    t.integer  "moderate_calendar",  :default => 2
    t.string   "shared_secret"
    t.string   "cpanel_user"
    t.string   "cpanel_password"
    t.boolean  "send_digest",        :default => true
    t.integer  "radius",             :default => 50
    t.string   "logo_file_name"
    t.string   "logo_content_type"
    t.integer  "logo_file_size"
    t.datetime "logo_updated_at"
    t.boolean  "weekly",             :default => true
    t.boolean  "daily",              :default => false
    t.boolean  "events",             :default => false
    t.boolean  "jobs",               :default => false
    t.boolean  "bulletins",          :default => false
    t.integer  "event_radius",       :default => 50
    t.integer  "job_radius",         :default => 0
  end

  create_table "affiliates_jobs", :force => true do |t|
    t.integer "job_id"
    t.integer "affiliate_id"
    t.integer "approved_version", :default => 0
    t.integer "admin_version",    :default => 0
    t.boolean "broadcast",        :default => false
    t.boolean "user_broadcast",   :default => false
  end

  add_index "affiliates_jobs", ["job_id"], :name => "index_affiliates_jobs_on_job_id"

  create_table "delayed_jobs", :force => true do |t|
    t.integer  "priority",   :default => 0
    t.integer  "attempts",   :default => 0
    t.text     "handler"
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at",                :null => false
    t.datetime "updated_at",                :null => false
  end

  add_index "delayed_jobs", ["priority", "run_at"], :name => "delayed_jobs_priority"

  create_table "emails", :force => true do |t|
    t.datetime "created_at",                     :null => false
    t.datetime "updated_at",                     :null => false
    t.integer  "entity_id"
    t.string   "entity_type"
    t.integer  "user_id"
    t.boolean  "opened",      :default => false
    t.datetime "open_date"
  end

  add_index "emails", ["entity_id"], :name => "index_emails_on_entity_id"
  add_index "emails", ["entity_type"], :name => "index_emails_on_entity_type"
  add_index "emails", ["user_id"], :name => "index_emails_on_user_id"

  create_table "jobs", :force => true do |t|
    t.datetime "created_at",                       :null => false
    t.datetime "updated_at",                       :null => false
    t.date     "expire"
    t.string   "location"
    t.float    "latitude"
    t.float    "longitude"
    t.integer  "user_id"
    t.integer  "affiliate_id"
    t.integer  "current_version",   :default => 0
    t.string   "name"
    t.string   "employer"
    t.text     "html"
    t.text     "how_to_apply"
    t.integer  "job_type"
    t.string   "logo_file_name"
    t.string   "logo_content_type"
    t.integer  "logo_file_size"
    t.datetime "logo_updated_at"
  end

  create_table "jobs_versions", :force => true do |t|
    t.datetime "created_at",        :null => false
    t.datetime "updated_at",        :null => false
    t.integer  "entity_id"
    t.integer  "version_number"
    t.string   "name"
    t.string   "employer"
    t.text     "html"
    t.text     "how_to_apply"
    t.integer  "job_type"
    t.string   "logo_file_name"
    t.string   "logo_content_type"
    t.integer  "logo_file_size"
    t.datetime "logo_updated_at"
  end

  add_index "jobs_versions", ["entity_id"], :name => "index_jobs_versions_on_entity_id"
  add_index "jobs_versions", ["version_number"], :name => "index_jobs_versions_on_version_number"

  create_table "memberships", :force => true do |t|
    t.datetime "created_at",                           :null => false
    t.datetime "updated_at",                           :null => false
    t.integer  "user_id"
    t.integer  "affiliate_id"
    t.boolean  "approved",          :default => false
    t.integer  "admin_level",       :default => 0
    t.boolean  "moderation_emails", :default => false
    t.string   "reason"
    t.boolean  "broadcast",         :default => false
  end

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "subscriptions", :force => true do |t|
    t.integer "user_id"
    t.boolean "weekly",       :default => true
    t.boolean "daily",        :default => false
    t.boolean "events",       :default => false
    t.boolean "jobs",         :default => false
    t.boolean "bulletins",    :default => false
    t.integer "event_radius", :default => 50
    t.integer "job_radius",   :default => 0
  end

  add_index "subscriptions", ["user_id"], :name => "index_subscriptions_on_user_id"

  create_table "user_login_hashes", :force => true do |t|
    t.integer  "user_id"
    t.string   "login_hash"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "user_login_hashes", ["login_hash"], :name => "index_user_login_hashes_on_login_hash"

  create_table "users", :force => true do |t|
    t.datetime "created_at",                                                    :null => false
    t.datetime "updated_at",                                                    :null => false
    t.string   "email"
    t.string   "encrypted_password"
    t.string   "encrypted_cookie"
    t.string   "first_name"
    t.string   "last_name"
    t.boolean  "verified",            :default => false
    t.string   "password_reset",      :default => "0"
    t.datetime "last_login"
    t.integer  "visibility",          :default => 1
    t.string   "timezone",            :default => "Pacific Time (US & Canada)"
    t.string   "avatar_file_name"
    t.string   "avatar_content_type"
    t.integer  "avatar_file_size"
    t.datetime "avatar_updated_at"
    t.string   "location"
    t.string   "email_to_verify"
    t.string   "position"
    t.string   "organization"
    t.text     "bio"
    t.text     "interests"
    t.text     "expertise"
    t.integer  "resume_visibility",   :default => 1
    t.string   "resume_file_name"
    t.string   "resume_content_type"
    t.integer  "resume_file_size"
    t.datetime "resume_updated_at"
    t.float    "latitude"
    t.float    "longitude"
    t.integer  "radius",              :default => 100
    t.boolean  "admin",               :default => false
    t.boolean  "active",              :default => true
    t.boolean  "admin_emails",        :default => false
  end

  add_index "users", ["email"], :name => "index_users_on_email"

end
