import express from 'express'

const router = express.Router()

router
    .get('/', async (req, res) => {
        try{
            const result = await req.conn.query(`SELECT * FROM messages`)
            res.send(result)
        } catch (err) {
            throw err
        }
    })
    .get('/:id', async (req, res) => {
        const { id } = req.params
        try{
            const result = await req.conn.query(`SELECT * FROM messages WHERE msg_id = ${id}`)
            res.send(result)
        } catch (err) {
            throw err
        }
    })

export default router