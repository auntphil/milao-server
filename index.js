import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { mongoose } from 'mongoose'
import { typeDefs } from './schema.js'
import { resolvers } from './resolvers.js'
import * as dotenv from 'dotenv'

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
listen: { port: 4000 },
});
  
console.log(`🚀  Server ready at: ${url}`);

