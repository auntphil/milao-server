import express from 'express'

const router = express.Router()

router
    .get('/', async (req, res) => {
        try{
            const result = await req.conn.query(`SELECT chatrooms.chatroom_id, title, (SELECT content FROM messages WHERE chatroom_id = chatrooms.chatroom_id ORDER BY timestamp DESC LIMIT 1) AS latest_message,  (SELECT user_id FROM messages WHERE chatroom_id = chatrooms.chatroom_id ORDER BY timestamp DESC LIMIT 1) AS latest_sender FROM chatrooms`)
            res.send(result)
        } catch (err) {
            throw err
        }
    })
    .get('/:id', async (req, res) => {
        const { id } = req.params
        try{
            const result = await req.conn.query(`SELECT * FROM messages WHERE chatroom_id = ${id} ORDER BY timestamp DESC`)
            res.send(result)
        } catch (err) {
            throw err
        }
    })
    .post('/:id', async (req, res) => {
        const { id } = req.params
        const { content, user_id, chatroom_id } = req.body
        try{
            const result = await req.conn.query(`INSERT INTO messages (content, user_id, chatroom_id) VALUES ("${content}", ${user_id}, ${chatroom_id})`)
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