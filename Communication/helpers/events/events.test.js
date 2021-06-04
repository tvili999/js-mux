const events = require("./index");

test('passes', () => {
    expect(true).toBe(true);
})

test('object gets created', () => {
    const _events = events();
    expect(_events).toBeTruthy();
});

test('single event with arguments', () => {
    const _events = events();

    const handler = jest.fn((a, b) => {});
    _events.on("event", handler);

    _events.fire("event", 1, 2);

    expect(handler.mock.calls.length).toBe(1);
    expect(handler.mock.calls[0][0]).toBe(1);
    expect(handler.mock.calls[0][1]).toBe(2);
})

test('multiple events', () => {
    const _events = events();
    const handler1 = jest.fn((a, b) => {});
    const handler2 = jest.fn((a, b) => {});
    _events.on("event", handler1);
    _events.on("event2", handler2);

    _events.fire("event", 1, 2);
    _events.fire("event2", 1, 2);

    expect(handler1.mock.calls.length).toBe(1);
    expect(handler1.mock.calls.length).toBe(1);
})

test('off', () => {
    const _events = events();

    const handler = jest.fn(() => {});
    _events.on("event", handler);
    _events.fire("event");
    expect(handler.mock.calls.length).toBe(1);

    _events.off("event", handler);
    _events.fire("event");
    expect(handler.mock.calls.length).toBe(1);
})

test('once', () => {
    const _events = events();

    const handler = jest.fn(() => {});
    _events.once("event", handler);
    _events.fire("event");
    _events.fire("event");
    expect(handler.mock.calls.length).toBe(1);
})
