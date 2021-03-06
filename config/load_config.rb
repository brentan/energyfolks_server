# Load configuration files from our S3 bucket.  This is done so that passwords etc aren't stored in the public repo and
# can readily be retrieved when new EC2 isntances are spun up
require 'rubygems'
require 'aws-sdk-v1'

s3 = AWS::S3.new()

document = s3.buckets['energyfolks-uploads'].objects['google_cert.txt']

File.open("./config/google_cert.txt", "w") do |f|
  f.write(document.read)
end
document = s3.buckets['energyfolks-uploads'].objects['google_key.txt']

File.open("./config/google_key.txt", "w") do |f|
  f.write(document.read)
end
document = s3.buckets['energyfolks-uploads'].objects['google_privatekey.p12']

File.open("./config/google_privatekey.p12", "w") do |f|
  f.write(document.read)
end