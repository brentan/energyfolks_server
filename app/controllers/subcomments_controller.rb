class SubcommentsController < ApplicationController

  def new
    @item = Subcomment.new()
  end

  def create
    return redirect_to '/' unless current_user.present?
    @item = Subcomment.new(params[:subcomment])
    @item.user_id = current_user.id
    @item.user_name = "#{current_user.first_name} #{current_user.last_name}"
    @item.comment_id = params[:comment_id]
    return render :action => "new" if !@item.save
  end

  def delete

  end

end