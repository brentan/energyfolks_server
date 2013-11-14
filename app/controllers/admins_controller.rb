class AdminsController < ApplicationController

  before_filter :check_for_admin_rights

  def index

  end

  def resynchronize_cloudsearch
    ApplicationController::ENTITIES.each do |e|
      e.reindex_all
    end
    redirect_to '/admins/index?iframe_next=1', notice: "Synchronization complete"
  end

  private
  def check_for_admin_rights
    return redirect_to '/' unless current_user.present?
    return redirect_to '/' unless current_user.admin?
  end
end