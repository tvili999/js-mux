const communication = require("../Communication");
const net = require("net");

module.exports = ({ port, server, client }) => {
    let serverStarted = null;
    const serverStart = new Promise(resolve => serverStarted = resolve)
    
    const createConnection = (socket) => {
        const connection = communication.createConnection();
    
        connection.on('transmit', (data) => {
            socket.write(data);
        });
        socket.on('data', (data) => {
            connection.receive(data);
        });
        socket.on('close', connection.disconnect);
    
        return connection;
    }

    const srv = (async () => {
        const socket = await new Promise(resolve => {
            const server = net.createServer((socket) => {
                resolve(socket);
            })
            server.listen(8080, '0.0.0.0');
            serverStarted();
        });
    
        server(createConnection(socket));
    });
    
    const cli = (async () => {
        await serverStart;
        const socket = await new Promise(resolve => {
            const socket = new net.Socket()
            const connection = socket.connect(8080, "localhost", () => {
                resolve(connection);
            });
        })
    
        client(createConnection(socket));
    });
    
    srv().catch(console.error);
    cli().catch(console.error);
}