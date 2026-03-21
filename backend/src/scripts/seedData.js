import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Module from '../models/Module.js';
import Teacher from '../models/Teacher.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Semester.deleteMany({});
    // await Subject.deleteMany({});
    // await Module.deleteMany({});
    // await Teacher.deleteMany({});

    // Create Teachers
    const teachers = await Teacher.insertMany([
      {
        teacherId: 'T001',
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@college.edu',
        department: 'Computer Engineering',
      },
      {
        teacherId: 'T002',
        name: 'Prof. Priya Sharma',
        email: 'priya.sharma@college.edu',
        department: 'Electronics Engineering',
      },
      {
        teacherId: 'T003',
        name: 'Dr. Amit Patel',
        email: 'amit.patel@college.edu',
        department: 'Mechanical Engineering',
      },
    ]);

    console.log('✅ Teachers created');

    // Create Semesters for both Syllabus Types
    const syllabusTypes = ['2019-C', 'NEP 2020'];
    const semesters = [];

    for (const syllabus of syllabusTypes) {
      for (let i = 1; i <= 8; i++) {
        const semester = await Semester.create({
          number: i,
          syllabusType: syllabus,
          name: `${syllabus} - Semester ${i}`,
          isActive: true,
        });
        semesters.push(semester);
      }
    }

    console.log(`✅ ${semesters.length} Semesters created across ${syllabusTypes.length} syllabus types`);

    // Create Subjects for Semester 1 (Example)
    const semester1 = semesters[0];
    const subjects = await Subject.insertMany([
      {
        code: 'CS101',
        name: 'Programming Fundamentals',
        semester: semester1._id,
        department: 'Computer Engineering',
        teacher: teachers[0]._id,
        credits: 4,
        isActive: true,
      },
      {
        code: 'CS102',
        name: 'Data Structures',
        semester: semester1._id,
        department: 'Computer Engineering',
        teacher: teachers[0]._id,
        credits: 4,
        isActive: true,
      },
      {
        code: 'EE101',
        name: 'Basic Electronics',
        semester: semester1._id,
        department: 'Electronics Engineering',
        teacher: teachers[1]._id,
        credits: 3,
        isActive: true,
      },
    ]);

    console.log('✅ Subjects created');

    // Create Modules for first subject
    const modules = [];
    for (let i = 1; i <= 5; i++) {
      const module = await Module.create({
        number: i,
        title: `Module ${i}: Introduction to Programming`,
        description: `This module covers fundamental programming concepts for Module ${i}`,
        subject: subjects[0]._id,
        topics: [
          `Topic ${i}.1: Variables and Data Types`,
          `Topic ${i}.2: Control Structures`,
          `Topic ${i}.3: Functions and Procedures`,
        ],
      });
      modules.push(module);

      // Add modules to subject
      subjects[0].modules.push(module._id);
    }

    await subjects[0].save();

    console.log('✅ Modules created');
    console.log('\n🎉 Seed data created successfully!');
    console.log('\nSample Data:');
    console.log(`- ${teachers.length} Teachers`);
    console.log(`- ${semesters.length} Semesters`);
    console.log(`- ${subjects.length} Subjects`);
    console.log(`- ${modules.length} Modules`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

