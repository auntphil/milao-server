import crypto from 'crypto'

import {Message} from '../models/Messages.js'
import {Reaction} from '../models/Reactions.js'
import {User} from '../models/Users.js'

import { createAccssToken, createRefreshToken, decodeRefreshToken } from '../utils/JWTTokens.js'
import { ComparePassword } from '../utils/Bcrypt.js'
import { checkAuthorization, checkRefresh } from '../utils/Permissions.js'

const Mutation = {
    /**
     * Create a new message and save to the MongooseDB
     */
    createMessage: async (parent, args, context, info) => {
        if(!await checkAuthorization(context.user))throw new Error("Not Authorized")
        const { message, date, extra} = args.messageInput
        const msgObject = new Message({ userId: context.user._id, message, date, extra })
        return msgObject.save()
        .then(result => result._doc)
        .catch (err => console.error(err))
    },

    /**
     * Add a reaction to a message and save to the MongooseDB
     */
    
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

    /**
     * Remove a reaction from a message
     */
    
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

    /**
     * Create a new user
     */

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
            counter: crypto.randomBytes(20).toString('hex')
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

    /**
     * User Login
     */

    async login(_, {loginInput: { email, password }}){
        //Getting User
        const user = await User.findOne({ email })
            .then(user => user)

        //Checking Username
        if(!user) throw new Error("Password or Email is incorrect.")

        //Checking Password
        await ComparePassword(password, user)

        user.counter = await crypto.randomBytes(20).toString('hex')
        
        //Create Tokens
        const accessToken = await createAccssToken(user, email)
        const refreshToken = await createRefreshToken(user, email)
        user.token = accessToken
        user.refresh = refreshToken

        const saved = await User.findOneAndUpdate({_id: user._id},{counter: user.counter})
            .then( res => res._doc)
            .catch( err => null)
        if(!saved) throw new Error("Could Not Login")
        return user
    },

    /**
     * User Logout
     */

    logout: async (parent, args, context, info) => {
        if(!await checkAuthorization(context.user))throw new Error("Not Authorized")
        return User.findOneAndUpdate({_id: context.user._id},{counter: crypto.randomBytes(20).toString('hex')})
            .then(res => { return {acknowledged: true, success: true }})
            .catch(err => { return {acknowledged: true, success: false, message: err }})
        },
        
        /**
         * Access Token refresh
         */
        
        validateToken: async(_, {tokenInput: {refreshToken}}) =>{
            const token = decodeRefreshToken(refreshToken)
            if(!await checkRefresh(token))throw new Error("Not Authorized")
            
            return User.findOneAndUpdate({_id: token._id},{counter: crypto.randomBytes(20).toString('hex')}, { new: true })
            .then(async res => { 
                const user = res._doc
                //Create Tokens
                const accessToken = await createAccssToken(user, user.email)
                const refreshToken = await createRefreshToken(user, user.email)

                //Adding new tokens to user
                user.token = accessToken
                user.refresh = refreshToken
                return user
            })
            .catch(err => { return {acknowledged: true, success: false, message: err }})
    }

}

export default Mutation