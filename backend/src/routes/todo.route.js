import { Router } from "express";
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask } from "../controllers/todo.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT,createTask);
router.route("/").get(verifyJWT,getAllTasks);
router.route("/:id").get(verifyJWT,getTaskById);
router.route("/:id").put(verifyJWT,updateTask);
router.route("/:id").delete(verifyJWT,deleteTask);

export default router;

