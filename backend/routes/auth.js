const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { pool } = require('../utils/db');
const { auth } = require('../middleware/auth');
const fs = require('fs');

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage, // เปลี่ยนไปใช้ diskStorage ที่กำหนดไว้ด้านบน
  limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ไม่เกิน 5MB
});

// Student registration
router.post('/register/student', upload.single('userProfilePic'), async (req, res) => {
  const {
    studentId,
    nationalId,
    userFirstname,
    userLastname,
    userEmail,
    userPass,
    userTel,
    userAddress,
  } = req.body;
  
  const userProfilePic = req.file ? req.file.path : null;

  try {
    // Check if email already exists
    const [existingUser] = await pool.query(
      'SELECT * FROM tb_user WHERE userEmail = ?',
      [userEmail]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userPass, 10);

    // Insert user data
    const [result] = await pool.query(
      'INSERT INTO tb_user (studentId, nationalId, userFirstname, userLastname, userEmail, userPass, userTel, userAddress, userProfilePic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [studentId, nationalId, userFirstname, userLastname, userEmail, hashedPassword, userTel, userAddress, userProfilePic]
    );

    res.status(201).json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
});

// Rider registration
router.post('/register/rider', upload.fields([
  { name: 'RiderProfilePic', maxCount: 1 },
  { name: 'RiderStudentCard', maxCount: 1 },
  { name: 'QRscan', maxCount: 1 },
  { name: 'riderLicense', maxCount: 1 }
]), async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Content-Type:', req.get('Content-Type'));
  
  try {
    const {
      riderId,
      riderNationalId,
      riderFirstname,
      riderLastname,
      riderEmail,
      riderPass,
      riderTel,
      riderAddress
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!riderId || !riderNationalId || !riderFirstname || !riderLastname || !riderEmail || 
        !riderPass || !riderTel || !riderAddress) {
      return res.status(400).json({ 
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
      });
    }

    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(riderEmail)) {
      return res.status(400).json({ 
        success: false,
        message: 'รูปแบบอีเมลไม่ถูกต้อง' 
      });
    }

    // ตรวจสอบรหัสผ่าน
    if (riderPass.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' 
      });
    }

    // ตรวจสอบเบอร์โทรศัพท์
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(riderTel)) {
      return res.status(400).json({ 
        success: false,
        message: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง' 
      });
    }

    // ตรวจสอบว่ามีอีเมลซ้ำหรือไม่
    const [existingUser] = await pool.query(
      'SELECT * FROM riders WHERE riderEmail = ?',
      [riderEmail]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'อีเมลนี้ถูกใช้งานแล้ว' 
      });
    }

    // ตรวจสอบว่ามีไฟล์ที่จำเป็นถูกอัปโหลดหรือไม่
    if (!req.files || !req.files['RiderProfilePic'] || !req.files['RiderStudentCard'] || !req.files['riderLicense'] || !req.files['QRscan']) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาแนบไฟล์ที่จำเป็นทั้งหมด (รูปโปรไฟล์, บัตรนักศึกษา, ใบขับขี่, QR Code)'
      });
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(riderPass, 10);

    // เพิ่มข้อมูลไรเดอร์
    await pool.query(
      'INSERT INTO riders (riderId, riderNationalId, riderFirstname, riderLastname, riderEmail, riderPass, riderTel, riderAddress, RiderProfilePic, RiderStudentCard, riderLicense, QRscan, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending")',
      [riderId, riderNationalId, riderFirstname, riderLastname, riderEmail, hashedPassword, riderTel, riderAddress, req.files['RiderProfilePic'][0].path, req.files['RiderStudentCard'][0].path, req.files['riderLicense'][0].path, req.files['QRscan'][0].path]
    );

    res.status(201).json({
      success: true,
      message: 'ลงทะเบียนเรียบร้อยแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ'
    });
  } catch (error) {
    console.error('Error registering rider:', error);
    res.status(500).json({ 
      success: false,
      message: 'เกิดข้อผิดพลาดในการลงทะเบียน' 
    });
  }
});

