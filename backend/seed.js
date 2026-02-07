const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./Models/User');
const Workflow = require('./Models/Workflow');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany();

    // Create sample users
    const users = [
      {
        username: 'admin',
        email: 'admin@docflow.edu',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
      },
      {
        username: 'student1',
        email: 'student1@docflow.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
      },
      {
        username: 'student2',
        email: 'student2@docflow.edu',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
      },
      {
        username: 'approver_admissions',
        email: 'admissions@docflow.edu',
        password: await bcrypt.hash('approver123', 10),
        role: 'approver',
        department: 'admissions',
      },
      {
        username: 'approver_finance',
        email: 'finance@docflow.edu',
        password: await bcrypt.hash('approver123', 10),
        role: 'approver',
        department: 'finance',
      },
      {
        username: 'approver_registrar',
        email: 'registrar@docflow.edu',
        password: await bcrypt.hash('approver123', 10),
        role: 'approver',
        department: 'registrar',
      },
    ];

    await User.insertMany(users);
    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const seedWorkflows = async () => {
  try {
    // Clear existing workflows
    await Workflow.deleteMany();

    // Create sample workflows
    const workflows = [
      {
        name: 'Admission Application',
        documentType: 'admission',
        stages: [
          { department: 'admissions', order: 1, approvalRequired: true, timeLimit: 24 },
          { department: 'finance', order: 2, approvalRequired: true, timeLimit: 48 },
          { department: 'registrar', order: 3, approvalRequired: true, timeLimit: 24 },
        ],
      },
      {
        name: 'Scholarship Application',
        documentType: 'scholarship',
        stages: [
          { department: 'scholarship', order: 1, approvalRequired: true, timeLimit: 48 },
          { department: 'finance', order: 2, approvalRequired: true, timeLimit: 72 },
        ],
      },
      {
        name: 'Transfer Application',
        documentType: 'transfer',
        stages: [
          { department: 'admissions', order: 1, approvalRequired: true, timeLimit: 72 },
          { department: 'registrar', order: 2, approvalRequired: true, timeLimit: 48 },
        ],
      },
    ];

    await Workflow.insertMany(workflows);
    console.log('Workflows seeded successfully');
  } catch (error) {
    console.error('Error seeding workflows:', error);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    await seedUsers();
    await seedWorkflows();
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();