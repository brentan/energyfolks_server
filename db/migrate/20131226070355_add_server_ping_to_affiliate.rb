class AddServerPingToAffiliate < ActiveRecord::Migration
  def change
    add_column :affiliates, :wordpress_server_ping, :datetime
  end
end
