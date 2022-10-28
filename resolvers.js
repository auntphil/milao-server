import { Message, Reaction, User } from './model.js'

const resolvers = {
    Query: {
        messages (parent, args, context, info){
            return Message.find()
                .then( message => message.map(r => ({...r._doc})))
                .catch(err => console.error(err))
        },
        users (parent, args, context, info){
            return User.find()
                .then(user=> user.map(r => ({...r._doc})))
                .catch(err => console.error(err))
        },
        user (parent, args, context, info){
            const { id } = args
            return User.findById(id)
                .then( user => user._doc)
                .catch(err => console.error(err))
        }
    },

    
    Message: {
        reaction: parent => {
            return Reaction.find({msgID: parent._id})
            .then( reaction => reaction.map(r => ({...r._doc})))
            .catch(err => console.error(err))
        },
        sender: parent => {
            return User.findById(parent.senderID)
                .then( user => user._doc)
                .catch(err => console.error(err))
        }
    },

    Reaction: {
        sender: parent => {
            return User.findById(parent.senderID)
                .then( user => user._doc)
                .catch(err => console.error(err))
        }
    },

    Mutation: {
        addMessage (parent, args, context, info){
            const {senderID, message, date, extra} = args
            const msgObject = new Message({
                senderID,
                message,
                date,
                extra
            })
            return msgObject.save()
                .then(result => result._doc)
                .catch (err => console.error(err))
        },
        
        addReaction (parent, args, context, info){
            const {senderID, reaction, msgID} = args
            const reactionObject = new Reaction({
                senderID,
                reaction,
                msgID
            })
            return reactionObject.save()
                .then(result => result._doc)
                .catch (err => console.error(err))
        },

        addUser (parent, args, context, info){
            const {name} = args
            const userObject = new User({
                name
            })
            return userObject.save()
                .then(result => result._doc )
                .catch(err => console.error(err))
        }
    }
}

export { resolvers }
