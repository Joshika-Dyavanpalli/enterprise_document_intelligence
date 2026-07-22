const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password:hashedPassword });
  
    return res.status(201).json({
      success: true,
      message: "Signup Successfull",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both fields are required'
      })
    }
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not Found",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password does not match'
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
      },
        process.env.JWT_SECRET
      );
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token
    });
  }catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
  }
}

function getProfile(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Welcome to your profile',
    user:req.user
  });
}

module.exports = { signup, login, getProfile };
