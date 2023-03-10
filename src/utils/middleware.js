import { decodeAccessToken, decodeRefreshToken } from "./tokens.js"

const middleware_auth = ( async (req, res, next) => {
    const accessToken = req.headers.authorization.replace('Bearer: ','')
    const token = decodeAccessToken(accessToken)

    const results = await req.conn.query(`SELECT _id FROM users WHERE token = "${accessToken}"`)
    if(results.length !== 1){
        res
            .status(401)
            .json({
                success: false,
                message: 'Not Authorized'
            })
        return
    }

    if(token === null){
        res
            .status(401)
            .json({
                success: false, 
                message: 'Not Authorized'
            })
        return
    }
    req.token = token
    next()
})

const middleware_refresh = ( async (req, res, next) => {
    if(req.headers.authorization === null || req.headers.authorization === ''){
        res
            .status(401)
            .json({
                success: false,
                message: "No Refresh Token Provided"
            })
        return
    }
    try{
        const refreshToken = req.headers.authorization.replace('Bearer: ','')

        if(refreshToken === null){
            res
                .status(401)
                .json({
                    success: false,
                    message: 'Not Authorized'
                })
            return
        }
        const token = decodeRefreshToken(refreshToken)
    
        if(token === null){
            res
                .status(401)
                .json({
                    success: false,
                    message: 'Not Authorized'
                })
            return
        }

        const result = await req.conn.query(`SELECT _id FROM users WHERE _id = ${token._id} AND locker = "${token.locker}"`)

        if(result.length !== 1){
            res
                .status(401)
                .json({
                    success: false,
                    message: 'Not Authorized'
                })
            return
        }

        req.token = token
        next()
    } catch (err) {
        res
            .status(500)
            .json({
                success: false,
                error: err
            })
        return
    }
})

export {middleware_auth, middleware_refresh}