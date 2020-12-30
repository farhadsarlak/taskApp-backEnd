const express = require("express");
const Task = require("../models/task");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/tasks", auth, async (req, res) => {
    // const task = new Task(req.body);

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save();
        res.status(201).json({
            message: "Task has been created successful",
            data: task
        })
    } catch (error) {
        res.status(400).json({
            message: "create Task failed",
            error
        })
    }
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0
// GET /task?sort=createdAt:desc
router.get("/tasks/me", auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === "true"
    }
    if (req.query.sort) {
        const parts = req.query.sort.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1
    }
    try {
        // const tasks = await Task.find({ owner: req.user._id });

        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        // if (!tasks || tasks.length === 0) {
        //     return res.status(404).send({ message: "there is no task" })
        // }
        res.status(200).send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
});

router.get("/tasks/:id", auth, async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Task.findOne({ _id: id, owner: req.user._id })
        if (!task) {
            return res.status(404).send({ message: "task not found" });
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error)
    }
});

router.patch("/tasks/:id", auth, async (req, res) => {
    const { id } = req.params;
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).json({
            error: "invalid property"
        })
    }
    try {
        // const task = await Task.findById(id);
        const task = await Task.findOne({ _id: id, owner: req.user._id })

        if (!task) {
            return res.status(404).json({ error: "task not found" })
        }

        updates.forEach(item => task[item] = req.body[item]);

        await task.save()
        res.status(200).send(task);

    } catch (error) {
        res.status(400).json({
            error
        })
    }
});

router.delete("/tasks/:id", auth, async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Task.findOneAndDelete({ _id: id, owner: req.user._id });
        if (!task) {
            return res.status(404).json({
                message: "task not found"
            })
        }
        res.status(200).json({ message: "task has been deleted" })
    } catch (error) {
        res.status(400).json({
            error
        })
    }
})



module.exports = router