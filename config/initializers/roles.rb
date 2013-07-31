if Rails.env == 'production'
  SITE_HOST = SITE_SPECIFIC['urls']['production']
else
  SITE_HOST = SITE_SPECIFIC['urls']['local']
end