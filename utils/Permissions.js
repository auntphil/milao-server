import { User } from "../models/Users.js"

const checkAuthorization = async (user) => {
    if(!user || user === null) return false
    const dbUser = await User.findOne({ _id:user._id }).then(user => user)
    if(!dbUser) return false
    return true
}

const checkRefresh = async (user) => {
    if(!user) return false
    const dbUser = await User.findOne({ _id:user._id, counter:user.counter }).then(user => user)
    if(!dbUser) return false
    return true
}
export { checkAuthorization, checkRefresh }