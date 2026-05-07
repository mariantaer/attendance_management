const express = require("express");
const cors = require("cors");

const auth = require("./routes/auth");
const admin = require("./routes/admin");
const teacher = require("./routes/teacher");
const attendance = require("./routes/attendance");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", auth);
app.use("/admin", admin);
app.use("/teacher", teacher);
app.use("/attendance", attendance);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3001");
});