import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Module from '../models/Module.js';
import Material from '../models/Material.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { listS3Objects } from '../services/s3Service.js';

dotenv.config();

const autoLinkS3 = async () => {
  try {
    await connectDB();

    // 1. Get a valid user for 'uploadedBy'
    let userId;
    const existingMaterial = await Material.findOne();
    if (existingMaterial) {
      userId = existingMaterial.uploadedBy;
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

    // 2. Fetch all semesters, subjects, and modules
    const semesters = await Semester.find();
    const subjects = await Subject.find();
    
    // 3. Fetch all S3 objects
    const s3Objects = await listS3Objects();
    console.log(`Found ${s3Objects.length} total objects in S3.`);

    let linkCount = 0;

    for (const obj of s3Objects) {
      if (obj.Size === 0) continue; // Skip folders

      const key = obj.Key; // e.g., "semester 6/DAV/Module 1/unit1.pdf"
      console.log(`\nProcessing: ${key}`);

      const parts = key.split('/');
      if (parts.length < 3) {
        console.log(`  Skipping: path too shallow`);
        continue;
      }

      // Extract Semester
      const semPart = parts[0].toLowerCase();
      const semNumMatch = semPart.match(/\d+/);
      if (!semNumMatch) {
          console.log(`  Skipping: no semester number found in ${semPart}`);
          continue;
      }
      const semNum = parseInt(semNumMatch[0]);
      const targetSem = semesters.find(s => s.number === semNum);
      if (!targetSem) {
          console.log(`  Skipping: semester ${semNum} not found in DB`);
          continue;
      }

      // Extract Subject
      const subjectPart = parts[1].toUpperCase();
      // Flexible matching for subjects
      const subjectMap = {
          'AM-III': 'EM3',
          'EM-3': 'EM3',
          'EM-4': 'EM4',
          'DAV': 'DAV', // S3 DAV -> DB DAV
          'SAIDS': 'SAIDS'
      };
      
      const targetCode = subjectMap[subjectPart] || subjectPart;
      const targetSubject = subjects.find(s => 
        (s.code === targetCode || s.name.toUpperCase() === subjectPart || s.code === subjectPart) && 
        s.semester.toString() === targetSem._id.toString()
      );

      if (!targetSubject) {
        console.log(`  Skipping: subject ${subjectPart} (mapped to ${targetCode}) not found for semester ${semNum}`);
        continue;
      }

      // Extract Module Number
      // Search in all parts of the path for "Module X"
      let moduleNum = 1; // Default
      let foundModule = false;
      for (const part of parts) {
          const moduleMatch = part.match(/Module\s*(\d+)/i);
          if (moduleMatch) {
              moduleNum = parseInt(moduleMatch[1]);
              foundModule = true;
              break;
          }
      }

      const fileName = parts[parts.length - 1];
      if (!foundModule) {
          // Check filename for module number if not found in folder name
          const moduleMatch = fileName.match(/Module\s*(\d+)/i);
          if (moduleMatch) {
              moduleNum = parseInt(moduleMatch[1]);
              foundModule = true;
          }
      }

      const targetModule = await Module.findOne({ 
        subject: targetSubject._id, 
        number: moduleNum 
      });

      if (!targetModule) {
        console.log(`  Skipping: module ${moduleNum} not found for subject ${targetSubject.code}`);
        continue;
      }

      // Check if already linked
      const existing = await Material.findOne({ s3Key: key, module: targetModule._id });
      if (existing) {
        console.log(`  ℹ️ Already linked to ${targetModule.title}`);
        continue;
      }

      // Create Material
      const material = new Material({
        title: fileName.replace(/\.[^/.]+$/, "").replace(/_/g, ' ').replace(/[\(\)]/g, ' ').trim(),
        type: fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : (fileName.toLowerCase().endsWith('.ppt') || fileName.toLowerCase().endsWith('.pptx') ? 'PPT' : 'TEXT'),
        storageType: 'S3',
        s3Key: key,
        fileName: fileName,
        fileSize: obj.Size,
        module: targetModule._id,
        uploadedBy: userId,
        isOfficial: true,
      });

      await material.save();
      targetModule.materials.push(material._id);
      await targetModule.save();

      console.log(`  ✅ Linked to ${targetSubject.code} Module ${moduleNum}: ${material.title}`);
      linkCount++;
    }

    console.log(`\n🎉 Success! Linked ${linkCount} new materials.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in auto-link script:', error);
    process.exit(1);
  }
};

autoLinkS3();
