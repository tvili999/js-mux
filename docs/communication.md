# Communication

## Usage

### Connection object

You need to create a connection object and attach it with an actual data channel.

```js
const communication = require("js-mux/Communication");

const server = communication();

const connection = communication.createConnection();

const socket = net.createConnection();
socket.on('data', connection.receive);
socket.on('close', connection.disconnect);
connection.on('transmit', socket.write);

server.connect(connection);
```

### Connection event

When a peer connects, a connect event is emitted.

```js
const communication = require("js-mux/Communication");

const server = communication();

server.on('connect', connection => {
    /* do anything on that connection */
});

server.on('disconnect', connection => {
    /* do cleanup after the connection */
});
```

### Queries

Queries are the endpoints we can specify that other peers can send data to.

You can read all data at once.

```js
const communication = require("js-mux/Communication");

const peer = communication();

peer.query('some-query', async (connection, query) => {
    const data = await query.readAll();
});
```
Or you can read it as a stream.

```js
const communication = require("js-mux/Communication");

const peer = communication();

peer.query('some-query', async (connection, query) => {
    query.on('data', data => {
        /* Next chunk of data is received */
    });

    query.on('close', () => {
        /* Will not receive data anymore */
    })
});
```

### Upstream

An upstream is a data stream to a connection we can write as we want. It is one directional.

```js
const communication = require("js-mux/Communication");

const peer = communication();

peer.on('connect', connection => {
    const stream = connection.openUpstream('some-query');
    stream.send("Some message");
    stream.close();
});
```

If all the data is available at once, the upper example has a simpler form, the publish method.

```js
const communication = require("js-mux/Communication");

const peer = communication();

peer.on('connect', connection => {
    connection.publish('some-query', "Some message");
});
```

### Request/Response server

The request and the response does not neccessarrily need to be one after other. 
You can start sending the response while reading the request data.

```js
const communication = require("js-mux/Communication");

const peer = communication();

peer.query('some-request', (connection, query) => {
    // This can happen anywhere, anytime in the future. Even in a data event.
    const responseStream = query.openResponseStream();
    responseStream.send("response");
    responseStream.close();
})
```

If all the data is available at once, the upper example has a simpler form, the sendResponse method.

```js
const communication = require("js-mux/Communication");

const peer = communication();

peer.query('some-request', (connection, query) => {
    query.sendResponse("response");
});
```

### Request/Response client

The request and the response does not neccessarrily need to be one after other. 
You can start sending the request while reading the response data (as presented in previous examples).

```js
const communication = require("js-mux/Communication");

const peer = communication();

peer.on('connect', connection => {
    const requestStream = connection.openRequest("some-request");

    requestStream.on('response', responseStream => {
        const responseData = await responseStream.readAll();
        /* Do something with response */
    });

    requestStream.send("request-data");
    requestStream.close();
});
```

The above code can be written in a simpler form.

```js
const communication = require("js-mux/Communication");

const peer = communication();

peer.on('connect', async connection => {
    const responseData = await connection.request("some-request", "request-data");
    /* Do anything with the response data */
});
```

