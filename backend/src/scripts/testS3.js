import { listS3Objects } from '../services/s3Service.js';
import { config } from 'dotenv';
import path from 'path';

// Load .env from backend root
config({ path: path.resolve(process.cwd(), '.env') });

async function testConnection() {
  console.log('🔍 Testing AWS S3 Connection...');
  console.log('Bucket Name:', process.env.AWS_BUCKET_NAME);
  console.log('Region:', process.env.AWS_REGION);

  try {
    const objects = await listS3Objects();
    console.log('✅ Connection Successful!');
    console.log(`📂 Found ${objects.length} total objects in bucket.`);
    
    objects.forEach(obj => {
      console.log(` - ${obj.Key} (${(obj.Size / 1024).toFixed(2)} KB)`);
    });
  } catch (error) {
    console.error('❌ Connection Failed!');
    console.error('Error details:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('Hint: Check your network connection or AWS Region.');
    } else if (error.name === 'SignatureDoesNotMatch' || error.name === 'InvalidAccessKeyId') {
      console.error('Hint: Check your AWS Access Key and Secret Key.');
    } else if (error.name === 'NoSuchBucket') {
      console.error('Hint: Check your AWS Bucket Name.');
    }
  }
}

testConnection();
