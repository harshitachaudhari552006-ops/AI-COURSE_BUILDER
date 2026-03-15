import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import QuestionPaper from '../models/QuestionPaper.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { listS3Objects } from '../services/s3Service.js';

dotenv.config();

const autoLinkQuestionPapers = async () => {
  try {
    await connectDB();

    // 1. Get a valid user for 'uploadedBy'
    let userId;
    const existingPaper = await QuestionPaper.findOne();
    if (existingPaper) {
      userId = existingPaper.uploadedBy;
    } else {
      const teacher = await Teacher.findOne();
      if (teacher) {
        userId = teacher._id;
      } else {
        const student = await Student.findOne();
        if (student) {
          userId = student._id;
        }
      }
    }

    if (!userId) {
      console.error('❌ No users found in database to assign as uploader.');
      process.exit(1);
    }

    console.log(`Using User ID: ${userId} for uploads`);

    // 2. Fetch all semesters and subjects
    const semesters = await Semester.find();
    const subjects = await Subject.find();
    
    // 3. Fetch all S3 objects
    const s3Objects = await listS3Objects();
    console.log(`Found ${s3Objects.length} total objects in S3.`);

    let linkCount = 0;

    for (const obj of s3Objects) {
      if (obj.Size === 0) continue;

      const key = obj.Key; // e.g., "semester 6/DAV/question papers/MAY 2023.pdf"
      const parts = key.split('/');
      
      // We look for "question papers" or similar in the path
      const qpIndex = parts.findIndex(p => p.toLowerCase().includes('question paper'));
      if (qpIndex === -1) continue;

      console.log(`\nProcessing Question Paper: ${key}`);

      // Extract Semester
      const semPart = parts[0].toLowerCase();
      const semNumMatch = semPart.match(/\d+/);
      if (!semNumMatch) continue;
      
      const semNum = parseInt(semNumMatch[0]);
      const targetSem = semesters.find(s => s.number === semNum);
      if (!targetSem) continue;

      // Extract Subject
      const subjectPart = parts[1].toUpperCase();
      const subjectMap = {
          'AM-III': 'EM3',
          'EM-3': 'EM3',
          'EM-4': 'EM4',
          'DAV': 'DAV',
          'SAIDS': 'SAIDS'
      };
      
      const targetCode = subjectMap[subjectPart] || subjectPart;
      const targetSubject = subjects.find(s => 
        (s.code === targetCode || s.name.toUpperCase() === subjectPart || s.code === subjectPart) && 
        s.semester.toString() === targetSem._id.toString()
      );

      if (!targetSubject) {
        console.log(`  Skipping: subject ${subjectPart} not found for semester ${semNum}`);
        continue;
      }

      const fileName = parts[parts.length - 1];
      
      // Check if already linked
      const existing = await QuestionPaper.findOne({ s3Key: key });
      if (existing) {
        console.log(`  ℹ️ Already linked: ${existing.title}`);
        continue;
      }

      // Extract Year (look for 4 digit numbers)
      const yearMatch = fileName.match(/\b(20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

      // Extract Exam Type
      let examType = 'END_SEM';
      if (fileName.toLowerCase().includes('mid')) examType = 'MID_SEM';
      if (fileName.toLowerCase().includes('quiz')) examType = 'QUIZ';

      // Create QuestionPaper
      const paper = new QuestionPaper({
        title: fileName.replace(/\.[^/.]+$/, "").replace(/_/g, ' ').trim(),
        year: year,
        semester: semNum,
        subject: targetSubject._id,
        storageType: 'S3',
        s3Key: key,
        fileName: fileName,
        examType: examType,
        uploadedBy: userId,
      });

      await paper.save();
      console.log(`  ✅ Linked to ${targetSubject.name}: ${paper.title}`);
      linkCount++;
    }

    console.log(`\n🎉 Success! Linked ${linkCount} new question papers.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in auto-link script:', error);
    process.exit(1);
  }
};

autoLinkQuestionPapers();
