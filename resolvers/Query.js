import {Message} from '../models/Messages.js'
import {User} from '../models/Users.js'
import { checkAuthorization } from '../utils/Permissions.js'

const Query = {
    messages: async (parent, args, context, info) => {
        if(!await checkAuthorization(context.user))throw new Error("Not Authorized")
        return Message.find()
            .then( message => message.map(r => ({...r._doc})))
            .catch(err => console.error(err))
    },
    users: async (parent, args, context, info) => {
        if(!await checkAuthorization(context.user))throw new Error("Not Authorized")

        return User.find()
            .then(user=> user.map(r => ({...r._doc})))
            .catch(err => console.error(err))
    },
    user: async (parent, args, context, info) => {
        if(!await checkAuthorization(context.user))throw new Error("Not Authorized")
        const { id } = args
        return User.findById(id)
            .then( user => user._doc)
            .catch(err => console.error(err))
    }
}

export default Query