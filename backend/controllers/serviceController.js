const Service = require("../models/serviceModel.js");
const fs = require("fs");
const path = require("path");

// @desc Get all services
const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error.message);
    res.status(500).json({ message: "Error fetching services" });
  }
};

// @desc Create a new service
const createService = async (req, res) => {
  try {
    const { name, description, ownerName, email, contact, address } = req.body;

    // Validate required fields
    if (!name || !description || !ownerName || !email || !contact || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Check for image upload
    if (!req.file) {
      return res.status(400).json({ message: "Image upload is required." });
    }

    const image = req.file.filename; // Store only filename, not full path

    const newService = new Service({
      name: name.trim(),
      image,
      description: description.trim(),
      ownerName: ownerName.trim(),
      email: email.trim(),
      contact: contact.trim(),
      address: address.trim(),
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    console.error("Error adding service:", error.message);
    res.status(500).json({ message: "Error adding service" });
  }
};

// @desc Delete a service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Delete associated image from uploads folder
    const imagePath = path.join(__dirname, "..", "uploads", service.image); // Ensure correct path

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Service.findByIdAndDelete(id);
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error.message);
    res.status(500).json({ message: "Error deleting service" });
  }
};

module.exports = { getServices, createService, deleteService };
