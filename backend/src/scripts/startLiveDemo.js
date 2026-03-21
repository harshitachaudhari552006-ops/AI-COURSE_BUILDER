import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Subject from '../models/Subject.js';

dotenv.config();

const startLiveClass = async () => {
  try {
    await connectDB();
    console.log('🔄 Finding a subject to go LIVE...');
    
    // Find any existing subject to mark as live
    const subject = await Subject.findOne();
    
    if (!subject) {
      console.error('❌ No subjects found. Please run seedData/seedNEP first.');
      process.exit(1);
    }

    subject.isMeetingLive = true;
    subject.meetingLink = 'https://meet.google.com/abc-defg-hij'; 
    await subject.save();

    console.log(`\n✅ ${subject.name} is now LIVE!`);
    console.log(`🔗 Meeting Link: ${subject.meetingLink}`);
    console.log('\n🌟 REFRESH YOUR BROWSER NOW! You should see the pulsing red button in the top right corner.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to start live class:', error);
    process.exit(1);
  }
};

startLiveClass();
