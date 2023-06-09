import jwt from 'jsonwebtoken'
import Randomstring from 'randomstring'

//Create Access Token
const createAccssToken = async (user, conn) => {
    const token = jwt.sign(
        {_id: user._id, username: user.username.toLowerCase(), displayname: user.displayname },
            process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15s'}
    )

    try{
        await conn.query(`UPDATE users SET token = "${token}" WHERE _id = "${user._id}"`)
    } catch {
    
    }
    
    return token 
}
    
//creating refresh token
const createRefreshToken = async (user, locker, conn) => {
    const token = jwt.sign(
        {_id: user._id, username: user.username.toLowerCase(), locker: locker },
        process.env.REFRESH_TOKEN_SECRET,
        {}
    )

    try{
        await conn.query(`UPDATE users SET rtoken = "${token}" WHERE _id = "${user._id}"`)
    } catch {
        
    }

    return token 

}

//Decode Access Token
const decodeAccessToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if(err) return null
        return data
    })
}

//Decode Refresh Token
const decodeRefreshToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
        if(err) return null
        return data
    })
}

const createTokens = async (user, conn) => {
    // Creating the Users Locker Token
    const locker = Randomstring.generate()
    await conn.query(`UPDATE users SET locker = "${locker}" WHERE _id = "${user._id}"`)

    // Creating the Users Access Token
    const token = await createAccssToken(user, conn)
    const rtoken = await createRefreshToken(user, locker, conn)

    return {token, rtoken}
}

export {createAccssToken, createRefreshToken, decodeAccessToken, decodeRefreshToken, createTokens}