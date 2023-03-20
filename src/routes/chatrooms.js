import express, { json, response } from 'express'

const router = express.Router()

let clients = []

function chatroomUpdate(data, id){
    const found = clients.findIndex( obj => obj._id == id)
    if(found >= 0){
        console.log(`Sending to Client`)
        clients[found].clients.forEach(client => client.res.write(`data: ${JSON.stringify(data)}\n\n`))
    }
}

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
                const user = await req.conn.query(`SELECT _id, name, username, avatar FROM users WHERE _id = "${final[m].user_id}"`)
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
    .get('/:id/events', (req, res, next) => {
        console.log('Events')
        const { id } = req.params
        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        }
        res.writeHead(200, headers)

        let chatroomData = []
        const data = `data: ${JSON.stringify(chatroomData)}\n\n`

        const clientId = Date.now();
        const newClient = {
            _id: clientId,
            res
        }

        const found = clients.findIndex( obj => obj._id == id)

        if(!found >= 0){
            let newRoom = {
                _id: id,
                clients: []
            }
            newRoom.clients.push(newClient)
            clients.push(newRoom)
        }else{
            clients[id].clients.push(newClient)
        }


        req.on('close', () => {
            console.log(`${clientId} Connection Closed`)
            clients = clients.filter(client => client.id !== clientId)
            }
        )
    })
    //Send a message
    .post('/:id', async (req, res) => {
        let chatroomData = {}
        try{
            const { id } = req.params
            const data = req.body
            let messages = []
            data.map( message => {
                let msg = []
                msg.push(`"${message._id}"`)
                msg.push(`"${message.text}"`)
                msg.push(`"${message.user._id}"`)
                msg.push(`"${message.createdAt}"`)
                msg.push(id)
                messages.push(msg)
            })
            const result = await req.conn.query(`INSERT INTO messages (_id, text, user_id, createdAt, chatroom_id) VALUES (${messages})`)
            chatroomData.message = [...messages]
            chatroomUpdate(chatroomData, id)
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