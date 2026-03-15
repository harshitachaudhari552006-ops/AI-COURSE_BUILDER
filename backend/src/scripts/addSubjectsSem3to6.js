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

    const getTeacherId = async (name) => {
        let teacher = await Teacher.findOne({ name });
        if (!teacher) {
            const baseEmail = name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/^\.+|\.+$/g, '');
            const teacherId = `T_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            teacher = await Teacher.create({
              teacherId,
              name,
              email: `${baseEmail}@college.edu`,
              department: 'Computer Engineering'
            });
            console.log(`Created new teacher: ${name}`);
        }
        return teacher._id;
    };

    // Prepare all teachers First
    const T_GAYATRI = await getTeacherId('Prof. Gayatri Dharap');
    const T_NEHA = await getTeacherId('Prof. Neha Mahajan');
    const T_DIKASHA = await getTeacherId('Prof. Dikasha Bombe');
    const T_PINTU = await getTeacherId('Prof. Pintu Sharma');
    const T_SANTOSHI = await getTeacherId('Prof. Santoshi Iyengar');
    const T_GAURI = await getTeacherId('Dr. Gauri Deshpande');
    const T_SARITA = await getTeacherId('Prof. Sarita Kale');
    const T_JAYSHREE = await getTeacherId('Prof. Jayshree Bankar');
    const T_VANDANA = await getTeacherId('Prof. Vandana Sharma');
    const T_NISHA = await getTeacherId('Prof. Nisha');
    const T_SEJAL = await getTeacherId('Prof. Sejal Jadhav');

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
      { code: 'EM3', name: 'Engineering Mathematics-III', semester: sem3._id, department: 'Computer Engineering', teacher: T_SANTOSHI, credits: 4 },
      { code: 'CG', name: 'Computer Graphics', semester: sem3._id, department: 'Computer Engineering', teacher: T_GAYATRI, credits: 4 },
      { code: 'DS', name: 'Data Structures', semester: sem3._id, department: 'Computer Engineering', teacher: T_DIKASHA, credits: 4 },
      { code: 'DSGT', name: 'Discrete Structures and Graph Theory', semester: sem3._id, department: 'Computer Engineering', teacher: T_PINTU, credits: 3 },
      { code: 'DLCA', name: 'Digital Logic and Computer Architecture', semester: sem3._id, department: 'Computer Engineering', teacher: T_NEHA, credits: 4 },

      // Sem 4: EM-4, AOA, DBMS, MP, os
      { code: 'EM4', name: 'Engineering Mathematics-IV', semester: sem4._id, department: 'Computer Engineering', teacher: T_SANTOSHI, credits: 4 },
      { code: 'AOA', name: 'Analysis of Algorithm', semester: sem4._id, department: 'Computer Engineering', teacher: T_GAURI, credits: 4 },
      { code: 'DBMS', name: 'Database Management System', semester: sem4._id, department: 'Computer Engineering', teacher: T_NEHA, credits: 4 },
      { code: 'MP', name: 'Microprocessor', semester: sem4._id, department: 'Computer Engineering', teacher: T_SARITA, credits: 3 },
      { code: 'OS', name: 'Operating System', semester: sem4._id, department: 'Computer Engineering', teacher: T_JAYSHREE, credits: 4 },

      // Sem 5: CN, WC, DWM, AI, SAIDs
      { code: 'CN', name: 'Computer Network', semester: sem5._id, department: 'Computer Engineering', teacher: T_SARITA, credits: 4 },
      { code: 'WC', name: 'Web Computing', semester: sem5._id, department: 'Computer Engineering', teacher: T_SEJAL, credits: 4 },
      { code: 'DWM', name: 'Data Warehousing and Mining', semester: sem5._id, department: 'Computer Engineering', teacher: T_VANDANA, credits: 4 },
      { code: 'AI', name: 'Artificial Intelligence', semester: sem5._id, department: 'Computer Engineering', teacher: T_GAYATRI, credits: 4 },
      { code: 'SAIDS', name: 'Software Architecture and Design Patterns', semester: sem5._id, department: 'Computer Engineering', teacher: T_NISHA, credits: 3 },

      // Sem 6: DAV, DC, CSS, SEPM, ML
      { code: 'DAV', name: 'Data Visualization and Analytics', semester: sem6._id, department: 'Computer Engineering', teacher: T_VANDANA, credits: 4 },
      { code: 'DC', name: 'Distributed Computing', semester: sem6._id, department: 'Computer Engineering', teacher: T_GAURI, credits: 4 },
      { code: 'CSS', name: 'Cryptography and System Security', semester: sem6._id, department: 'Computer Engineering', teacher: T_PINTU, credits: 4 },
      { code: 'SEPM', name: 'Software Engineering and Project Management', semester: sem6._id, department: 'Computer Engineering', teacher: T_NEHA, credits: 4 },
      { code: 'ML', name: 'Machine Learning', semester: sem6._id, department: 'Computer Engineering', teacher: T_GAYATRI, credits: 4 },
    ];

    for (const sub of subjectsToAdd) {
      // Find existing by code to update if necessary!
      const existing = await Subject.findOne({ code: sub.code });
      if (!existing) {
        await Subject.create(sub);
        console.log(`Added Subject: ${sub.code} - ${sub.name}`);
      } else {
        // Let's also enforce updating the teacher if it already existed
        existing.teacher = sub.teacher;                 
        await existing.save();
        console.log(`Updated Teacher for subject: ${sub.code}`);
      }
    }

    console.log('\n✅ Successfully added/updated subjects for Sem 3 to 6!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding subjects:', error);
    process.exit(1);
  }
};

addSubjects();
