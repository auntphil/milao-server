const typeDefs = `#graphql
    type User {
        _id: ID!,
        email: String!
        token: String!
        refresh: String!
    }
    type Reaction {
        _id: ID!,
        user: User!,
        reaction: String!,
        msgId: String!
    }

    type Message {
        _id: ID!,
        user: User!,  
        message: String!,
        date: Float!,
        reaction: [Reaction]
    }

    type DeleteStatus {
        _id: ID
        acknowledged: Boolean,
        deletedCount: Float
    }

    type LogoutStatus {
        acknowledged: Boolean
        success: Boolean
        message: String
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
        msgId: String!
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
        logout: LogoutStatus

        removeReaction (id: ID!): DeleteStatus
    }
`

export { typeDefs }