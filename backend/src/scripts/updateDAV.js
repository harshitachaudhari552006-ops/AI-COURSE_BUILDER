import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Subject from '../models/Subject.js';

dotenv.config();

const updateSubject = async () => {
  try {
    await connectDB();
    const result = await Subject.updateOne(
      { code: 'DVA' },
      { $set: { code: 'DAV' } }
    );
    console.log('Update result:', result);
    console.log('Successfully updated subject code from DVA to DAV');
    process.exit(0);
  } catch (error) {
    console.error('Error updating subject:', error);
    process.exit(1);
  }
};

updateSubject();
