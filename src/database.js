import mariadb from 'mariadb'


async function getDBConnection() {
    const pool=mariadb.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectionLimit: 5
    })

    console.log(`----------------------------------`)
    console.log(`Connecting to DB: ${process.env.DB_DATABASE}`)
    let conn;
    try {
        const conn = await pool.getConnection()
        console.log(`Connected to the Database`)
        console.log("Total connections: ", pool.totalConnections());
        console.log("Active connections: ", pool.activeConnections());
        console.log("Idle connections: ", pool.idleConnections());
        console.log(`----------------------------------`)
        return conn
    } catch (err) {
        throw err;
    } finally {
        if (conn) return conn.end()
    }
}

export default getDBConnection