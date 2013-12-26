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

  def wordpress_versions
    @items = Affiliate.where("shared_secret IS NOT NULL").order(:name).all
    @not_on = Affiliate.where("shared_secret IS NULL").order(:name).all
    ef_data = YAML::load(File.open("#{Rails.root}/public/wordpress/wordpress.yml"))
    @current_version = ef_data['version']
    @js_hash = Rails.application.assets.find_asset('energyfolks.js').digest_path.split('-')[1].split('.')[0]
    @css_hash = Rails.application.assets.find_asset('energyfolks.css').digest_path.split('-')[1].split('.')[0]
  end

  private
  def check_for_admin_rights
    return redirect_to '/' unless current_user.present?
    return redirect_to '/' unless current_user.admin?
  end
end