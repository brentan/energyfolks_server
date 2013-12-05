# Load configuration files from our S3 bucket.  This is done so that passwords etc aren't stored in the public repo and
# can readily be retrieved when new EC2 isntances are spun up
require 'rubygems'
require 'aws-sdk'

s3 = AWS::S3.new()

document = s3.buckets['energyfolks-uploads'].objects['site.yml']

File.open("site.yml", "w") do |f|
  f.write(document.read)
end
document = s3.buckets['energyfolks-uploads'].objects['database.yml']

File.open("database.yml", "w") do |f|
  f.write(document.read)
end
document = s3.buckets['energyfolks-uploads'].objects['whenever-elasticbeanstalk.yml']

File.open("whenever-elasticbeanstalk.yml", "w") do |f|
  f.write(document.read)
end
document = s3.buckets['energyfolks-uploads'].objects['ec2.yml']

File.open("ec2.yml", "w") do |f|
  f.write(document.read)
end
document = s3.buckets['energyfolks-uploads'].objects['omniauth.rb']

File.open("omniauth.rb", "w") do |f|
  f.write(document.read)
end