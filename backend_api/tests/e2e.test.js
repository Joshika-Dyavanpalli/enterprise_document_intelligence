const request = require("supertest");
const mongoose = require("mongoose");

const User = require("../models/User");
const Chat = require("../models/Chat");
const Document = require("../models/documents");

jest.mock("../config/redis", () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock("../queues/documentQueue", () => ({
  add: jest.fn(),
}));

jest.mock("../services/aiService", () => ({
  askAI: jest.fn(),
}));

const app = require("../app");

const { askAI } = require("../services/aiService");
const redisConnection = require("../config/redis");

describe("Document Q&A E2E Flow", () => {
  let token;
  let userId;
  let chatId;
  let documentId;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";

    await mongoose.connect("mongodb://127.0.0.1:27017/enterprise_test_db");

    await User.deleteMany({});
    await Chat.deleteMany({});
    await Document.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Document.deleteMany({});

    await mongoose.connection.close();
  });

  test("should complete signup → login → create chat → ask question", async () => {
    // --------------------------------------------------
    // 1. SIGNUP
    // --------------------------------------------------

    const signupResponse = await request(app).post("/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(signupResponse.statusCode).toBe(201);

    // --------------------------------------------------
    // 2. LOGIN
    // --------------------------------------------------

    const loginResponse = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.token).toBeDefined();

    token = loginResponse.body.token;
    userId = loginResponse.body.user.id;

    // --------------------------------------------------
    // 3. CREATE TEST DOCUMENT
    // --------------------------------------------------

    const document = await Document.create({
      userId,
      filename: "test.pdf",
      originalName: "test.pdf",
      fileType: "application/pdf",
      filePath: "test/test.pdf",
      vectorPath: "test/test.index",
      chunksPath: "test/test.pkl",
      processingStatus: "completed",
    });

    documentId = document._id;

    // --------------------------------------------------
    // 4. CREATE CHAT
    // --------------------------------------------------

    const chatResponse = await request(app)
      .post("/chat/new")
      .set("Authorization", `Bearer ${token}`)
      .send({
        documentId: documentId.toString(),
      });

    expect(chatResponse.statusCode).toBe(201);
    expect(chatResponse.body.success).toBe(true);

    chatId = chatResponse.body.chat._id;

    // --------------------------------------------------
    // 5. MOCK REDIS CACHE MISS
    // --------------------------------------------------

    redisConnection.get.mockResolvedValue(null);

    // --------------------------------------------------
    // 6. MOCK AI RESPONSE
    // --------------------------------------------------

    askAI.mockResolvedValue({
      answer: "FAISS is a library used for similarity search.",
    });

    // --------------------------------------------------
    // 7. ASK QUESTION
    // --------------------------------------------------

    const questionResponse = await request(app)
      .post("/chat/ask")
      .set("Authorization", `Bearer ${token}`)
      .send({
        chatId,
        documentId: documentId.toString(),
        question: "What is FAISS?",
      });

    expect(questionResponse.statusCode).toBe(200);
    expect(questionResponse.body.success).toBe(true);

    expect(questionResponse.body.answer).toBe(
      "FAISS is a library used for similarity search.",
    );

    expect(askAI).toHaveBeenCalledWith(
      "test/test.index",
      "test/test.pkl",
      "What is FAISS?",
    );

    expect(redisConnection.set).toHaveBeenCalledWith(
      expect.stringContaining("qa:"),
      "FAISS is a library used for similarity search.",
      "EX",
      3600,
    );
  });
});
