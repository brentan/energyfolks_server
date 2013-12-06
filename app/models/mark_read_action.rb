class MarkReadAction < ActiveRecord::Base
  belongs_to :mark_read
  belongs_to :affiliate

  attr_accessible :mark_read_id, :affiliate_id, :ip
end
