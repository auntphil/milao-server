const typeDefs = `#graphql
    type User {
        _id: ID!,
        email: String!
        token: String!
        refresh: String!
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
        date: Float!,
        extra: String!,
        reaction: [Reaction]
    }

    type Query {
        messages: [Message]
        users: [User]
        user(id: ID!): User
    }

    input MessageInput {
        message: String!
        date: Float!
        extra: String!
    }

    input ReactionInput {
        reaction: String!
        messageId: String!
    }

    input RegisterInput {
        email: String!
        password: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }


    type Mutation {
        createMessage (messageInput: MessageInput): Message
        addReaction (reactionInput: ReactionInput ): Reaction
        registerUser(registerInput: RegisterInput): User

        login(loginInput: LoginInput): User
        logout: User

        removeReaction (id: ID!): Reaction
    }
`

export { typeDefs }