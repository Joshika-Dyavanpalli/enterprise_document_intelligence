const users = [];

function signup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All Fields are Required",
    });
  }

  for (let i = 0; i < users.length; i++) {
    if (email == users[i].email) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }
  }
  users.push({name,email,password});

  res.status(201).json({
    success: true,
    message: "Signup Successfull",
  });
}

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message:'Both fields are required'
    })
  }
  
  for (let i = 0; i < users.length; i++){
    if (email == users[i].email) {
      if (password == users[i].password) {
        return res.status(200).json({
          success:true,
          message:'login successful'
        })
      } else {
        return res.status(401).json({
          success: false,
          message:'passwords do not match'
        })
      }
    }
  }
  return res.status(401).json({
    success: false,
    message: "user not found",
  });
}

module.exports = { signup, login };
