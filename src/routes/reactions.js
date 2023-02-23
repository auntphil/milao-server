import express from 'express'

const router = express.Router()

router
    .post('/', async (req, res) => {
        const { msg_id, user_id, reaction } = req.body
        try{
            const result = await req.conn.query(`INSERT INTO message_reactions (msg_id, user_id, reaction) VALUES (${msg_id}, ${user_id}, "${reaction}")`)
            res
                .status(200)
                .json({success:true})
        } catch (err) {
            res
                .status(500)
                .json({success:false})  
            console.error(err)
        }
    })

export default router