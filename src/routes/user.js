import express from 'express'
import bcrypt from 'bcrypt'
import Randomstring from 'randomstring'

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
                const result = await req.conn.query(`INSERT INTO users (username, password) VALUES ("${username}", "${hash}")`)
                const user = await req.conn.query(`SELECT user_id, username, displayname FROM users WHERE user_id = ${result.insertId}`)
                const locker = Randomstring.generate()
                const token = await createAccssToken(user[0], req.conn)
                const rtoken = await createRefreshToken(user[0], locker, req.conn)
                await req.conn.query(`UPDATE users SET token="${token}", rtoken="${rtoken}", locker="${locker}" WHERE user_id = ${user[0].user_id}`)
                res
                    .status(200)
                    .json({
                        success:true,
                        token: token,
                        rtoken: rtoken
                    })
                return
            } catch (err) {
                console.log(err)
                res
                    .status(500)
                    .json({
                            success:false,
                            message: "Could not create the new user"
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
            const hash = await req.conn.query(`SELECT user_id, password FROM users WHERE username = "${username}"`)
            
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
                const user = await req.conn.query(`SELECT user_id, username, displayname FROM users WHERE user_id = "${hash[0].user_id}"`)
                

                //Creating new tokens
                const { token, rtoken } = await createTokens(user[0], req.conn)

                res
                    .status(200)
                    .json({
                        access: token,
                        refresh: rtoken
                    })
                return
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
    .post('/logout', middleware_auth, async (req, res) => {
        try{
            const user = decodeAccessToken(req.headers.authorization.replace('Bearer: ',''))
            await req.conn.query(`UPDATE users SET token=null, rtoken=null, locker=null WHERE user_id = ${user.user_id}`)
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
            const user = await req.conn.query(`SELECT user_id, username, displayname FROM users WHERE token = "${accessToken}"`)
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
            const user = await req.conn.query(`SELECT username, displayname FROM users WHERE user_id = ${id}`)
            res
                .status(200)
                .json(user[0])
        } catch (err) {
            throw err
        }
    })

export default router