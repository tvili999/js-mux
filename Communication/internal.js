const idGenerator = require("../helpers/idGenerator");
const { Transmitter, Receiver } = require("../Muxer");

module.exports = (props) => {
    let _connections = {};
    let _connectionIdGenerator = idGenerator(id => _connections[id]);
    return {
        connection: (transceiver) => {
            const connection = {
                id: _connectionIdGenerator(),
                connection: transceiver,
                transmitter: Transmitter(),
                receiver: Receiver(),
                queries: {}
            };

            transceiver.on('data', msg => connection.receiver.feed(msg));
            connection.transmitter.on('data', data => transceiver.write(data));
            transceiver.on('close', () => {
                props.eventHandlers.close(connection);
            })

            connection.receiver.on('open', (channel) => {
                queries[channel] = {
                    channel,
                    onData: () => {}
                };

                
            });

            connection.receiver.on('data', (channel, data) => {

            });

            connection.receiver.on('close', (channel) => {

            })

            _connections[connection.id] = connection;
        }
    }
}