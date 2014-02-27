class AdminMessagesController < ApplicationController

  before_filter :check_for_admin_rights

  def new
    @item = AdminMessage.new
  end

  def create
    params[:admin_message][:user_id] = current_user.id
    @item = AdminMessage.new(params[:admin_message])
    if @item.save
      admins = User.verified.where(admin: true).all.map{ |u| [u.id, 0] }
      admins += Membership.where("approved = 1").where("admin_level >= ?", Membership::EDITOR).all.map{ |u| [u.user_id, u.affiliate_id] }
      admins = admins.uniq
      admins.each do |a|
        NotificationMailer.delay(:run_at => 15.minutes.from_now).admin_message(a[0], a[1], @item.id)
      end
      redirect_to '/admins/messages?iframe_next=1', :notice => 'Item Created'
    else
      params[:alert] = 'There was an error'
      render :action => :new
    end
  end

  def update
    @item = AdminMessage.find(params[:id])
    if @item.update_attributes(params[:admin_message])
      redirect_to '/admins/messages?iframe_next=1', :notice => 'Item Updated'
    else
      params[:alert] = 'There was an error'
      render :action => :edit
    end
  end

  def edit
    @item = AdminMessage.find(params[:id])
  end

  def delete
    @item = AdminMessage.find(params[:id])
    @item.destroy
    redirect_to '/admins/messages?iframe_next=1', :notice => 'Item Deleted'
  end


  private
  def check_for_admin_rights
    return redirect_to '/' unless current_user.present?
    return redirect_to '/' unless current_user.admin?
  end
end