const createConnections = require("./index");

test('passes', () => {
    expect(true).toBe(true);
});

test('connection object create', () => {
    createConnections.createConnection();
})

test('connection object data event', () => {
    const connection = createConnections.createConnection();

    const dataHandler = jest.fn(data => {});
    connection.on('receive', dataHandler);

    connection.receive("asdasd");

    expect(dataHandler.mock.calls.length).toBe(1);
    expect(dataHandler.mock.calls[0][0]).toBe("asdasd");
})

test('connection object data event', () => {
    const connection = createConnections.createConnection();

    const disconnectHandler = jest.fn(() => {});
    connection.on('disconnect', disconnectHandler);

    connection.disconnect();

    expect(disconnectHandler.mock.calls.length).toBe(1);
})

test('accept connection', () => {
    const connections = createConnections();
    const connection = createConnections.createConnection();

    connections.connect(connection);

    expect(connections.connections.length).toBe(1);
});

test('emit connection event', () => {
    const connections = createConnections();
    const connection = createConnections.createConnection();

    const connectionHandler = jest.fn();

    connections.on("connect", connectionHandler);

    connections.connect(connection);

    expect(connectionHandler.mock.calls.length).toBe(1);
});

test('disconnect', () => {
    const connections = createConnections();
    const connection = createConnections.createConnection();

    connections.connect(connection);
    expect(connections.connections.length).toBe(1);

    connection.disconnect();
    expect(connections.connections.length).toBe(0);
});

test('emit disconnect event', () => {
    const connections = createConnections();
    const connection = createConnections.createConnection();

    const disconnectHandler = jest.fn();
    connections.on("disconnect", disconnectHandler);

    connections.connect(connection);
    connection.disconnect();

    expect(disconnectHandler.mock.calls.length).toBe(1);
});