// Admin registration
router.post('/register/admin', async (req, res) => {
  const {
    studentId,
    nationalId,
    userFirstname,
    userLastname,
    userEmail,
    userPass,
    userTel,
    userAddress,
    adminKey,
  } = req.body;

  try {
    // ตรวจสอบ adminKey
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(400).json({ message: 'รหัสยืนยันแอดมินไม่ถูกต้อง' });
    }

    // Check if email already exists
    const [existingUser] = await pool.query(
      'SELECT * FROM tb_user WHERE userEmail = ?',
      [userEmail]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userPass, 10);

    // Insert admin data
    const [result] = await pool.query(
      'INSERT INTO tb_user (studentId, nationalId, userFirstname, userLastname, userEmail, userPass, userTel, userAddress, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "admin")',
      [studentId, nationalId, userFirstname, userLastname, userEmail, hashedPassword, userTel, userAddress]
    );

    res.status(201).json({
      success: true,
      message: 'ลงทะเบียนแอดมินสำเร็จ',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password, userType } = req.body;
  
  // เพิ่ม log ตรวจสอบข้อมูลที่ส่งมา
  console.log('=== Login Request ===');
  console.log('Email:', email);
  console.log('UserType:', userType);
  console.log('Request body:', req.body);

  try {
    let user;
    let table;
    let emailField;
    let passwordField;
    let idField;

    // Determine which table to query based on user type
    switch (userType) {
      case 'student':
        table = 'tb_user';
        emailField = 'userEmail';
        passwordField = 'userPass';
        idField = 'studentId';
        break;
      case 'rider':
        table = 'riders';
        emailField = 'riderEmail';
        passwordField = 'riderPass';
        idField = 'riderId';
        break;
      case 'admin':
        table = 'tb_user';
        emailField = 'userEmail';
        passwordField = 'userPass';
        idField = 'studentId';
        break;
      default:
        console.log('Invalid user type:', userType);
        return res.status(400).json({ message: 'ประเภทผู้ใช้ไม่ถูกต้อง' });
    }

    // Get user from database
    const [users] = await pool.query(
      `SELECT * FROM ${table} WHERE ${emailField} = ?`,
      [email]
    );

    console.log('Query result:', users);

    if (users.length === 0) {
      console.log('User not found');
      return res.status(401).json({ message: 'ข้อมูลไม่ถูกต้อง' });
    }

    user = users[0];
    console.log('Found user:', { ...user, [passwordField]: '***HIDDEN***' });

    // Debug: Log password comparison details
    console.log('=== Login Debug ===');
    console.log('Input password:', `'${password}'`, 'Length:', password.length);
    console.log('Stored hash:', user[passwordField] ? '***hash exists***' : '***no hash***');
    console.log('Password field name:', passwordField);
    
    // Check password with detailed debugging
    console.log('=== Password Comparison Debug ===');
    console.log('Input password (raw):', `'${password}'`, 'Length:', password.length);
    console.log('Stored hash (raw):', `'${user[passwordField]}'`, 'Length:', user[passwordField].length);
    
    // Log character codes to check for hidden characters
    console.log('Input password char codes:', Array.from(password).map(c => c.charCodeAt(0)));
    console.log('Stored hash char codes (first 10):', Array.from(user[passwordField]).slice(0, 10).map(c => c.charCodeAt(0)));
    
    // Try to verify the password
    let validPassword = false;
    try {
      console.log('Attempting bcrypt.compare...');
      validPassword = await bcrypt.compare(password, user[passwordField]);
      console.log('bcrypt.compare result:', validPassword);
    } catch (compareError) {
      console.error('Error in bcrypt.compare:', compareError);
      // Try with trimmed password in case of whitespace issues
      const trimmedPassword = password.trim();
      console.log('Trying with trimmed password:', `'${trimmedPassword}'`);
      validPassword = await bcrypt.compare(trimmedPassword, user[passwordField]);
      console.log('Trimmed password compare result:', validPassword);
    }
    
    // If still not valid, try with the student ID as a number
    if (!validPassword && userType === 'student') {
      console.log('Trying with student ID as number...');
      const studentIdAsNumber = parseInt(password, 10);
      if (!isNaN(studentIdAsNumber)) {
        const studentIdAsString = studentIdAsNumber.toString();
        console.log('Trying with student ID as string:', `'${studentIdAsString}'`);
        validPassword = await bcrypt.compare(studentIdAsString, user[passwordField]);
        console.log('Student ID compare result:', validPassword);
      }
    }
    
    // Try to verify the password directly with the stored hash
    if (!validPassword && user[passwordField]) {
      console.log('=== Additional Debug Info ===');
      const storedHash = user[passwordField];
      console.log('Stored hash length:', storedHash.length);
      console.log('Stored hash prefix:', storedHash.substring(0, 10));
      console.log('Stored hash full:', storedHash);
      
      // Check for common issues
      if (storedHash.includes('\r') || storedHash.includes('\n')) {
        console.log('WARNING: Hash contains newline or carriage return characters!');
      }
      
      // Try to hash the input password with the same salt
      const hashInfo = storedHash.split('$');
      if (hashInfo.length >= 4) {
        console.log('Hash algorithm:', hashInfo[1]);
        console.log('Cost factor:', hashInfo[2]);
      }
      
      // Try to hash the input password to see what we get
      try {
        console.log('--- Testing bcrypt ---');
        console.log('Hashing input password with bcrypt...');
        const testHash = await bcrypt.hash(password, 10);
        console.log('Test hash of input password:', testHash);
        console.log('Test hash length:', testHash.length);
        
        // Try to verify with the test hash
        const testCompare = await bcrypt.compare(password, testHash);
        console.log('Test hash comparison with input password:', testCompare);
        
        // Try to verify stored hash with test hash
        console.log('Comparing stored hash with test hash:', storedHash === testHash);
        
        // Try to verify with the stored hash
        const storedCompare = await bcrypt.compare(password, storedHash);
        console.log('Stored hash comparison with input password:', storedCompare);
        
        // Try to verify with trimmed stored hash
        const trimmedHash = storedHash.trim();
        if (trimmedHash !== storedHash) {
          console.log('Trimming whitespace from stored hash...');
          const trimmedCompare = await bcrypt.compare(password, trimmedHash);
          console.log('Trimmed hash comparison:', trimmedCompare);
        }
      } catch (hashError) {
        console.error('Error during test hashing:', hashError);
      }
    }

    if (!validPassword) {
      console.log('Invalid password');
      const errorResponse = { 
        message: 'ข้อมูลไม่ถูกต้อง',
        debug: process.env.NODE_ENV === 'development' ? 'Invalid credentials' : undefined
      };
      
      if (process.env.NODE_ENV === 'development') {
        errorResponse.bcryptDebug = {
          hashLength: user[passwordField] ? user[passwordField].length : undefined,
          hashPrefix: user[passwordField] ? user[passwordField].substring(0, 10) : undefined
        };
      }
      
      return res.status(401).json(errorResponse);
    }

    // For riders, check if they're approved
    if (userType === 'rider') {
      console.log('Rider status:', user.status);
      if (user.status !== 'approved') {
        console.log('Rider not approved');
        return res.status(401).json({ message: 'บัญชีของคุณยังไม่ได้รับการอนุมัติ' });
      }
    }

    // For admin, check if user has admin role
    if (userType === 'admin' && user.role !== 'admin') {
      console.log('Not an admin user');
      return res.status(401).json({ message: 'คุณไม่มีสิทธิ์เข้าสู่ระบบในฐานะแอดมิน' });
    }

    // ถ้าผ่านการตรวจสอบทั้งหมด
    console.log('Login successful');
    
    // Create and sign token
    const token = jwt.sign(
      { 
        id: user[idField],
        userType,
        role: userType === 'student' ? user.role : userType
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user[idField],
        email: user[emailField],
        firstname: user[userType === 'student' || userType === 'admin' ? 'userFirstname' : 'riderFirstname'],
        lastname: user[userType === 'student' || userType === 'admin' ? 'userLastname' : 'riderLastname'],
        role: userType === 'student' ? user.role : userType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// Get student profile
router.get('/student/profile', auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const [students] = await pool.query(
      'SELECT studentId, nationalId, userFirstname, userLastname, userEmail, userTel, userAddress FROM tb_user WHERE studentId = ?',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลนักศึกษา' });
    }

    res.json({
      success: true,
      profile: students[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' });
  }
});

// Get rider profile
router.get('/rider/profile', auth, async (req, res) => {
  try {
    const riderId = req.user.id;

    const [riders] = await pool.query(
      'SELECT riderId, riderNationalId, riderFirstname, riderLastname, riderEmail, riderTel, riderAddress, riderLicense, status, riderRate FROM riders WHERE riderId = ?',
      [riderId]
    );
    
    console.log('Rider profile data:', riders[0]); // Debug log

    if (riders.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ขับขี่' });
    }

    res.json({
      success: true,
      profile: riders[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' });
  }
});

// Get admin profile
router.get('/admin/profile', auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const [admins] = await pool.query(
      'SELECT studentId, nationalId, userFirstname, userLastname, userEmail, userTel, userAddress FROM tb_user WHERE studentId = ? AND role = "admin"',
      [studentId]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลแอดมิน' });
    }

    res.json({
      success: true,
      profile: admins[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' });
  }
});

// ในส่วนของ getRiders
router.get('/riders', async (req, res) => {
  try {
    const [riders] = await pool.query(`
      SELECT r.*, 
             v.carId, v.carType, v.plate, v.brand, v.model, v.carPhoto, v.insurancePhoto
      FROM riders r
      LEFT JOIN vehicles v ON r.riderId = v.riderId
      ORDER BY r.riderId DESC
    `);

    // จัดกลุ่มข้อมูลรถตามไรเดอร์
    const groupedRiders = riders.reduce((acc, row) => {
      if (!acc[row.riderId]) {
        acc[row.riderId] = {
          ...row,
          vehicles: []
        };
        delete acc[row.riderId].carId;
        delete acc[row.riderId].carType;
        delete acc[row.riderId].plate;
        delete acc[row.riderId].brand;
        delete acc[row.riderId].model;
        delete acc[row.riderId].carPhoto;
        delete acc[row.riderId].insurancePhoto;
      }
      if (row.carId) {
        acc[row.riderId].vehicles.push({
          carId: row.carId,
          carType: row.carType,
          plate: row.plate,
          brand: row.brand,
          model: row.model,
          carPhoto: row.carPhoto,
          insurancePhoto: row.insurancePhoto
        });
      }
      return acc;
    }, {});

    res.json(Object.values(groupedRiders));
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลไรเดอร์' });
  }
});

// ในส่วนของ getRiderById
router.get('/riders/:id', async (req, res) => {
  try {
    const [riders] = await pool.query(`
      SELECT r.*, 
             v.carId, v.carType, v.plate, v.brand, v.model, v.carPhoto, v.insurancePhoto
      FROM riders r
      LEFT JOIN vehicles v ON r.riderId = v.riderId
      WHERE r.riderId = ?
    `, [req.params.id]);

    if (riders.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลไรเดอร์' });
    }

    // จัดกลุ่มข้อมูลรถ
    const rider = {
      ...riders[0],
      vehicles: []
    };

    delete rider.carId;
    delete rider.carType;
    delete rider.plate;
    delete rider.brand;
    delete rider.model;
    delete rider.carPhoto;
    delete rider.insurancePhoto;

    riders.forEach(row => {
      if (row.carId) {
        rider.vehicles.push({
          carId: row.carId,
          carType: row.carType,
          plate: row.plate,
          brand: row.brand,
          model: row.model,
          carPhoto: row.carPhoto,
          insurancePhoto: row.insurancePhoto
        });
      }
    });

    res.json(rider);
  } catch (error) {
    console.error('Error fetching rider:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลไรเดอร์' });
  }
});

// Test route to manually verify password hashes
router.get('/test-hash', async (req, res) => {
  try {
    const { password, hash } = req.query;
    
    if (!password || !hash) {
      return res.status(400).json({ 
        error: 'Both password and hash query parameters are required' 
      });
    }
    
    console.log('=== Testing Password Hash ===');
    console.log('Password:', `'${password}'`, 'Length:', password.length);
    console.log('Hash:', `'${hash}'`, 'Length:', hash.length);
    
    // Log character codes
    console.log('Password char codes:', Array.from(password).map(c => c.charCodeAt(0)));
    console.log('Hash char codes (first 10):', Array.from(hash).slice(0, 10).map(c => c.charCodeAt(0)));
    
    // Try to compare
    const isValid = await bcrypt.compare(password, hash);
    
    // Try with trimmed password
    const trimmedPassword = password.trim();
    const isTrimmedValid = await bcrypt.compare(trimmedPassword, hash);
    
    // Try with parsed number if it's a number
    const numberPassword = parseInt(password, 10);
    let isNumberValid = false;
    if (!isNaN(numberPassword)) {
      isNumberValid = await bcrypt.compare(numberPassword.toString(), hash);
    }
    
    res.json({
      password: {
        original: password,
        length: password.length,
        charCodes: Array.from(password).map(c => c.charCodeAt(0)),
        trimmed: trimmedPassword,
        trimmedLength: trimmedPassword.length,
        isNumber: !isNaN(numberPassword),
        numberValue: numberPassword
      },
      hash: {
        value: hash,
        length: hash.length,
        prefix: hash.substring(0, 10),
        algorithm: hash.split('$')[1],
        cost: hash.split('$')[2],
        salt: hash.split('$')[3]?.substring(0, 22)
      },
      comparison: {
        original: isValid,
        trimmed: isTrimmedValid,
        asNumber: isNumberValid
      }
    });
    
  } catch (error) {
    console.error('Error testing hash:', error);
    res.status(500).json({ 
      error: 'Error testing hash',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Temporary route to fix student password - REMOVE AFTER USE
router.post('/fix-student-password', async (req, res) => {
  try {
    const { studentId, newPassword } = req.body;
    
    if (!studentId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and new password are required'
      });
    }

    // Generate a new hash
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the database directly
    const [result] = await pool.query(
      'UPDATE tb_user SET userPass = ? WHERE studentId = ?',
      [hashedPassword, studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify the update
    const [updatedUser] = await pool.query(
      'SELECT userPass FROM tb_user WHERE studentId = ?',
      [studentId]
    );

    const isPasswordValid = await bcrypt.compare(newPassword, updatedUser[0].userPass);

    res.json({
      success: true,
      message: 'Password updated successfully',
      data: {
        studentId,
        passwordSet: !!updatedUser[0].userPass,
        passwordMatches: isPasswordValid,
        hash: updatedUser[0].userPass
      }
    });

  } catch (error) {
    console.error('Error fixing student password:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 