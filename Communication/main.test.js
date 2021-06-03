const createServer = require("./index");

test('passes', () => {
    expect(true).toBe(true);
});

test('server gets created', () => {
    const server =  createServer();
});