import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Subject from '../models/Subject.js';
import Module from '../models/Module.js';

dotenv.config();

const curriculumData = {
  // Sem 3
  'EM3': [
    'Laplace transform',
    'Inverse Laplace transform',
    'Fourier series',
    'Complex variables',
    'Statistical techniques',
    'Probability'
  ],
  'DSGT': [
    'Logic',
    'Relation and functions',
    'Poset and lattice',
    'Counting',
    'Algebra structure',
    'Graph theory'
  ],
  'DS': [
    'Introduction to data structure',
    'Stack and queues',
    'Linked list',
    'Trees',
    'Graphs',
    'Searching techniques'
  ],
  'DLCA': [
    'Computer Fundamentals',
    'Data Representation and Arithmetic Algorithms',
    'Processor Organization and Architecture',
    'Control Unit Design',
    'Memory Organization',
    'Principles of Advanced Processor and Buses'
  ],
  'CG': [
    'Introduction and Overview of Graphics System',
    'Output Primitives',
    'Two Dimensional Geometric Transformations',
    'Two-Dimensional Viewing and Clipping',
    'Three Dimensional Geometric Transformations, Curves and Fractal Generation',
    'Visible Surface Detection and Animation'
  ],
  
  // Sem 4
  'EM4': [
    'Linear Algebra (Theory of Matrices)',
    'Complex Integration',
    'Z Transform',
    'Probability Distribution and Sampling Theory',
    'Linear Programming Problems',
    'Nonlinear Programming Problems'
  ],
  'AOA': [
    'Introduction',
    'Divide and Conquer Approach',
    'Greedy Method Approach',
    'Dynamic Programming Approach',
    'Backtracking and Branch and Bound',
    'String Matching Algorithms'
  ],
  'DBMS': [
    'Introduction Database Concepts',
    'Entity–Relationship Data Model',
    'Relational Model and Relational Algebra',
    'Structured Query Language (SQL)',
    'Relational-Database Design',
    'Transactions Management and Concurrency and Recovery'
  ],
  'OS': [
    'Operating System Overview',
    'Process and Process Scheduling',
    'Process Synchronization and Deadlocks',
    'Memory Management',
    'File Management',
    'I/O Management'
  ],
  'MP': [
    'The Intel Microprocessors 8086 Architecture',
    'Instruction Set and Programming',
    'Memory and Peripherals interfacing',
    'Intel 80386DX Processor',
    'Pentium Processor',
    'Pentium 4'
  ],

  // Sem 5
  'CN': [
    'Introduction to Networking',
    'Physical and Data Link Layer',
    'Network Layer',
    'Transport Layer and Application Layer',
    'Enterprise Network Design',
    'Software Defined Networks'
  ],
  'WC': [
    'Web programming fundamentals',
    'JavaScript',
    'React Fundamentals',
    'Node.js',
    'Express',
    'Advance React'
  ],
  'AI': [
    'Introduction to Artificial Intelligence',
    'Intelligent Agents',
    'Solving Problems by Searching',
    'Knowledge and Reasoning',
    'Reasoning Under Uncertainty',
    'Planning and Learning'
  ],
  'DWM': [
    'Data Warehouse and OLAP',
    'Introduction to Data Mining, Data Exploration and Data Preprocessing',
    'Classification',
    'Clustering',
    'Frequent Pattern',
    'Web Mining'
  ],
  'SAIDS': [
    'Exploratory Data Analysis',
    'Data and Sampling Distributions',
    'Statistical Experiments and Significance Testing',
    'Summarizing Data',
    'The Analysis of Variance',
    'Linear Least Squares'
  ],

  // Sem 6
  'DAV': [
    'Introduction to Data analytics and life cycle',
    'Regression Models',
    'Time Series',
    'Text Analytics',
    'Data analytics and visualization with R',
    'Data analytics and Visualization with Python'
  ],
  'CSS': [
    'Introduction & Number Theory',
    'Block Ciphers & Public Key Cryptography',
    'Cryptographic Hashes, Message Digests and Digital Certificates',
    'Digital signature schemes and Authentication Protocols',
    'System Security',
    'Web security'
  ],
  'SEPM': [
    'Introduction to Software Engineering',
    'Requirements Analysis and Cost Estimation',
    'Design Engineering',
    'Software Risk, Configuration Management',
    'Software Testing and Maintenance',
    'IT Project Management and Project Scheduling'
  ],
  'ML': [
    'Introduction to Machine Learning',
    'Mathematical Foundation for ML',
    'Linear Models',
    'Clustering',
    'Classification models',
    'Dimensionality Reduction'
  ],
  'DC': [
    'Introduction to Distributed Systems',
    'Communication',
    'Synchronization',
    'Resource and Process Management',
    'Consistency, Replication and Fault Tolerance',
    'Distributed File Systems and Name Services'
  ]
};

const updateModules = async () => {
  try {
    await connectDB();

    for (const [subjectCode, moduleTitles] of Object.entries(curriculumData)) {
      const subject = await Subject.findOne({ code: subjectCode }).populate('modules');
      
      if (!subject) {
        console.log(`Warning: Subject ${subjectCode} not found in DB`);
        continue;
      }

      console.log(`\nUpdating modules for ${subjectCode}...`);
      
      // Update existing modules or create new ones
      for (let i = 0; i < 6; i++) { // Enforce exactly 6 modules as per data
        const moduleNum = i + 1;
        const moduleTitle = moduleTitles[i];
        
        // Ensure clean title (removing user numbering prefixes if any sneaked in, though we cleaned the arrays)
        const cleanTitle = moduleTitle.replace(/^(Module\s*\d*:|[\d\.\*]+(:|\s)?)\s*/i, '').trim();

        // Check if module already exists for this subject
        const existingModule = await Module.findOne({ subject: subject._id, number: moduleNum });

        if (existingModule) {
          // Update existing
          existingModule.title = `Module ${moduleNum}: ${cleanTitle}`;
          existingModule.description = `Covers topics related to ${cleanTitle}`;
          // Also set it as the first topic just to update the topics array
          existingModule.topics = [cleanTitle]; 
          await existingModule.save();
          console.log(`  Updated Module ${moduleNum}: ${cleanTitle}`);
        } else {
          // Create new module
          const newModule = await Module.create({
            number: moduleNum,
            title: `Module ${moduleNum}: ${cleanTitle}`,
            description: `Covers topics related to ${cleanTitle}`,
            subject: subject._id,
            topics: [cleanTitle]
          });
          
          if (!subject.modules.includes(newModule._id)) {
            subject.modules.push(newModule._id);
          }
          console.log(`  Created Module ${moduleNum}: ${cleanTitle}`);
        }
      }
      
      // Save subject to update the modules array reference
      await subject.save();
    }

    console.log('\n✅ Successfully updated all module topics and titles!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating modules:', error);
    process.exit(1);
  }
};

updateModules();
