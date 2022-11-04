import {Message} from './models/Messages.js'
import {Reaction} from './models/Reactions.js'
import {User} from './models/Users.js'

import { createAccssToken, createRefreshToken } from './utils/JWTTokens.js'
import { ComparePassword } from './utils/Bcrypt.js'
import { checkAuthorization } from './utils/Permissions.js'

const resolvers = {
    Query: {
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
    },
    
    Message: {
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
    },
    
    Reaction: {
        user: parent => {
            return User.findById(parent.userId)
            .then( user => user._doc)
            .catch(err => console.error(err))
        }
    },
    
    Mutation: {
        createMessage: async (parent, args, context, info) => {
            if(!await checkAuthorization(context.user))throw new Error("Not Authorized")
            const { message, date, extra} = args.messageInput
            const msgObject = new Message({ userId: context.user._id, message, date, extra })
            return msgObject.save()
            .then(result => result._doc)
            .catch (err => console.error(err))
        },
        
        addReaction: async (parent, args, context, info) => {
            if(!await checkAuthorization(context.user))throw new Error("Not Authorized")
            const {reaction, msgId} = args.reactionInput
            
            //Check if user has already left a reaction
            const reactionDb = await Reaction.findOne({userId: context.user._id, msgId})
            if(reactionDb) throw new Error("Message already has reaction from user")
            
            const reactionObject = new Reaction({userId: context.user._id, reaction, msgId})
            return reactionObject.save()
                .then(result => result._doc)
                .catch (err => console.error(err))
        },
        
        removeReaction: async (parent, args, context, info) => {
            if(!await checkAuthorization(context.user))throw new Error("Not Authorized")
            const {id} = args
            return Reaction.deleteOne({userId: context.user._id, _id:id})
                .then( res => {
                    res._id = id
                    return res
                })
                .catch(err => console.error(err))
        },

        async registerUser (_, {registerInput: {email, password}}){

            //checking if chat already has two users
            const countUser = await User.countDocuments()
            if(countUser >= 2 ) throw new Error("Chat is full")

            //checking if email is already used
            const existingUser = await User.findOne({ email })
            if(existingUser) throw new Error("User already exists") 

            //creating new user
            const userObject = new User({
                email: email.toLowerCase(),
                password,
                counter: 0
            })


            //Create Tokens
            const accessToken = createAccssToken(userObject, email)
            const refreshToken = createRefreshToken(userObject, email)

            return userObject.save()
                .then(result => {
                    const user = result._doc
                    user.token = accessToken
                    user.refresh = refreshToken
                    return user
                })
                .catch(err => console.error(err))
        },

        async login(_, {loginInput: { email, password }}){
            //Getting User
            const user = await User.findOne({ email })
                .then(user => user)

            //Checking Username
            if(!user) throw new Error("Password or Email is incorrect.")

            //Checking PAssword
            await ComparePassword(password, user)
            
            //Create Tokens
            const accessToken = await createAccssToken(user, email)
            const refreshToken = await createRefreshToken(user, email)
            user.token = accessToken
            user.refresh = refreshToken


            User.findOneAndUpdate({_id: user._id}, (err, doc) => {
                if(err) throw new Error("Could Not Login")
                return doc
            })
            return user
        },

        logout: async (parent, args, context, info) => {
            if(!await checkAuthorization(context.user))throw new Error("Not Authorized")
            return User.findOneAndUpdate({_id: context.user._id},{$inc: {counter: 1}})
                .then(res => { return {acknowledged: true, success: true }})
                .catch(err => { return {acknowledged: true, success: false, message: err }})
        },
    }
}

export { resolvers }
