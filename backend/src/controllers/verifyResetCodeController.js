// controllers/verifyResetCodeController.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// POST /api/auth/verify-code
router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: "Code expired or user not found" });

    const isMatch = await bcrypt.compare(code, user.resetCode);
    if (!isMatch) return res.status(400).json({ error: "Invalid verification code" });

    res.json({ message: "Code verified. You may now reset your password." });
  } catch (err) {
    console.error("Code Verification Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
