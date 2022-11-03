import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { mongoose } from 'mongoose'
import { typeDefs } from './schema.js'
import { resolvers } from './resolvers.js'
import * as dotenv from 'dotenv'
import { decodeAccessToken } from './utils/JWTTokens.js';

dotenv.config()

mongoose.connect(process.env.MONGODB)
    .then( () => {
        console.log('MongoDB connected successfully')
    })

//Starting the Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  
const { url } = await startStandaloneServer(server, {
    context: async ({req}) => {
        try{
            const token = req.headers.authorization
            if(!token) return {user: null}
            return {user: await decodeAccessToken(token.split(" ")[1])}
        }catch(err){
            throw new Error(err)
        }
    },
    listen: { port: 4000 },
});
  
console.log(`🚀  Server ready at: ${url}`);

