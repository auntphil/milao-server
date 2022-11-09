import jwt from 'jsonwebtoken'

//Create Access Token
const createAccssToken = (userObject, email) => {
    return jwt.sign(
        {_id: userObject._id, email: email.toLowerCase() },
            process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m'}
    )
}
    
//creating refresh token
const createRefreshToken = (userObject, email) => {
    return jwt.sign(
        {_id: userObject._id, email: email.toLowerCase(), counter: userObject.counter },
        process.env.REFRESH_TOKEN_SECRET,
        {}
    )

}

//Decode Access Token
const decodeAccessToken = (token,) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if(err) return null
        return data
    })
}

//Decode Refresh Token
const decodeRefreshToken = (token,) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
        if(err) return null
        return data
    })
}


export {createAccssToken, createRefreshToken, decodeAccessToken, decodeRefreshToken}