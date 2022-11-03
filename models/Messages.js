import { Schema, mongoose } from 'mongoose'

const MessageSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Number,
        required: true
    },
    extra: {
        type: String,
        require: true
    }
})

const Message = mongoose.model('Message', MessageSchema)
export { Message }