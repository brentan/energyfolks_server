class UpdateBulletinsInDatabase < ActiveRecord::Migration
  def up
    execute "UPDATE tags_entities SET entity_type='Discussion' WHERE entity_type='Bulletin'"
    execute "UPDATE highlights SET entity_type='Discussion' WHERE entity_type='Bulletin'"
    execute "UPDATE emails SET entity_type='Discussion' WHERE entity_type='Bulletin'"
  end

  def down
    execute "UPDATE tags_entities SET entity_type='Bulletin' WHERE entity_type='Discussion'"
    execute "UPDATE highlights SET entity_type='Bulletin' WHERE entity_type='Discussion'"
    execute "UPDATE emails SET entity_type='Bulletin' WHERE entity_type='Discussion'"
  end
end
