const typeDefs = `#graphql
    type User {
        _id: ID!,
        name: String!
    }
    type Reaction {
        _id: ID!,
        sender: User!,
        reaction: String!,
        msgID: String!
    }

    type Message {
        _id: ID!,
        sender: User!,  
        message: String!,
        date: String!,
        extra: String!,
        reaction: [Reaction]
    }

    type Query {
        messages: [Message]
        users: [User]
        user(id: ID!): User
    }

    type Mutation {
        addMessage (senderID: String!, message: String!, date: String!, extra: String!): Message
        addReaction (senderID: String!, reaction: String!, msgID: String! ): Reaction
        addUser(name:String!): User
    }
`

export { typeDefs }