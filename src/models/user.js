const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const UserSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim: true
    }, 
    email : {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }

    },
    age : {
        type: Number,
        default : 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number.')
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        min : [6, 'Length must be greater than 6'],
        validate(value ) {
            if(value.includes('password')) {
                throw new Error('Password must be something different')
            }
        }
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }],
    avatar : {
        type : Buffer
    }
}, {
    timestamps: true
})

//To set a ref of another model
UserSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

UserSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

//methods use over any instance
UserSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id : user._id.toString() }, process.env.JWT_SECERET)

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
} 

//statics use over any model value 
UserSchema.statics.findByCrdentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Hash the plain text password before saving
UserSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//delete the tasks if user is deleted
UserSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User