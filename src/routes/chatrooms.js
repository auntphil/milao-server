import express, { response } from 'express'

const router = express.Router()

router
    //Get a list of all Chatrooms and the latest message
    .get('/', async (req, res) => {
        try{
            const result = await req.conn.query(`SELECT chatrooms._id, title, (SELECT text FROM messages WHERE chatroom_id = chatrooms._id ORDER BY createdat DESC LIMIT 1) AS latest_message,  (SELECT user_id FROM messages WHERE chatroom_id = chatrooms._id ORDER BY timestamp DESC LIMIT 1) AS latest_sender FROM chatrooms`)
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
            const messages = await req.conn.query(`SELECT _id, text, createdAt, user_id, sent FROM messages WHERE chatroom_id = ${id} ORDER BY createdat DESC`)
            let final = messages
            for( let m = 0; m < final.length; m++){
                //Getting Reactions for each message
                const user = await req.conn.query(`SELECT _id, name, username, avatar FROM users WHERE _id = ${final[m].user_id}`)
                if(user[0].name == null || user[0].name == undefined || user[0].name.length() == 0){
                    user[0].name = user[0].username
                }
                delete user[0].username
                final[m].user = user[0]
                delete final[m].user_id
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
        const data = req.body
        let messages = []
        data.map( message => {
            let msg = []
            msg.push(`"${message._id}"`)
            msg.push(`"${message.text}"`)
            msg.push(message.user._id)
            msg.push(`"${message.createdAt}"`)
            msg.push(1)
            messages.push(msg)
        })
        try{
            const result = await req.conn.query(`INSERT INTO messages (_id, text, user_id, createdAt, chatroom_id) VALUES (${messages})`)
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