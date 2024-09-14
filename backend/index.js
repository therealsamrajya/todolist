import dotenv from 'dotenv'
dotenv.config()
import express from "express"
import mongoose  from 'mongoose'
import userRouter from "./src/routes/user.route.js"
import taskRouter from "./src/routes/todo.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"


const port = process.env.PORT ;
const app = express();
app.use(express.json())
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const mongoURI = process.env.MONGODB_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((error) => {
    console.error("Mongodb connection failed", error);
  });

  app.use("/api/users", userRouter);
  app.use("/api/tasks", taskRouter);


app.get("/", (req, res) => {
    res.send("Express App is Running");
  });
  
  app.listen(port, (error) => {
    if (!error) {
      console.log(`Server running on port ${port}`);
    } else {
      console.log("Error:", error);
    }
  });