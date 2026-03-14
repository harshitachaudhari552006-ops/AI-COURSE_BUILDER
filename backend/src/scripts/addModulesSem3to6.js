import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Module from '../models/Module.js';

dotenv.config();

const addModules = async () => {
  try {
    await connectDB();

    for (let i = 3; i <= 6; i++) {
        const sem = await Semester.findOne({ number: i });
        if (!sem) {
            console.log(`Semester ${i} not found!`);
            continue;
        }

        const subjects = await Subject.find({ semester: sem._id });
        console.log(`\nFound ${subjects.length} Subjects in Semester ${i}`);
        
        for (const subject of subjects) {
            console.log(`Adding modules for ${subject.code}...`);
            let modulesAdded = 0;
            
            // Check existing modules
            const existingModules = await Module.find({ subject: subject._id });
            const existingModuleNumbers = existingModules.map(m => m.number);
            
            for (let m = 1; m <= 6; m++) {
                if (existingModuleNumbers.includes(m)) {
                    continue; // Skip if module number already exists
                }

                const newModule = await Module.create({
                    number: m,
                    title: `Module ${m}: Introduction to ${subject.name}`,
                    description: `This module covers fundamental concepts of ${subject.name} for Module ${m}.`,
                    subject: subject._id,
                    topics: [
                    `Topic ${m}.1: Basics`,
                    `Topic ${m}.2: Core Principles`,
                    `Topic ${m}.3: Advanced Applications`,
                    ],
                });
                
                // Add to subject's modules array
                if (!subject.modules.includes(newModule._id)) {
                    subject.modules.push(newModule._id);
                }
                
                modulesAdded++;
            }
            
            if (modulesAdded > 0) {
                await subject.save();
                console.log(` -> Added ${modulesAdded} modules to ${subject.code}`);
            } else {
                console.log(` -> Modules already exist for ${subject.code}`);
            }
        }
    }

    console.log('\n✅ Successfully processed modules for Sem 3 to 6!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error processing modules:', error);
    process.exit(1);
  }
};

addModules();
