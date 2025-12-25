import Shedule from "../model/userModel.js";
import crypto from 'crypto';

export const create = async (req, res) => {
  try {
    const newUser = new Shedule(req.body);
    const { email } = newUser;

    const userExist = await Shedule.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists." });
    }
    const savedData = await newUser.save();
    res.status(200).json({ message: "User created successfully." });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const userData = await Shedule.find();
    if (!userData || userData.length === 0) {
      return res.status(404).json({ message: "User data not found." });
    }
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await Shedule.findById(id);
    if (!userExist) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(userExist);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await Shedule.findById(id);
    if (!userExist) {
      return res.status(404).json({ message: "User not found." });
    }
    const updatedData = await Shedule.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "User Updated successfully." });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await Shedule.findById(id);
    if (!userExist) {
      return res.status(404).json({ message: "User not found." });
    }
    await Shedule.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await Shedule.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Generate reset token (you can use crypto or any other method)
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Save reset token and expiry to user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
        await user.save();

        // Create reset URL
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        // Send email with reset link (you'll need to implement this)
        // For now, we'll just return the reset URL
        res.status(200).json({
            success: true,
            message: "Password reset email sent",
            data: {
                resetUrl // In production, don't send this back
            }
        });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Error processing password reset request"
        });
    }
};