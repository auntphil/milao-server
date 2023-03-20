import express from 'express'
import { middleware_refresh } from '../utils/middleware.js'
import { createTokens } from '../utils/tokens.js'

const router = express.Router()

router
    .post('/refresh', middleware_refresh , async (req, res, next) => {
        try{
            const result = await req.conn.query(`SELECT _id, username, name FROM users WHERE _id = "${req.token._id}" AND locker = "${req.token.locker}"`)
    
            // Making sure one and only one user is found
            if ( result.length !== 1 ){
                res
                    .status(401)
                    .json({
                        success: false,
                        message: 'Username or password is incorrect'
                    })
                return
            }
    
            const { token, rtoken } = await createTokens(result[0], req.conn)
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
                .status(500)
            return
        }
    })

export default router