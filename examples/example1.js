const communication = require("../Communication");

require("./context")({
    port: 8080,
    server: (connection) => {
        const server = communication();

        server.query("some-request", async (connection, query) => {
            const requestData = await query.readAll();
            console.log(requestData.toString());
    
            query.sendResponse("response-data");
        })
    
        server.connect(connection);
    },
    client: (connection) => {
        const server = communication();

        server.on('connect', async connection => {
            const responseData = await connection.request("some-request", "request-data");
            console.log(responseData.toString());
        })
    
        server.connect(connection);
    }
});
