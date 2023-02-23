import express from 'express'
import { middleware_refresh } from '../utils/middleware.js'
import { createTokens } from '../utils/tokens.js'

const router = express.Router()

router
    .post('/refresh', middleware_refresh , async (req, res, next) => {
        const result = await req.conn.query(`SELECT user_id, username, displayname FROM users WHERE user_id = ${req.token.user_id}`)
        const { token, rtoken } = await createTokens(result[0], req.conn)
        res
            .status(200)
            .json({
                success: true,
                user: result,
                token: token,
                rtoken: rtoken
            })
        return
    })

export default router