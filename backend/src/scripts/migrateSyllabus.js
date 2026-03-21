import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Semester from '../models/Semester.js';

dotenv.config();

const migrateSemesters = async () => {
  try {
    await connectDB();
    console.log('🔄 Starting migration for syllabus types...');
    
    // Update all semesters to '2019-C'
    const result = await Semester.updateMany(
      {},
      { $set: { syllabusType: '2019-C' } }
    );
    
    console.log(`✅ Migration complete. Updated ${result.modifiedCount} semesters.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateSemesters();
