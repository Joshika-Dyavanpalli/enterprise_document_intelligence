const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const uploadToAI = async (filePath, originalName) => {
  try {
    const form = new FormData();

    form.append("file", fs.createReadStream(filePath), originalName);

    const response = await axios.post("http://ai-service:8000/upload", form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    throw err;
  }
};

const askAI = async (vectorPath, chunksPath, question) => {
  try {
    const startTime = Date.now();

    console.log("AI QUERY START:", question);

    const response = await axios.post(
      "http://ai-service:8000/query",
      {
        vector_path: vectorPath,
        chunks_path: chunksPath,
        question: question,
      },
      {
        timeout: 180000,
      },
    );

    console.log("AI QUERY RESPONSE TIME:", `${Date.now() - startTime} ms`);

    return response.data;
  } catch (error) {
    console.error("AI QUERY ERROR:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  uploadToAI,
  askAI,
};
