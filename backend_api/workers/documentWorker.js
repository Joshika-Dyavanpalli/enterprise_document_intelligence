const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const Document = require("../models/documents");
const { uploadToAI } = require("../services/aiService");

const documentWorker = new Worker(
  "document-processing",
  async (job) => {
    const { documentId, filePath, originalName } = job.data;

    console.log(`Processing document job: ${job.id}`);
    console.log(`Document: ${originalName}`);

    // Mark document as processing
    await Document.findByIdAndUpdate(documentId, {
      processingStatus: "processing",
    });

    try {
      // Send document to FastAPI AI service
      const result = await uploadToAI(filePath, originalName);

      // Save AI processing results
      await Document.findByIdAndUpdate(documentId, {
        extractedText: result.text || "",
        vectorPath: result.vector_path,
        chunksPath: result.chunks_path,
        chunkCount: result.chunk_count || 0,
        processingStatus: "completed",
      });

      console.log(`Document job ${job.id} completed`);

      return result;
    } catch (error) {
      // Mark document as failed
      await Document.findByIdAndUpdate(documentId, {
        processingStatus: "failed",
      });

      console.error(`Document job ${job.id} failed:`, error.message);

      throw error;
    }
  },
  {
    connection: redisConnection,
  },
);

documentWorker.on("completed", (job) => {
  console.log(`Document job ${job.id} completed successfully`);
});

documentWorker.on("failed", (job, error) => {
  console.error(`Document job ${job?.id} failed:`, error.message);
});

console.log("Document worker started");

module.exports = documentWorker;
