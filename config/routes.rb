EnergyfolksServer::Application.routes.draw do

  match "accounts/external_wordpress_login/:a/:b/:c" => 'energyfolks#temp_wordpress_fix'

  # USER ROUTES
  get "users/login"

  get "users/profile"
  put "users/update"
  get "users/new"
  post "users/create"
  get "users/delete"
  get "users/moderation"

  get "users/try_login"
  get "users/try_cookie"
  get "users/logout"
  get "users/activate"
  get "users/from_hash"
  get "users/verify"
  get "users/avatar"

  get "users/rights"
  put "users/rights"
  get "users/memberships"
  get "users/memberships_add"
  get "users/memberships_remove"
  get "users/manual_verify"
  get "users/freeze_account"
  get "users/digest"
  post "users/freeze_account"

  get "users/reset_password"
  post "users/reset_password"

  get "users/resend_email_change_verification"
  get "users/resend_activation"
  post "users/resend_activation"

  get "emails/edit"
  put "emails/update"
  get "emails/open"

  # Google Apps SAML SSO routes
  get '/google/saml/inbound', to: 'google#inbound'
  get '/google/saml/logout', to: 'google#logout'

  #Mailchimp list routes
  get 'mailchimp/inbound'
  get 'mailchimp/logout'
  get 'mailchimp/:affiliate_id/edit' => 'mailchimp#edit'
  put 'mailchimp/:affiliate_id/update' => 'mailchimp#update'

  # Omniauth routes
  get '/external_login', to: 'users#external_login'
  get '/auth/linkedin/callback', to: 'users#linkedin'

  # AFFILIATE ROUTES

  get "affiliates/new"
  get "affiliates/wordpress_details"
  match "affiliates/:id/edit" => 'affiliates#edit'
  match "affiliates/:id/delete" => 'affiliates#delete'
  put "affiliates/update"
  post "affiliates/create"
  get "affiliates/delete"
  match "affiliates" => 'affiliates#index'
  match "affiliates/:id/users" => 'affiliates#users'
  get "affiliates/rights"
  put "affiliates/rights"
  get "affiliates/reject_or_remove"
  post "affiliates/reject_or_remove"
  get "affiliates/approve"
  get "affiliates/logo"
  get "affiliates/dashboard"

  # Comment routes
  get "comments/new"
  post "comments/create"
  get "subcomments/new"
  post "subcomments/create"
  post "inbound_emails/inbound"

  # Wordpress routes
  post "blogs/AddWordpressPost"
  get "blogs/FreezeWordpressPost"
  get "blogs/DeleteWordpressPost"

  # ENTITY ROUTES
  resources :users, only: ['show']
  get "energyfolks/locate"
  begin
    ApplicationController::ENTITIES.each { |type|
      if type.new.entity_name != 'User'
        resources type, only: ['show']
        method = type.new.method_name
        get "#{method}/new"
        post "#{method}/create"
        match "#{method}/:id/edit" => "#{method}#edit"
        get "#{method}/edit"
        get "#{method}/restore"
        put "#{method}/update"
        get "#{method}/reject_or_remove"
        post "#{method}/reject_or_remove"
        get "#{method}/approve"
        get "#{method}/moderation"
        get "#{method}/force_resend"
        get "#{method}/email_open"
        get "#{method}/myposts"
        match "#{method}/:id" => "#{method}#show"
      end
    }
  rescue
  end


  # Make ajax routes visible
  match ':controller(/:action(/:id))(.:format)', controller: /ajax/

  match 'privacy' => 'users#privacy'
  match 'terms' => 'users#terms'

  # EF Specific (non-platform) page routes:
  root :to => 'energyfolks#index'
  match "jobs" => "jobs#index"
  match "admin" => "admins#index"
  match "users" => "affiliates#users"
  match "events" => "events#index"
  match "blogs" => "blogs#index"
  match "calendar" => "events#index"    #backwards compatible
  match "discussions" => "discussions#index"
  match "announce" => "discussions#index" #backwards compatible
  match "welcome/privacy" => "users#privacy"
  match "welcome/terms" => "users#terms"
  match "feedback/new" => "energyfolks#new"
  match "contact" => "energyfolks#contact"
  match "add_your_group" => "energyfolks#add_your_group"
  match ':controller(/:action(/:id))(.:format)', controller: /developers/ #expose developer routes
  match ':controller(/:action(/:id))(.:format)', controller: /admins/ #expose admin routes

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
