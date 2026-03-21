import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';

dotenv.config();

const seedNEPData = async () => {
  try {
    await connectDB();
    console.log('🔄 Cleaning up legacy indexes...');
    try {
        await mongoose.connection.collection('semesters').dropIndex('number_1');
        console.log('✅ Legacy index number_1 dropped.');
    } catch (e) {
        console.warn('⚠️  Legacy index number_1 not found or already dropped.');
    }
    console.log('🔄 Seeding NEP 2020 Data...');

    // 1. Create Semesters 1-8 for NEP 2020
    const nepSemesters = [];
    for (let i = 1; i <= 8; i++) {
        // Find if already exists, else create
        let semester = await Semester.findOne({ number: i, syllabusType: 'NEP 2020' });
        if (!semester) {
            semester = await Semester.create({
                number: i,
                syllabusType: 'NEP 2020',
                name: `NEP 2020 - Semester ${i}`,
                isActive: true
            });
        }
        nepSemesters.push(semester);
    }
    console.log('✅ NEP 2020 Semesters (1-8) ready.');

    // 2. Fetch a teacher to assign subjects
    const teacher = await Teacher.findOne();
    if (!teacher) {
        console.error('❌ No teacher found. Please run seedData first.');
        process.exit(1);
    }

    // 3. Create Sample NEP Subjects for Semester 1
    const sem1 = nepSemesters[0];
    const nepSubjects = [
        {
            code: 'NEP-CS101',
            name: 'Computational Thinking & Python',
            semester: sem1._id,
            department: 'Computer Engineering',
            teacher: teacher._id,
            credits: 4,
            isActive: true
        },
        {
            code: 'NEP-MD101',
            name: 'Multidisciplinary Elective I',
            semester: sem1._id,
            department: 'Interdisciplinary',
            teacher: teacher._id,
            credits: 3,
            isActive: true
        },
        {
            code: 'NEP-SEC101',
            name: 'Skill Enhancement Course: Digital Literacy',
            semester: sem1._id,
            department: 'Computer Engineering',
            teacher: teacher._id,
            credits: 2,
            isActive: true
        },
        {
            code: 'NEP-VA101',
            name: 'Value Added Course: Environmental Ethics',
            semester: sem1._id,
            department: 'Humanities',
            teacher: teacher._id,
            credits: 2,
            isActive: true
        }
    ];

    for (const sub of nepSubjects) {
        await Subject.findOneAndUpdate(
            { code: sub.code },
            sub,
            { upsert: true, new: true }
        );
    }

    console.log('✅ Sample NEP 2020 Subjects for Semester 1 created.');
    console.log('\n🎉 NEP 2020 Setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ NEP Seeding failed:', error);
    process.exit(1);
  }
};

seedNEPData();
