import {Reaction} from '../models/Reactions.js'
import {User} from '../models/Users.js'

const Message = {
    reaction: parent => {
        return Reaction.find({msgId: parent._id})
            .then( reaction => reaction.map(r => ({...r._doc})))
            .catch(err => console.error(err))
    },
    user: parent => {
        return User.findById(parent.userId)
            .then( user => user._doc)
            .catch(err => console.error(err))
    }
}

export default Message