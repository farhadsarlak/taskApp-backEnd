const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("email is not valid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("password can't contain password")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("age must be positive number")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer,
    }
}, {
    timestamps: true
});

userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
})

userSchema.method("generateAuthToken", async function () {
    const user = this;

    const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "14d" });
    user.tokens = user.tokens.concat({ token });
    await user.save()
    return token;
});

// ------------ remove password and token and avatar for get profile
userSchema.method("toJSON", function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar

    return userObject;

});

userSchema.static("findUserByEmail", async function (email, password) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Unable to login")
    }
    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
        throw new Error("Unable to login")
    }

    return user;
})

//  hash password before saving 
userSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next()
});

// ---------delete tasks when user removed--------
userSchema.pre("remove", async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id })
    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;