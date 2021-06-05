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
        socket.data(data);
    });
    return { channels, transmitter };
}

test('object gets created', () => {
    const { channels } = mockContext();
    expect(channels).toBeTruthy();
});

test('open a channel', () => {
    const { channels, transmitter } = mockContext();

    const openHandler = jest.fn();
    channels.on("connect", openHandler);
    transmitter.send([1], [...Buffer.from("asdasd"), 0, 0,0,0,0]);

    expect(openHandler.mock.calls.length).toBe(1);
});

test('disconnect channel', () => {
    const { channels, transmitter } = mockContext();

    const disconnectHandler = jest.fn();
    channels.on("connect", (channel) => {
        channel.on("disconnect", disconnectHandler);
    });
    transmitter.send([1], [...Buffer.from("asdasd"), 0, 0,0,0,0]);
    transmitter.close([1]);

    expect(disconnectHandler.mock.calls.length).toBe(1);
});

test('open a channel and read header', () => {
    const { channels, transmitter } = mockContext();

    const openHandler = jest.fn();
    channels.on("connect", openHandler);
    transmitter.send([1], [...Buffer.from("asdasd"), 0, 0,0,0,1]);

    expect(openHandler.mock.calls.length).toBe(1);
    expect(openHandler.mock.calls[0][0].query).toEqual(Buffer.from("asdasd"));
    expect(openHandler.mock.calls[0][0].sessionId).toEqual(1);
});
