const express = require("express");
const router = express.Router();
const axios = require("axios");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");

let tempUsers = new Map();

router.post("/signup", async (req, res) => {
  const { fullName, department, email, password, gender } = req.body;

  if (!email.endsWith("@lhr.nu.edu.pk")) {
    return res.status(400).json({ error: "Only FAST NUCES emails allowed." });
  }

  if (!gender || !["male", "female", "other"].includes(gender.toLowerCase())) {
    return res.status(400).json({ error: "Invalid gender." });
  }

  try {
    const validateRes = await axios.get(
      `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`
    );

    if (validateRes.data.deliverability !== "DELIVERABLE") {
      return res.status(400).json({ error: "Undeliverable email." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in memory (you can switch to Redis or DB for production)
    tempUsers.set(email, {
      fullName, department, email, password: hashedPassword, gender,
      code: verificationCode,
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"GoFAST Verification" <no-reply@gofast.com>',
      to: email,
      subject: "Verify Your GoFAST Account",
      html: `<p>Your verification code is <b>${verificationCode}</b></p>`,
    });

    return res.status(200).json({ message: "Verification code sent to email." });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = { router, tempUsers };
