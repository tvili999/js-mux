const communication = require("../Communication");

require("./context")({
    port: 8080,
    server: (connection) => {
        /********************** SERVER **********************/
        const peer = communication();

        peer.query("some-request", async (connection, query) => {
            const requestData = await query.readAll();

            const responseData2 = await connection.request(requestData, "");
    
            query.sendResponse(responseData2);
        })

        peer.on('connect', async connection => {
        })
    
        peer.connect(connection);
    },
    client: (connection) => {
        /********************** CLIENT **********************/
        const peer = communication();

        peer.query("some-request-2", async (connection, query) => {
            const requestData = await query.readAll();
            console.log(requestData.toString());
    
            query.sendResponse("response-data-2");
        })

        peer.on('connect', async connection => {
            const responseData = await connection.request("some-request", "some-request-2");
            console.log(responseData.toString());
        })
    
        peer.connect(connection);
    }
});
