const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

const avatar = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i)) {
            return cb(new Error("file must be an image"))
        }
        cb(undefined, true)
    }
})


const router = express.Router();

router.post("/users", async (req, res) => {
    const user = new User(req.body);
    try {

        const token = await user.generateAuthToken();
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        res.status(201).json({
            message: "user create successful",
            data: { user, token }
        })
    } catch (error) {
        res.status(400).json({
            message: "create user failed",
            error
        })
    }
});

router.post("/users/login", async (req, res) => {

    const { email, password } = req.body;

    try {
        const user = await User.findUserByEmail(email, password);
        const token = await user.generateAuthToken();

        res.status(200).json({
            message: "login successfull",
            data: {
                user,
                token
            }
        })

    } catch (error) {
        res.status(400).json({ error })
    }
});

router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send(error)
    }
});

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
});


router.get("/users/me", auth, async (req, res) => {
    res.send(req.user)
});

router.get("/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ message: "user not found" })
        }
        res.status(200).send(user)
    } catch (error) {
        res.status(500).json({
            message: "some things went wrong",
            error
        })
    }
});

router.patch("/users/me", auth, async (req, res) => {
    const { id } = req.user._id;
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).json({
            error: "invalid property"
        })
    }
    try {
        // const user = await User.findById(id);
        updates.forEach(item => req.user[item] = req.body[item]);
        // const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        await req.user.updateOne(req.user);

        // if (!user) {
        //     return res.status(404).send({ message: 'user not found' })
        // }
        return res.status(200).json(req.user)
    } catch (error) {
        res.status(400).json({
            error
        })
    }
});

router.delete("/users/me", auth, async (req, res) => {
    // const { id } = req.params;
    try {

        // const user = await User.findByIdAndDelete(req.user._id);
        // if (!user) {
        //     return res.status(404).json({
        //         message: "user not found"
        //     })
        // }
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name)
        res.status(200).json({ message: "your profile has been deleted", data: req.user })
    } catch (error) {
        res.status(400).json({
            error
        })
    }
});

router.post("/users/me/avatar", auth, avatar.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(200).json({
        message: "your avatar uploaded successful"
    });
}, (error, req, res, next) => {
    res.status(400).json({
        error: error.message
    })
});

router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;
    try {
        await req.user.save();
        res.status(200).json({
            message: "your avatar has been deleted"
        });
    } catch (error) {
        res.status(400).json({
            error
        })
    }
});

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set("Content-Type", "image/jpg");
        res.status(200).send(user.avatar)
    } catch (error) {
        res.status(404).json({
            error: "not found"
        })
    }
})

module.exports = router;