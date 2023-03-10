import express from 'express'

const router = express.Router()

router
    .get('/:id', async (req, res) => {
        const { id } = req.params
        try{
            const messages = await req.conn.query(`SELECT * FROM messages WHERE _id = ${id}`)
            res
                .status(200)
                .json(messages)
        } catch (err) {
            throw err
        }
    })

export default router