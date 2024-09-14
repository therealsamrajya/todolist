import {Todo} from "../models/todo.model.js"
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from 'mongoose';

// Create a new task
const createTask = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  const newTask = await Todo.create({ userId, title, description, completed: false });
  return res.status(201).json(new ApiResponse(201, newTask, "Task created successfully"));
});

// Get all tasks for a user
const getAllTasks = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tasks = await Todo.find({ userId });
  return res.status(200).json(new ApiResponse(200, tasks, "Tasks retrieved successfully"));
});

// Get a single task by ID
const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Todo.findById(id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!task.userId.equals(new mongoose.Types.ObjectId(req.user.id))) {
    throw new ApiError(403, "You do not have permission to access this task");
  }

  return res.status(200).json(new ApiResponse(200, task, "Task retrieved successfully"));
});

// Update a task
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  const task = await Todo.findById(id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!task.userId.equals(new mongoose.Types.ObjectId(req.user.id))) {
    throw new ApiError(403, "You do not have permission to update this task");
  }

  task.title = title !== undefined ? title : task.title;
  task.description = description !== undefined ? description : task.description;
  task.completed = completed !== undefined ? completed : task.completed;

  await task.save();

  return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
});

// Delete a task
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Todo.findById(id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!task.userId.equals(new mongoose.Types.ObjectId(req.user.id))) {
    throw new ApiError(403, "You do not have permission to delete this task");
  }

  await Todo.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"));
});

export { createTask, getAllTasks, getTaskById, updateTask, deleteTask };