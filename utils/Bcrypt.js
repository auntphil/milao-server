import bcrypt from 'bcrypt'

const ComparePassword = async (password, user) => {
    const isMatch = await new Promise((res, rej) => {
        bcrypt.compare(password, user.password,(err, isMatch) => {
            if(err) rej("Password or Email is incorrect.")
            res(isMatch)
        })
    })
    if(!isMatch) throw new Error("Password or Email is incorrect.")
    return(isMatch)
}

export { ComparePassword}