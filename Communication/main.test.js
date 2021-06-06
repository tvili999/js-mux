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
        transmitter.on('data', socket.receive);
    }

    return { server, tx };
}

test('accept query', () => {
    const { server, tx } = createContext(1);
    const queryHandler = jest.fn((connection, query) => {});
    server.query("get-test", queryHandler);

    tx[0].send([1], [...Buffer.from("get-test"), 0, 0,0,0,0, 0]);

    expect(queryHandler.mock.calls.length).toBe(1);
});

test('multiple queries for same resource on same connection', () => {
    const { server, tx } = createContext(1);

    const queryHandler = jest.fn((connection, query) => {});
    server.query("get-test", queryHandler);

    tx[0].send([1], [...Buffer.from("get-test"), 0, 0,0,0,0, 0]);
    tx[0].send([2], [...Buffer.from("get-test"), 0, 0,0,0,1, 0]);

    expect(queryHandler.mock.calls.length).toBe(2);
    expect(queryHandler.mock.calls[0][1].sessionId).toBe(0);
    expect(queryHandler.mock.calls[1][1].sessionId).toBe(1);
});


test('multiple queries for same resource on different connections', () => {
    const { server, tx } = createContext(2);

    const queryHandler = jest.fn((connection, query) => {});
    server.query("get-test", queryHandler);

    tx[0].send([1], [...Buffer.from("get-test"), 0, 0,0,0,0, 0]);
    tx[1].send([1], [...Buffer.from("get-test"), 0, 0,0,0,0, 0]);

    expect(queryHandler.mock.calls.length).toBe(2);
});

test('different messages for same resource', async () => {
    const { server, tx } = createContext(1);

    const messageHandler = jest.fn();
   
    const result = new Promise(resolve => {
        let cnt = 0;
        server.query("get-test", async (connection, query) => {
            const data = await query.readAll()
            messageHandler(query.sessionId, data)
            cnt++;
            if(cnt == 2) resolve();
        });
    })

    tx[0].send([1], [...Buffer.from("get-test"), 0, 0,0,0,0, 0, 0, 1, 2]);
    tx[0].close([1]);
    tx[0].send([2], [...Buffer.from("get-test"), 0, 0,0,0,1, 0, 3, 4, 5]);
    tx[0].close([2]);

    await result;

    expect(messageHandler.mock.calls.length).toBe(2);
    expect(messageHandler.mock.calls[0][0]).toBe(0);
    expect(messageHandler.mock.calls[0][1]).toEqual(Buffer.from([0,1,2]));

    expect(messageHandler.mock.calls[1][0]).toBe(1);
    expect(messageHandler.mock.calls[1][1]).toEqual(Buffer.from([3,4,5]));
});
