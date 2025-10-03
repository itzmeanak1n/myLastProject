// Change password endpoint
router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const studentId = req.user.id;

  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่' 
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' 
    });
  }

  try {
    // Get the current user with password
    const [users] = await pool.query(
      'SELECT userPassword FROM tb_user WHERE studentId = ?',
      [studentId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'ไม่พบข้อมูลผู้ใช้' 
      });
    }

    const user = users[0];
    
    // Verify current password (assuming passwords are hashed with bcrypt)
    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(currentPassword, user.userPassword);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' 
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in the database
    const [result] = await pool.query(
      'UPDATE tb_user SET userPassword = ? WHERE studentId = ?',
      [hashedPassword, studentId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to update password');
    }

    res.json({ 
      success: true, 
      message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' 
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' 
    });
  }
});
