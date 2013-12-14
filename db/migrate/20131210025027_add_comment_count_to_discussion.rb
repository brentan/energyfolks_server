class AddCommentCountToDiscussion < ActiveRecord::Migration
  def change
    add_column :discussions, :last_comment_at, :datetime
    add_column :discussions, :total_comments, :integer, :default => 0
  end
end
