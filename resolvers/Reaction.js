import {User} from '../models/Users.js'

const Reaction = {
    user: parent => {
        return User.findById(parent.userId)
        .then( user => user._doc)
        .catch(err => console.error(err))
    }
}

export default Reaction