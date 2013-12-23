class CommentEmailHash < ActiveRecord::Base
  before_create :generate_hash

  def self.get_hash(comment_string)
    hash = self.find_or_create_by_comment_hash(comment_string)
    hash.unique_hash
  end
  def self.check_hash(unique_hash)
    hash = self.where(unique_hash: unique_hash).first
    hash.present? ? hash.comment_hash : ''
  end

  private
  def generate_hash
    self.unique_hash = SecureRandom.urlsafe_base64
  end
end