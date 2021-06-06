const createSessions = require("./index");

test('passes', () => {
    expect(true).toBe(true);
});

test('object gets created', () => {
    const streams = createSessions();
    expect(streams).toBeTruthy();
});

