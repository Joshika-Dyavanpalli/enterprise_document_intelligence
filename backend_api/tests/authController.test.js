jest.mock("../queues/documentQueue");
const { signup, login } = require("../controllers/authController");

const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Authentication Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("signup", () => {
    test("should return 400 when required fields are missing", async () => {
      req.body = {
        name: "Joshika",
        email: "joshika@example.com",
      };

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "All Fields are Required",
      });
    });

    test("should return 409 when email already exists", async () => {
      req.body = {
        name: "Joshika",
        email: "joshika@example.com",
        password: "password123",
      };

      User.findOne.mockResolvedValue({
        email: "joshika@example.com",
      });

      await signup(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        email: "joshika@example.com",
      });

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email already exists",
      });
    });

    test("should create a user successfully", async () => {
      req.body = {
        name: "Joshika",
        email: "joshika@example.com",
        password: "password123",
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed-password");
      User.create.mockResolvedValue({
        name: "Joshika",
        email: "joshika@example.com",
        password: "hashed-password",
        role: "Viewer",
      });

      await signup(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

      expect(User.create).toHaveBeenCalledWith({
        name: "Joshika",
        email: "joshika@example.com",
        password: "hashed-password",
        role: "Viewer",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Signup Successful",
      });
    });
  });

  describe("login", () => {
    test("should return 400 when email or password is missing", async () => {
      req.body = {
        email: "joshika@example.com",
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Both fields are required",
      });
    });

    test("should return 401 when user does not exist", async () => {
      req.body = {
        email: "joshika@example.com",
        password: "password123",
      };

      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not Found",
      });
    });

    test("should return 401 when password is incorrect", async () => {
      req.body = {
        email: "joshika@example.com",
        password: "wrong-password",
      };

      User.findOne.mockResolvedValue({
        _id: "user123",
        email: "joshika@example.com",
        password: "hashed-password",
        role: "Viewer",
      });

      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrong-password",
        "hashed-password",
      );

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password does not match",
      });
    });

    test("should login successfully and return a JWT", async () => {
      req.body = {
        email: "joshika@example.com",
        password: "password123",
      };

      User.findOne.mockResolvedValue({
        _id: "user123",
        name: "Joshika",
        email: "joshika@example.com",
        password: "hashed-password",
        role: "Viewer",
      });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mock-jwt-token");

      process.env.JWT_SECRET = "test-secret";

      await login(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashed-password",
      );

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: "user123",
          role: "Viewer",
        },
        "test-secret",
        {
          expiresIn: "1d",
        },
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        token: "mock-jwt-token",
        user: {
          id: "user123",
          name: "Joshika",
          email: "joshika@example.com",
          role: "Viewer",
        },
      });
    });
  });
});
