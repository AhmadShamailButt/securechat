// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // store locally or use cloud (e.g., Cloudinary)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.put("/update-profile", upload.single("profilePic"), async (req, res) => {
  try {
    const { fullName, department, password, userId } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (department) updateData.department = department;
    if (req.file) updateData.profilePic = req.file.filename;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
