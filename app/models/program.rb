class Program < ActiveRecord::Base

  attr_accessible :affiliate_id, :name

  belongs_to :affiliate

end