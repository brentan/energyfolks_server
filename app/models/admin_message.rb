class AdminMessage < ActiveRecord::Base
  belongs_to :user
  default_scope order('created_at DESC')

  validates_presence_of :name, :html, :user_id

  attr_accessible :name, :html, :user_id

end