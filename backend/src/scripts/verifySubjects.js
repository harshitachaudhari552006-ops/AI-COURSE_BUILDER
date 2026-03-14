import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';

dotenv.config();

const verifySubjects = async () => {
  try {
    await connectDB();

    for (let i = 3; i <= 6; i++) {
        const sem = await Semester.findOne({ number: i });
        if (!sem) {
            console.log(`Semester ${i} not found!`);
            continue;
        }
        const subjects = await Subject.find({ semester: sem._id });
        console.log(`\nSemester ${i} Subjects (${subjects.length}):`);
        subjects.forEach(sub => {
            console.log(` - ${sub.code}: ${sub.name}`);
        });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying subjects:', error);
    process.exit(1);
  }
};

verifySubjects();
