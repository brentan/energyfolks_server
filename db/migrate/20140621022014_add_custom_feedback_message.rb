class AddCustomFeedbackMessage < ActiveRecord::Migration
  def change
    add_column :affiliates, :custom_feedback_message, :text
  end
end
