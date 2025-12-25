import express from 'express';
import multer from 'multer';

const { getServices, createService, deleteService } = require("../controllers/serviceController");

const router = express.Router();

// Set up image upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// API Endpoints
router.get("/services", getServices); // Get all services
router.post("/create", upload.single("image"), createService); // Add service with image upload
router.delete("/:id", deleteService); // Delete a service

module.exports = router;