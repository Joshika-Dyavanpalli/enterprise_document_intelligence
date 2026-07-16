const express = require("express");
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  console.log(req.body);
  res.send("Home page");
});

app.get("/about", (req, res) => {
  res.send("About section");
});

app.listen(5000, () => {
  console.log("server started on the port 5000");
});
