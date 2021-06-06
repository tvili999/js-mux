const createServer = require("./index");
const connections = require("./connections");
const { Transmitter } = require("../Muxer");
const transmitter = require("../Muxer/transmitter");

test('passes', () => {
    expect(true).toBe(true);
});

const createContext = (numberOfConnections) => {
    const server = createServer();
    const sockets = [...Array(numberOfConnections)].map(() => {
        const socket = connections.createConnection();
        socket.on('transmit', socket.receive)
        return server.connect(socket);
    });


    return {
        server, 
        connections: sockets
    };
}

test('accept query', () => {
    const { server, connections } = createContext(1);
    const queryHandler = jest.fn();
    server.query("get-test", queryHandler);

    connections[0].openUpstream("get-test");

    expect(queryHandler.mock.calls.length).toBe(1);
});

test('multiple queries for same resource on same connection', () => {
    const { server, connections } = createContext(1);

    const queryHandler = jest.fn();
    server.query("get-test", queryHandler);

    connections[0].openUpstream("get-test");
    connections[0].openUpstream("get-test");

    expect(queryHandler.mock.calls.length).toBe(2);
});

test('multiple queries for same resource on different connections', () => {
    const { server, connections } = createContext(2);

    const queryHandler = jest.fn();
    server.query("get-test", queryHandler);

    connections[0].openUpstream("get-test");
    connections[1].openUpstream("get-test");

    expect(queryHandler.mock.calls.length).toBe(2);
});

test('different messages for same resource', async () => {
    const { server, connections } = createContext(1);

    const messageHandler = jest.fn();
    const result = new Promise(resolve => {
        let cnt = 0;
        server.query("get-test", async (_, query) => {
            messageHandler(await query.readAll());
            if(++cnt == 2) resolve();
        });
    });

    [ [0,1,2], [3,4,5] ].forEach(data => {
        const stream = connections[0].openUpstream("get-test");
        stream.send(data);
        stream.close();
    });
    await result;

    expect(messageHandler.mock.calls.length).toBe(2);

    expect(messageHandler.mock.calls[0][0]).toEqual(Buffer.from([0,1,2]));
    expect(messageHandler.mock.calls[1][0]).toEqual(Buffer.from([3,4,5]));
});

test('send response', async () => {
    const { server, connections } = createContext(1);
    server.query("get-test", async (connection, query) => {
        expect(await query.readAll()).toEqual(Buffer.from("request"));

        const stream = query.openResponseStream();
        stream.send("response");
        stream.close();
    });

    const request = connections[0].openRequest("get-test");
    const response = new Promise(resolve => {
        request.on('response', async responseStream => {
            resolve(await responseStream.readAll());
        })
    });
    request.send("request");
    request.close();
    expect(await response).toEqual(Buffer.from("response"));
});

test('request api call', async () => {
    const { server, connections } = createContext(1);
    server.query("get-test", async (connection, query) => {
        expect(await query.readAll()).toEqual(Buffer.from("request"));
        query.sendResponse("response");
    });

    const response = await connections[0].request("get-test", "request");
    expect(response).toEqual(Buffer.from("response"));
});
