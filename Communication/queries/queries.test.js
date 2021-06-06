const createQueries = require("./index");

test('passes', () => {
    expect(true).toBe(true);
})

test('write a query', () => {
    const queries = createQueries();

    const handler = jest.fn();
    queries.query("get-test", handler);

    queries.connect({ query: Buffer.from("get-test") });
    expect(handler.mock.calls.length).toBe(1);
});

test('do not let multiple queries with the same name', () => {
    const queries = createQueries();

    queries.query("get-test", () => {});
    expect(() => {
        queries.query("get-test", () => {});
    }).toThrow();
});

