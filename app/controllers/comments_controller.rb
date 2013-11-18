class CommentsController < ApplicationController

  def new
    @item = Comment.new()
  end

  def create
    return redirect_to '/' unless current_user.present?
    @item = Comment.new(params[:comment])
    @item.user_id = current_user.id
    @item.user_name = "#{current_user.first_name} #{current_user.last_name}"
    return render :action => "new" if !@item.save
    @item.subscribe(current_user) if params[:subscribe] == '1'
    @item.broadcast(current_user).delay(:run_at => 5.minutes.from_now)
  end

end