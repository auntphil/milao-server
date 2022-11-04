import {Message} from './models/Messages.js'
import {Reaction} from './models/Reactions.js'
import {User} from './models/Users.js'

import { createAccssToken, createRefreshToken, decodeAccessToken } from './utils/JWTTokens.js'
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
        createMessage (_, {messageInput: { message, date, extra}}){
            const msgObject = new Message({ userId: context.user._id, message, date, extra })
            return msgObject.save()
            .then(result => result._doc)
            .catch (err => console.error(err))
        },
        
        addReaction (_, {reactionInput: {reaction, messageId}}){
            if(!context.user)throw new Error("Not Authorized")
            const reactionObject = new Reaction({userId: context.user._id, reaction, messageId})
            return reactionObject.save()
                .then(result => result._doc)
                .catch (err => console.error(err))
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
            userObject.token = refreshToken

            return userObject.save()
                .then(result => {
                    const user = result._doc
                    user.refresh = accessToken
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


            User.findOneAndUpdate({_id: user._id},{token: refreshToken}, (err, doc) => {
                if(err) throw new Error("Could Not Login")
                return doc
            })

            return user


        },

        logout(parent, args, context, info){
            try{
                User.findOneAndUpdate({_id: context.user._id},{token: null, counter: context.user.counter+1}, (err, doc) => {
                    return doc
                })
            }catch(err){
                throw new Error(err)
            }

        },

        removeReaction (parent, args, context, info){
            const {id} = args
            return Reaction.findByIdAndRemove(id)
                    .then( reaction => reaction._doc)
                    .catch(err => console.error(err))
        }
    }
}

export { resolvers }
