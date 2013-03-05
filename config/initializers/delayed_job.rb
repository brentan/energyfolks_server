Delayed::Worker.max_attempts = 2
Delayed::Worker.delay_jobs = !(Rails.env.test? || SITE_SPECIFIC['skin']['title_prefix'].include?('DEV'))
Delayed::Worker.destroy_failed_jobs = false
