const app = require("./app.js");
const PORT = 5000;

const connectDB = require("./config/database.js");

connectDB();

require("./workers/documentWorker");

app.listen(PORT, () => {
  console.log("server started");
});
