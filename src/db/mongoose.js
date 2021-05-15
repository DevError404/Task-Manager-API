const mongoose = require('mongoose')

const path = process.env.MONGODB_PATH


mongoose.connect(path , {
    useNewUrlParser: true,
    useCreateIndex: true
})


