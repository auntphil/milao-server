import {Message} from './models/Messages.js'
import {Reaction} from './models/Reactions.js'
import {User} from './models/Users.js'
import bcrypt from 'bcrypt'

import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

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
        createMessage (_, {messageInput: {userId, message, date, extra}}){
            const msgObject = new Message({ userId, message, date, extra })
            return msgObject.save()
                .then(result => result._doc)
                .catch (err => console.error(err))
        },
        
        addReaction (_, {reactionInput: {userId, reaction, messageId}}){
            const reactionObject = new Reaction({userId, reaction, messageId})
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

            //Encrypt Password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            //creating new user
            const userObject = new User({
                email: email.toLowerCase(),
                password: hash
            })


            //Create Access Token
            const accessToken = jwt.sign(
                {_id: userObject._id, email: email.toLowerCase() },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15s'}
                )
                
            //creating refresh token
            const refreshToken = jwt.sign(
                {_id: userObject._id, email: email.toLowerCase() },
                process.env.ACCESS_TOKEN_SECRET,
                {}
            )
            userObject.token = refreshToken

            return userObject.save()
                .then(result => {
                    const user = result._doc
                    user.refresh = accessToken
                    return user
                })
                .catch(err => console.error(err))
        },

        logout(_, args){
            const {userId} = args

            User.findOneAndUpdate({_id: userId},{token: null}, (err, doc) => {
                if(err) throw new Error("Could Not Logout")
                return doc
            })

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
