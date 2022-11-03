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
    messageId: {
        type: String,
        required: true
    }
})

const Reaction = mongoose.model('Reaction', ReactionSchema)
export { Reaction }