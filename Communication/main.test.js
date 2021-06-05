const createServer = require("./index");
const connections = require("./connections");
const { Transmitter } = require("../Muxer");
const transmitter = require("../Muxer/transmitter");

test('passes', () => {
    expect(true).toBe(true);
});

test('accept query', () => {
    const server = createServer();
    const socket = connections.createConnection();
    server.connect(socket);

    const queryHandler = jest.fn((connection, query) => {});
    server.query("get-test", queryHandler);

    const transmitter = Transmitter();
    transmitter.on("data", socket.data);
    transmitter.send([1], [...Buffer.from("get-test"), 0, 0,0,0,0]);

    expect(queryHandler.mock.calls.length).toBe(1);
});

test('multiple queries for same resource on same connection', () => {
    const server = createServer();
    const socket = connections.createConnection();
    server.connect(socket);

    const queryHandler = jest.fn((connection, query) => {});
    server.query("get-test", queryHandler);

    const transmitter = Transmitter();
    transmitter.on("data", socket.data);
    transmitter.send([1], [...Buffer.from("get-test"), 0, 0,0,0,0]);
    transmitter.send([2], [...Buffer.from("get-test"), 0, 0,0,0,1]);

    expect(queryHandler.mock.calls.length).toBe(2);
    expect(queryHandler.mock.calls[0][1].sessionId).toBe(0);
    expect(queryHandler.mock.calls[1][1].sessionId).toBe(1);
});


test('multiple queries for same resource on different connections', () => {
    const server = createServer();
    const socket1 = connections.createConnection();
    const socket2 = connections.createConnection();
    server.connect(socket1);
    server.connect(socket2);

    const queryHandler = jest.fn((connection, query) => {});
    server.query("get-test", queryHandler);

    const transmitter1 = Transmitter();
    transmitter1.on("data", socket1.data);
    const transmitter2 = Transmitter();
    transmitter2.on("data", socket2.data);

    transmitter1.send([1], [...Buffer.from("get-test"), 0, 0,0,0,0]);
    transmitter2.send([1], [...Buffer.from("get-test"), 0, 0,0,0,0]);

    expect(queryHandler.mock.calls.length).toBe(2);
});
