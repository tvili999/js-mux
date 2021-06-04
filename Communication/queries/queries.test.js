const createQueries = require("./index");

test('passes', () => {
    expect(true).toBe(true);
})

test('write a query', () => {
    const queries = createQueries();

    const handler = () => {};
    queries.query("get-test", handler);

    const result = queries.get("get-test");
    expect(result).toBe(handler);
});

test('write a query with different forms of data', () => {
    const queries = createQueries();

    const handler = () => {};
    queries.query("get-test", handler);

    const result = queries.get(Buffer.from("get-test"));
    expect(result).toBe(handler);
});

test('do not let multiple queries with the same name', () => {
    const queries = createQueries();

    queries.query("get-test", () => {});
    expect(() => {
        queries.query("get-test", () => {});
    }).toThrow();
});

