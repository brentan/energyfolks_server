EnergyfolksServer::Application.routes.draw do

  # TODO: CLEAN UP THESE ROUTES AND MAKE THEM BETTER!
  get "users/login"

  get "users/profile"
  put "users/update"
  get "users/new"
  post "users/create"
  get "users/delete"

  get "users/try_login"
  get "users/try_cookie"
  get "users/logout"
  get "users/activate"
  get "users/from_hash"
  get "users/verify"

  get "users/reset_password"
  post "users/reset_password"

  get "users/resend_email_change_verification"
  get "users/resend_activation"
  post "users/resend_activation"

  # Make ajax routes visible
  match ':controller(/:action(/:id))(.:format)', controller: /ajax/

  match 'privacy' => 'users#privacy'
  match 'terms' => 'users#terms'

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
