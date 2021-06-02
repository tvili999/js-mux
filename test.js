const asd = {}

asd.before(async (query) => { // Modifies query, not called if response sent
    query.asd = "asd";
    return query;
})

asd.beforeAlways(async (query) => { // Modifies query, gets called even if response sent
    query.asd = "asd";
    return query;
})

asd.after(async (query, response) => { // Modifies response, not called if response sent
    return Buffer.from(response);
})

asd.afterAlways(async (query, response) => { // Modifies response, gets called if response sent
    return Buffer.from(response);
})

asd.query('asdasd', async (query) => {
    const resp = await query.connection.query('asdasd', {})

    return {};
})

asd.open(async (connection) => {

    connection.someData = "asdasd";

    connection.close();
})

asd.close(async (connection) => {

})

const domainSocket = {};

const dsConnection = dsToConnection(domainSocket);

asd.connect(dsConnection);