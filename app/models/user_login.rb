class UserLogin < ActiveRecord::Base
  belongs_to :user
  belongs_to :affiliate

  attr_accessible :user_id, :affiliate_id, :ip

end
