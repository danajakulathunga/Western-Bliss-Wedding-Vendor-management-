import express from 'express';
import Schedule from '../models/Schedule.js';

const router = express.Router();

// Get all schedules
router.get('/', async (req, res) => {
    try {
        const schedules = await Schedule.find().sort({ date: 1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new schedule
router.post('/', async (req, res) => {
    try {
        const schedule = new Schedule({
            title: req.body.title,
            date: new Date(req.body.date),
            time: req.body.time,
            description: req.body.description,
            priority: req.body.priority
        });

        const newSchedule = await schedule.save();
        res.status(201).json(newSchedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a schedule
router.put('/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        schedule.title = req.body.title || schedule.title;
        schedule.date = req.body.date ? new Date(req.body.date) : schedule.date;
        schedule.time = req.body.time || schedule.time;
        schedule.description = req.body.description || schedule.description;
        schedule.priority = req.body.priority || schedule.priority;
        schedule.status = req.body.status || schedule.status;

        const updatedSchedule = await schedule.save();
        res.json(updatedSchedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a schedule
router.delete('/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        await schedule.deleteOne();
        res.json({ message: 'Schedule deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single schedule
router.get('/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 