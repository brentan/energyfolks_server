class LastBulletinToDiscussion < ActiveRecord::Migration
  def change
    rename_column :affiliates, :moderate_bulletins, :moderate_discussions
  end
end
