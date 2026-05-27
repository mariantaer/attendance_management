const express = require("express");
const cors = require("cors");

const auth = require("./routes/auth");
const admin = require("./routes/admin");
const teacher = require("./routes/teacher");
const attendance = require("./routes/attendance");
const sharedRoutes = require("./routes/shared");
const student = require("./routes/student");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", auth);
app.use("/admin", admin);
app.use("/teacher", teacher);
app.use("/attendance", attendance);
app.use("/api", sharedRoutes);
app.use("/admin/students", student);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});