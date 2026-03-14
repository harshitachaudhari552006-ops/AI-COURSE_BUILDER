import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Module from '../models/Module.js';

dotenv.config();

const verifyModules = async () => {
  try {
    await connectDB();

    for (let i = 3; i <= 6; i++) {
        const sem = await Semester.findOne({ number: i });
        if (!sem) {
            continue;
        }
        
        const subjects = await Subject.find({ semester: sem._id });
        console.log(`\nSemester ${i}:`);
        for (const subject of subjects) {
            const modulesCount = await Module.countDocuments({ subject: subject._id });
            console.log(` - ${subject.code}: ${modulesCount} Modules`);
        }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying modules:', error);
    process.exit(1);
  }
};

verifyModules();
