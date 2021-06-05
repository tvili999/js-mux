const createServer = require("./index");
const connections = require("./connections");
const { Transmitter } = require("../Muxer");
const transmitter = require("../Muxer/transmitter");

test('passes', () => {
    expect(true).toBe(true);
});

const createContext = (numberOfConnections) => {
    const server = createServer();
    const tx = [...Array(numberOfConnections)].map((_) => Transmitter());

    for(const transmitter of tx){
        const socket = connections.createConnection();
        server.connect(socket);
        transmitter.on('data', socket.data);
    }

    return { server, tx };
}

test('accept query', () => {
    const { server, tx } = createContext(1);
    const queryHandler = jest.fn((connection, query) => {});
    server.query("get-test", queryHandler);

    tx[0].send([1], [...Buffer.from("get-test"), 0, 0,0,0,0]);

    expect(queryHandler.mock.calls.length).toBe(1);
});

test('multiple queries for same resource on same connection', () => {
    const { server, tx } = createContext(1);

    const queryHandler = jest.fn((connection, query) => {});
    server.query("get-test", queryHandler);

    tx[0].send([1], [...Buffer.from("get-test"), 0, 0,0,0,0]);
    tx[0].send([2], [...Buffer.from("get-test"), 0, 0,0,0,1]);

    expect(queryHandler.mock.calls.length).toBe(2);
    expect(queryHandler.mock.calls[0][1].sessionId).toBe(0);
    expect(queryHandler.mock.calls[1][1].sessionId).toBe(1);
});


test('multiple queries for same resource on different connections', () => {
    const { server, tx } = createContext(2);

    const queryHandler = jest.fn((connection, query) => {});
    server.query("get-test", queryHandler);

    tx[0].send([1], [...Buffer.from("get-test"), 0, 0,0,0,0]);
    tx[1].send([1], [...Buffer.from("get-test"), 0, 0,0,0,0]);

    expect(queryHandler.mock.calls.length).toBe(2);
});

test('different messages for same resource', () => {
    const { server, tx } = createContext(1);

    const messageHandler = jest.fn();
    
    server.query("get-test", (connection, query) => {
        query.readAll().then(data => {
            console.log("asd")
            messageHandler(query.sessionId, data)
        })
    });

    tx[0].send([1], [...Buffer.from("get-test"), 0, 0,0,0,0, 0, 1, 2]);
    tx[0].close([1]);
    tx[0].send([2], [...Buffer.from("get-test"), 0, 0,0,0,1, 3, 4, 5]);
    tx[0].close([2]);

    expect(messageHandler.mock.calls.length).toBe(2);
    expect(messageHandler.mock.calls[0][0].sessionId).toBe(0);
    expect(messageHandler.mock.calls[0][1].sessionId).toEqual(Buffer.from([0,1,2]));

    expect(messageHandler.mock.calls[1][0].sessionId).toBe(1);
    expect(messageHandler.mock.calls[1][1].sessionId).toEqual(Buffer.from([3,4,5]));
});
