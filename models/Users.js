import { Schema, mongoose } from 'mongoose'

const UserSchema = new Schema({
    display: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        require: false
    }
})

const User = mongoose.model('User', UserSchema)
export { User }