import { Schema, mongoose } from 'mongoose'

const ReactionSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    reaction: {
        type: String,
        required: true
    },
    msgId: {
        type: String,
        required: true
    }
})

const Reaction = mongoose.model('Reaction', ReactionSchema)
export { Reaction }