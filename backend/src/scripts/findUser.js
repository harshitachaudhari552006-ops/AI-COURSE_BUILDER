import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

dotenv.config();

const findUser = async () => {
  try {
    await connectDB();
    
    const teachers = await Teacher.find();
    teachers.forEach(t => console.log(`TEACHER_ID:${t._id}`));
    
    const students = await Student.find();
    students.forEach(s => console.log(`STUDENT_ID:${s._id}`));
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

findUser();
