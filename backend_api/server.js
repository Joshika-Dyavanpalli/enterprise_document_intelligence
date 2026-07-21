const app = require('./app.js');
const PORT = 5000;

const connectDB = require('./config/database.js');

connectDB();

app.listen(PORT, () => {
  console.log('server started');
});
