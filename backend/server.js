import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Package from "./routes/pck.routes.js";
import Booking from "./routes/bookingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import route from "./routes/userRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import reviewRoutes from './routes/reviews.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
dotenv.config();

const server = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
server.use(cors({
    // Allow requests from both ports or use a wildcard for development
    origin: ["http://localhost:5173", "http://localhost:5174"],
    // Alternative: use origin: true to allow all origins during development
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use("/api",Package);
server.use('/api',Booking);
server.use('/api/auth', authRoutes);
server.use("/api", route);
server.use("/api", reviewRoute);
server.use('/api/reviews', reviewRoutes);
server.use('/api/schedule', scheduleRoutes);

// Ensure uploads directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up the uploads directory as a static file server
server.use('/uploads', express.static(uploadsDir));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);

        if (mime && ext) {
            return cb(null, true);
        }
        cb(new Error("Only .jpeg, .jpg, and .png files are allowed."));
    },
});

// MongoDB Connection
const connectDB = async () => {
    if (!MONGO_URI) {
        console.error("❌ MONGO_URI is not defined in .env.");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log("🔥 MongoDB Connected Successfully!");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

connectDB();

// Service Schema & Model
const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    category: { type: String, required: true }, // Added category field
    image: { type: String, required: true },
});

const Service = mongoose.model("Service", serviceSchema);

// Routes
server.get("/", (req, res) => res.send("<h1>Welcome to Western Bliss Wedding Vendor API</h1>"));
server.get("/vendors", (req, res) => res.send("<h1>Vendor Page</h1>"));

// **Create Service**
server.post("/api/services/create", upload.single("image"), async (req, res) => {
    try {
        const { name, description, ownerName, email, contact, address, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "Image upload is required." });
        }

        const service = new Service({
            name,
            description,
            ownerName,
            email,
            contact,
            address,
            category, // Include category
            image: req.file.filename,
        });

        await service.save();
        res.status(201).json({ message: "Service added successfully!" });
    } catch (error) {
        console.error("POST /api/services Error:", error.message);
        res.status(500).json({ error: "Failed to add service." });
    }
});


// **Get All Services**
server.get("/api/services", async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        console.error("GET /api/services Error:", error.message);
        res.status(500).json({ error: "Failed to fetch services." });
    }
});

// **Delete Service**
server.delete("/api/services/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({ error: "Service not found." });
        }

        // Delete associated image
        const imagePath = path.join(uploadsDir, service.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Service.findByIdAndDelete(id);
        res.json({ message: "Service deleted successfully." });
    } catch (error) {
        console.error("DELETE /api/services/:id Error:", error.message);
        res.status(500).json({ error: "Failed to delete service." });
    }
});

// **Update Service**
server.put("/api/services/:id", (req, res) => {
    upload.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            const { id } = req.params;
            const { name, description, ownerName, email, contact, address, category } = req.body;
            const updatedData = { name, description, ownerName, email, contact, address, category };

            const service = await Service.findById(id);
            if (!service) {
                return res.status(404).json({ error: "Service not found." });
            }

            // If new image uploaded, delete old image
            if (req.file) {
                const oldImagePath = path.join(uploadsDir, service.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
                updatedData.image = req.file.filename;
            }

            await Service.findByIdAndUpdate(id, updatedData, { new: true });
            res.json({ message: "Service updated successfully!" });
        } catch (error) {
            console.error("PUT /api/services/:id Error:", error.message);
            res.status(500).json({ error: "Failed to update service." });
        }
    });
});

// Error Handling Middleware
server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port : ${PORT}`);
});