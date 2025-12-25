import express from 'express';
import Package from "../models/weddingpck.models.js";

const router = express.Router();

// Add a new wedding package
router.post('/addPack', async (req, res) => {
    const { pckCode, packageName, price, description, image } = req.body;

    if (!pckCode || !packageName || !price || !description || !image) {
        return res.status(400).json({ success: false, error: "Please provide all the fields" });
    }

    try {
        const existingPck = await Package.findOne({ pckCode });

        if (existingPck) {
            return res.status(409).json({ success: false, error: "Package already exists" });
        }

        const newPack = new Package({ pckCode, packageName, price, description, image });
        await newPack.save();

        res.status(201).json({ success: true, message: "Package Added Successfully!", data: newPack });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: `Server error: ${e.message}` });
    }
});

// Get all wedding packages
router.get('/getpck', async (req, res) => {
    try {
        const packages = await Package.find({});
        res.status(200).json({ success: true, data: packages }); // Fixed variable name
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: `Server error: ${e.message}` });
    }
});

// DELETE a package
router.delete('/deletepck/:id', async (req, res) => {
    try {
        const deletedPackage = await Package.findByIdAndDelete(req.params.id);
        if (!deletedPackage) {
            return res.status(404).json({ success: false, error: "Package not found" });
        }
        res.status(200).json({ success: true, message: "Package deleted successfully" });
    } catch (e) {
        res.status(500).json({ success: false, error: `Server error: ${e.message}` });
    }
});

// UPDATE a package
router.put('/updatepck/:id', async (req, res) => {
    try {
        const updatedPackage = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPackage) {
            return res.status(404).json({ success: false, error: "Package not found" });
        }
        res.status(200).json({ success: true, message: "Package updated successfully", data: updatedPackage });
    } catch (e) {
        res.status(500).json({ success: false, error: `Server error: ${e.message}` });
    }
});


export default router;
