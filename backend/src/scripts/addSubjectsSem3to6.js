import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';

dotenv.config();

const addSubjects = async () => {
  try {
    await connectDB();

    const teachers = await Teacher.find({});
    if (teachers.length === 0) {
      console.error('No teachers found. Please run seedData.js first.');
      process.exit(1);
    }
    const teacherId = teachers[0]._id; // Just assign to the first teacher for now

    const getSemester = async (num) => {
        let sem = await Semester.findOne({ number: num });
        if (!sem) {
            sem = await Semester.create({
                number: num,
                name: `Semester ${num}`,
                isActive: true,
            });
            console.log(`Created Semester ${num}`);
        }
        return sem;
    }

    const sem3 = await getSemester(3);
    const sem4 = await getSemester(4);
    const sem5 = await getSemester(5);
    const sem6 = await getSemester(6);

    const subjectsToAdd = [
      // Sem 3: EM-3, CG, DS, DSGT, DLCA
      { code: 'EM3', name: 'Engineering Mathematics-III', semester: sem3._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'CG', name: 'Computer Graphics', semester: sem3._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'DS', name: 'Data Structures', semester: sem3._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'DSGT', name: 'Discrete Structures and Graph Theory', semester: sem3._id, department: 'Computer Engineering', teacher: teacherId, credits: 3 },
      { code: 'DLCA', name: 'Digital Logic and Computer Architecture', semester: sem3._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },

      // Sem 4: EM-4, AOA, DBMS, MP, os
      { code: 'EM4', name: 'Engineering Mathematics-IV', semester: sem4._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'AOA', name: 'Analysis of Algorithm', semester: sem4._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'DBMS', name: 'Database Management System', semester: sem4._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'MP', name: 'Microprocessor', semester: sem4._id, department: 'Computer Engineering', teacher: teacherId, credits: 3 },
      { code: 'OS', name: 'Operating System', semester: sem4._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },

      // Sem 5: CN, WC, DWM, AI, SAIDs
      { code: 'CN', name: 'Computer Network', semester: sem5._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'WC', name: 'Web Computing', semester: sem5._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'DWM', name: 'Data Warehousing and Mining', semester: sem5._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'AI', name: 'Artificial Intelligence', semester: sem5._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'SAIDS', name: 'Software Architecture and Design Patterns', semester: sem5._id, department: 'Computer Engineering', teacher: teacherId, credits: 3 }, // Assuming SAIDs is SA&DP or similar

      // Sem 6: DVA, DC, CSS, SEPM, ML
      { code: 'DVA', name: 'Data Visualization and Analytics', semester: sem6._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'DC', name: 'Distributed Computing', semester: sem6._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'CSS', name: 'Cryptography and System Security', semester: sem6._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'SEPM', name: 'Software Engineering and Project Management', semester: sem6._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
      { code: 'ML', name: 'Machine Learning', semester: sem6._id, department: 'Computer Engineering', teacher: teacherId, credits: 4 },
    ];

    for (const sub of subjectsToAdd) {
      // Check if subject already exists to avoid duplicates
      const existing = await Subject.findOne({ code: sub.code });
      if (!existing) {
        await Subject.create(sub);
        console.log(`Added Subject: ${sub.code} - ${sub.name}`);
      } else {
        console.log(`Subject already exists: ${sub.code}`);
      }
    }

    console.log('\n✅ Successfully added subjects for Sem 3 to 6!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding subjects:', error);
    process.exit(1);
  }
};

addSubjects();
