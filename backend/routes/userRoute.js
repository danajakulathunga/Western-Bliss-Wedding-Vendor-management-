import express from "express";
import { register, login, getProfile, updateProfile, getAllUsers, deleteUser, updateUser, resetPassword, verifyOTPAndResetPassword } from "../controller/userController.js";

const route = express.Router();

// Public routes
route.post("/register", register);
route.post("/login", login);
route.post("/reset-password", resetPassword);
route.post("/verify-otp", verifyOTPAndResetPassword);

// Protected routes
route.get("/profile", getProfile);
route.put("/profile", updateProfile);
route.get("/users", getAllUsers);
route.delete("/users/:id", deleteUser);
route.put("/users/:id", updateUser);

export default route;
