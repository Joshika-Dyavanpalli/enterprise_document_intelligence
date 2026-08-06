const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const uploadToAI = async (filePath, originalName) => {
  try {
    const form = new FormData();

    form.append("file", fs.createReadStream(filePath), originalName);

    const response = await axios.post("http://127.0.0.1:8000/upload", form, {
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
  const response = await axios.post("http://127.0.0.1:8000/query", {
    vector_path: vectorPath,
    chunks_path: chunksPath,
    question: question,
  });

  return response.data;
};

module.exports = {
  uploadToAI,
  askAI,
};
