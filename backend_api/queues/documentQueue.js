const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");

const documentQueue = new Queue("document-processing", {
  connection: redisConnection,
});

module.exports = documentQueue;
