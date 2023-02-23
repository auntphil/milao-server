import express from 'express'

const router = express.Router()

router
    //Get a list of all Chatrooms and the latest message
    .get('/', async (req, res) => {
        try{
            const result = await req.conn.query(`SELECT chatrooms.chatroom_id, title, (SELECT content FROM messages WHERE chatroom_id = chatrooms.chatroom_id ORDER BY timestamp DESC LIMIT 1) AS latest_message,  (SELECT user_id FROM messages WHERE chatroom_id = chatrooms.chatroom_id ORDER BY timestamp DESC LIMIT 1) AS latest_sender FROM chatrooms`)
            res.send(result)
        } catch (err) {
            throw err
        }
    })
    //Get All messages by Room ID
    .get('/:id', async (req, res) => {
        const { id } = req.params
        try{
            //Getting Messages from a chatroom
            const messages = await req.conn.query(`SELECT * FROM messages WHERE chatroom_id = ${id} ORDER BY timestamp DESC`)
            let final = messages
            for( let m = 0; m < final.length; m++){
                //Getting Reactions for each message
                const reactions = await req.conn.query(`SELECT reaction, user_id FROM message_reactions WHERE msg_id = ${final[m].msg_id}`)
                final[m].reactions = reactions
            }
            res
                .status(200)
                .json(final)
        } catch (err) {
            throw err
        }
    })
    //Send a message
    .post('/', async (req, res) => {
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