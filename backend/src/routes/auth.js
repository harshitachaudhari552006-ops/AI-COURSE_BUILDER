import express from 'express';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import { generateOTP, sendOTPEmail, sendOTPSMS } from '../services/otpService.js';

const router = express.Router();

// Register new student
router.post('/register', async (req, res) => {
  try {
    const { studentId, name, email, mobile, semester, department } = req.body;

    if (!studentId || !name || !email || !semester || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ studentId }, { email }, { mobile }] 
    });

    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this ID, Email or Mobile already exists' });
    }

    const student = new Student({
      studentId,
      name,
      email,
      mobile,
      semester,
      department
    });

    await student.save();

    res.status(201).json({ 
      message: 'Registration successful. You can now login.',
      student: { studentId: student.studentId, name: student.name }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID required' });
    }

    // Find student (must exist now)
    const student = await Student.findOne({ studentId });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found. Please register first.' });
    }

    // Decide whether to use fixed OTP (dev) or random OTP (prod)
    const useFixedOtp = process.env.USE_FIXED_OTP === 'true';
    const fixedOtp = process.env.FIXED_OTP || '123456';

    // Generate OTP (fixed in dev mode to avoid email setup)
    const otp = useFixedOtp ? fixedOtp : generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(process.env.OTP_EXPIRE_MINUTES || '10'));

    student.otp = {
      code: otp,
      expiresAt,
    };

    await student.save();

    // In fixed-OTP dev mode, don't attempt to send email/SMS at all.
    if (useFixedOtp) {
      return res.json({
        message: 'OTP generated (development mode).',
        otp, // visible in Network tab / response for convenience
        expiresIn: process.env.OTP_EXPIRE_MINUTES || '10',
      });
    }

    // Normal mode: send OTP via email/SMS
    let sent = false;
    if (student.email) {
      sent = await sendOTPEmail(student.email, otp, student.name);
    }
    if (student.mobile && !sent) {
      sent = await sendOTPSMS(student.mobile, otp);
    }

    if (!sent) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

    res.json({
      message: 'OTP sent successfully',
      expiresIn: process.env.OTP_EXPIRE_MINUTES || '10',
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and Login
router.post('/verify-otp', async (req, res) => {
  try {
    const { studentId, otp } = req.body;

    if (!studentId || !otp) {
      return res.status(400).json({ message: 'Student ID and OTP required' });
    }

    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check OTP
    if (!student.otp || !student.otp.code) {
      return res.status(400).json({ message: 'OTP not requested. Please request OTP first.' });
    }

    if (student.otp.code !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(student.otp.expiresAt)) {
      return res.status(401).json({ message: 'OTP expired. Please request a new one.' });
    }

    // OTP verified - clear OTP and update student
    student.otp = undefined;
    student.isVerified = true;
    student.lastLogin = new Date();
    await student.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, studentId: student.studentId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        mobile: student.mobile,
        semester: student.semester,
        department: student.department,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

