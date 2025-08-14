/**
 * Test script để kiểm tra Cloudinary service
 * Run: npx ts-node test-cloudinary.ts
 */
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryConnection() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test connection by getting account info
    const result = await cloudinary.api.usage();
    console.log('✅ Cloudinary connection successful!');
    console.log('Account usage info:', {
      credits: result.credits,
      storage: result.storage,
      bandwidth: result.bandwidth
    });
    
    // Test generating URLs (doesn't upload)
    const sampleUrl = cloudinary.url('sample', {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    });
    console.log('✅ Sample transformation URL:', sampleUrl);
    
    // Test video thumbnail generation
    const videoThumbnailUrl = cloudinary.url('sample', {
      resource_type: 'video',
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      format: 'jpg',
      start_offset: '1'
    });
    console.log('✅ Video thumbnail URL:', videoThumbnailUrl);
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
}

async function testUpload() {
  try {
    console.log('\\nTesting image upload...');
    
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const base64String = `data:image/png;base64,${testImageBuffer.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64String, {
      public_id: 'foodee/test/test-image',
      folder: 'foodee/test',
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    });
    
    console.log('✅ Upload successful!');
    console.log('Upload result:', {
      public_id: result.public_id,
      url: result.url,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    });
    
    // Cleanup - delete the test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✅ Test image cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Cloudinary Service Test\\n');
  
  // Check environment variables
  const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing environment variables:', missingEnvVars.join(', '));
    console.log('Please set these in your .env file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables found');
  
  // Run tests
  const connectionTest = await testCloudinaryConnection();
  if (!connectionTest) {
    process.exit(1);
  }
  
  const uploadTest = await testUpload();
  if (!uploadTest) {
    process.exit(1);
  }
  
  console.log('\\n🎉 All tests passed! Cloudinary is ready to use.');
}

main().catch(console.error);
