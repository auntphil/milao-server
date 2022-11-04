import { Schema, mongoose } from 'mongoose'
import bcrypt from 'bcrypt'

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
    counter: {
        type: Number,
        require: true
    }
})

UserSchema.pre('save', async function (next) {
    try{
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(this.password, salt);
        this.password = hash
        next()
    }catch(error){
        next(error)
    }
})

const User = mongoose.model('User', UserSchema)
export { User }