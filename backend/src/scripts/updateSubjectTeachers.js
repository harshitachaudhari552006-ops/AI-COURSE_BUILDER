import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';

dotenv.config();

const teacherMappings = {
  // Sem 3
  'CG': 'Prof. Gayatri Dharap',
  'DLCA': 'Prof. Neha Mahajan',
  'DS': 'Prof. Dikasha Bombe',
  'DSGT': 'Prof. Pintu Sharma',
  'EM3': 'Prof. Santoshi Iyengar',
  
  // Sem 4
  'AOA': 'Dr. Gauri Deshpande',
  'DBMS': 'Prof. Neha Mahajan',
  'EM4': 'Prof. Santoshi Iyengar',
  'MP': 'Prof. Sarita Kale',
  'OS': 'Prof. Jayshree Bankar',
  
  // Sem 5
  'AI': 'Prof. Gayatri Dharap',
  'CN': 'Prof. Sarita Kale',
  'DWM': 'Prof. Vandana Sharma',
  'SAIDS': 'Prof. Nisha',
  'WC': 'Prof. Sejal Jadhav',
  
  // Sem 6
  'CSS': 'Prof. Pintu Sharma',
  'DAV': 'Prof. Vandana Sharma',
  'DC': 'Dr. Gauri Deshpande',
  'ML': 'Prof. Gayatri Dharap',
  'SEPM': 'Prof. Neha Mahajan'
};

const updateSubjectTeachers = async () => {
  try {
    await connectDB();

    for (const [subjectCode, teacherName] of Object.entries(teacherMappings)) {
      // Find or create the teacher
      let teacher = await Teacher.findOne({ name: teacherName });
      if (!teacher) {
        // Create an ID and email based on the name
        const baseEmail = teacherName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/^\.+|\.+$/g, '');
        const teacherId = `T_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        teacher = await Teacher.create({
          teacherId,
          name: teacherName,
          email: `${baseEmail}@college.edu`,
          department: 'Computer Engineering' // default
        });
        console.log(`Created new teacher: ${teacher.name}`);
      }

      // Update the subject
      const subject = await Subject.findOne({ code: subjectCode });
      if (subject) {
        subject.teacher = teacher._id;
        await subject.save();
        console.log(`Updated subject ${subjectCode} to teacher ${teacher.name}`);
      } else {
        console.log(`Warning: Subject ${subjectCode} not found in DB`);
      }
    }

    console.log('✅ Successfully updated teacher assignments!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating teachers:', error);
    process.exit(1);
  }
};

updateSubjectTeachers();
