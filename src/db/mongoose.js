const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });


// const me = new User({
//     name: "    Ali    ",
//     email: "ALI.mordaI@gmail.com",
//     password: "PassWorD"
// });




// const newTask = new Task({
//     description: "   tesk task with space and completed with default value",
// });

// newTask.save().then(() => {
//     console.log(newTask)
// }).catch((err) => {
//     console.log("Error", err.message)
// })