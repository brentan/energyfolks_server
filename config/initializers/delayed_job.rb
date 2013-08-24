Delayed::Worker.max_attempts = 2
Delayed::Worker.delay_jobs = Rails.env.production?
Delayed::Worker.destroy_failed_jobs = false
