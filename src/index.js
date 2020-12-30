const express = require("express");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
require("./db/mongoose");

const app = express();
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

const port = process.env.PORT;

app.listen(port, () => {
    console.log("server run on port " + port)
})