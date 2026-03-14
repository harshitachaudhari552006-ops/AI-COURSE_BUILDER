import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Material from '../models/Material.js';

dotenv.config();

const countS3 = async () => {
  try {
    await connectDB();
    const count = await Material.countDocuments({ storageType: 'S3' });
    console.log(`TOTAL_S3_MATERIALS:${count}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

countS3();
