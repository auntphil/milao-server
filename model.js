import { Schema, mongoose } from 'mongoose'

const ReactionSchema = new Schema({
    senderID: {
        type: String,
        required: true
    },
    reaction: {
        type: String,
        required: true
    },
    msgID: {
        type: String,
        required: true
    }
})

const MessageSchema = new Schema({
    senderID: {
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

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    }
})


const Message = mongoose.model('Message', MessageSchema)
const Reaction = mongoose.model('Reaction', ReactionSchema)
const User = mongoose.model('User', UserSchema)
export { Message, Reaction, User }