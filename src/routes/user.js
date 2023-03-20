import express from 'express'
import bcrypt from 'bcrypt'
import Randomstring from 'randomstring'
import { v4 as uuidv4 } from 'uuid';

import { createAccssToken, createRefreshToken, createTokens, decodeAccessToken } from '../utils/tokens.js'
import { middleware_auth } from '../utils/middleware.js'

const router = express.Router()

router
    // Allow New User Sign Up
    .post('/signup' ,async (req, res) => {
        const { username, password } = req.body
        
        bcrypt.hash(password, 8, async (err, hash) => {
            //Create a new user
            try{
                const id = uuidv4()
                const result = await req.conn.query(`INSERT INTO users (_id, username, password) VALUES ("${id}","${username}", "${hash}")`)
                const user = await req.conn.query(`SELECT _id, username, name FROM users WHERE _id = ${result.insertId}`)
                const locker = Randomstring.generate()
                const token = await createAccssToken(user[0], req.conn)
                const rtoken = await createRefreshToken(user[0], locker, req.conn)
                await req.conn.query(`UPDATE users SET token="${token}", rtoken="${rtoken}", locker="${locker}" WHERE _id = "${user[0]._id}"`)
                res
                    .status(200)
                    .json({
                        access: token,
                        refresh: rtoken
                    })
                return
            } catch (err) {
                console.log(err)
                res
                    .status(409)
                    .json({
                            success:false,
                            message: "Error Creating User"
                        })
                return
            } finally {
            }
        });
    })

    // Allow user Login
    .post('/login', async (req, res) => {
        const { username, password } = req.body
        try{
            // Finding the user
            const hash = await req.conn.query(`SELECT _id, password FROM users WHERE username = "${username}"`)
            
            // Making sure one and only one user is found
            if ( hash.length !== 1 ){
                res
                .status(401)
                .json({
                    success: false,
                    message: 'Username or password is incorrect'
                })
                return
            }
            
            //Checking Password
            bcrypt.compare(password, hash[0].password, async (err, result) => {
                if(result){
                    //Getting User Data
                    const user = await req.conn.query(`SELECT _id, username, name FROM users WHERE _id = "${hash[0]._id}"`)

                    //Creating new tokens
                    const { token, rtoken } = await createTokens(user[0], req.conn)
    
                    res
                        .status(200)
                        .json({
                            access: token,
                            refresh: rtoken
                        })
                    return
                } else {
                    res
                        .status(401)
                        .json({
                            success: false,
                            message: "Could not login"
                        })
                    return
                }
            })
        } catch (err) {
            res
                .status(500)
                .json({
                    success: false,
                    message: "Could not login"
                })
            console.log(err)
            return
        }
    })

    // Log a user out of the system
    .post('/logout', async (req, res) => {
        const { _id } = req.body
        try{
            await req.conn.query(`UPDATE users SET token=null, rtoken=null, locker=null WHERE _id = "${_id}"`)
            res
                .status(200)
                .json({
                    success: true
                })
            return
        } catch (err) {
            res
                .status(500)
                .json({
                    success: false,
                    message: err
                })
            return
        }
    })

    // Get User with Token
    .get('/', middleware_auth, async(req, res) => {
        try{
            const accessToken = req.headers.authorization.replace('Bearer: ','')
            const user = await req.conn.query(`SELECT _id, username, name FROM users WHERE token = "${accessToken}"`)
            res
                .status(200)
                .json({
                    success: true,
                    user: user[0]
                })
        } catch(err){
            throw err
        }
    })

    // Get user information
    .get('/:id', middleware_auth, async (req, res) => {
        const { id } = req.params
        try{
            const user = await req.conn.query(`SELECT username, name FROM users WHERE _id = ${id}`)
            res
                .status(200)
                .json(user[0])
        } catch (err) {
            throw err
        }
    })

export default router