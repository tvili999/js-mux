const createChannels = require("./index");
const connections = require("../connections/index");
const { Transmitter } = require("../../Muxer");

test('passes', () => {
    expect(true).toBe(true);
});

const mockContext = () => {
    const socket = connections.createConnection();
    const channels = createChannels({ connection: socket });
    const transmitter = Transmitter();
    transmitter.on("data", (data) => {
        socket.receive(data);
    });
    socket.on('transmit', socket.receive);
    return channels;
}

test('object gets created', () => {
    const channels = mockContext();
    expect(channels).toBeTruthy();
});

test('open a channel', () => {
    const channels = mockContext();

    const openHandler = jest.fn();
    channels.on("connect", openHandler);
    channels.open({
        query: "asdasd",
        sessionId: 0,
        messageType: 0
    });

    expect(openHandler.mock.calls.length).toBe(1);
});

test('close channel', () => {
    const channels = mockContext();

    const closeHandler = jest.fn();
    channels.on("connect", (channel) => {
        channel.on("close", closeHandler);
    });
    const query = channels.open({
        query: "asdasd",
        sessionId: 0,
        messageType: 0
    });
    query.close();

    expect(closeHandler.mock.calls.length).toBe(1);
});

test('open a channel and read header', () => {
    const channels = mockContext();

    const openHandler = jest.fn();
    channels.on("connect", openHandler);
    channels.open({
        query: "asdasd",
        sessionId: 1,
        messageType: 0
    });

    expect(openHandler.mock.calls.length).toBe(1);
    expect(openHandler.mock.calls[0][0].query).toEqual(Buffer.from("asdasd"));
    expect(openHandler.mock.calls[0][0].sessionId).toEqual(1);
});

test('query data event', () => {
    const channels = mockContext();

    const messageHandler = jest.fn();
    channels.on("connect", (query) => {
        query.on('data', messageHandler);
    });
    const query = channels.open({
        query: "asdasd",
        sessionId: 0,
        messageType: 0
    });
    query.send([1,2,3]);

    expect(messageHandler.mock.calls.length).toBe(1);
    expect(messageHandler.mock.calls[0][0]).toEqual(Buffer.from([1, 2, 3]));
});


test('query data event', () => {
    const channels = mockContext();

    const messageHandler = jest.fn();
    channels.on("connect", (query) => {
        query.on('data', messageHandler);
    });
    const query = channels.open({
        query: "asdasd",
        sessionId: 0,
        messageType: 0
    });
    query.send([1,2,3]);

    expect(messageHandler.mock.calls.length).toBe(1);
    expect(messageHandler.mock.calls[0][0]).toEqual(Buffer.from([1, 2, 3]));
});
