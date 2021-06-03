const createReceiver = require("./receiver");
const specialBytes = require("./specialBytes");

test('passes', () => {
    expect(true).toBe(true);
});

const createChunks = chunkSize => data => {
    data = [...data];
    let result = [];
    while(data.length > 0) {
        let chunk = [];
        for(let i = 0; i < chunkSize; i++) {
            if(data.length == 0)
                break;
            chunk.push(data.shift());
        }
        result.push(chunk);
    }

    return result;
};

tester("whole", data => [data]);
tester("one by one", data => data.map(x => [x]));
tester("two sized chunks", createChunks(2));
tester("three sized chunks", createChunks(3));
tester("five sized chunks", createChunks(5));

function tester(prefix, processData) {
    test(prefix + ' open channel', () => {
        const receiver = createReceiver();

        const openHandler = jest.fn(channelId => { });
        receiver.on('open', openHandler);

        const chunks = processData([specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END]);
        for(const chunk of chunks)
            receiver.feed(chunk);

        expect(openHandler.mock.calls.length).toBe(1);
        expect(openHandler.mock.calls[0][0]).toEqual(Buffer.from([1]))
    });

    test(prefix + ' close channel', () => {
        const receiver = createReceiver();

        const openHandler = jest.fn(channelId => { });
        receiver.on('open', openHandler);

        const closeHandler = jest.fn(() => { });
        receiver.on('close', closeHandler);

        const chunks = processData([specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END, specialBytes.ESCAPE, specialBytes.END]);
        for(const chunk of chunks)
            receiver.feed(chunk);

        expect(closeHandler.mock.calls.length).toBe(1);
        expect(closeHandler.mock.calls[0][0]).toEqual(Buffer.from([1]))
    });

    test(prefix + ' simple data', () => {
        const receiver = createReceiver();

        const data = [1,2,3,4,5];

        let received = [];

        const dataHandler = jest.fn((channelId, data) => {
            received = [...received, ...data];
        });
        receiver.on("data", dataHandler);

        const chunks = processData([specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END, ...data ,specialBytes.ESCAPE, specialBytes.END]);
        for(const chunk of chunks)
            receiver.feed(chunk);

        expect(dataHandler.mock.calls[0][0]).toEqual(Buffer.from([1]))
        expect(received).toEqual(data);
    });

    test(prefix + ' data with escapes', () => {
        const receiver = createReceiver();

        const data = [1,2,3, specialBytes.ESCAPE, specialBytes.ESCAPE, 4, 5];
        let chunks = processData(data);
        for(const chunk of chunks)
            receiver.feed(chunk);

        let received = [];
        receiver.on("data", (channelId, data) => {
            received = [...received, ...data];
        });

        chunks = processData([specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END, ...data ,specialBytes.ESCAPE, specialBytes.END]);
        for(const chunk of chunks)
            receiver.feed(chunk);

        expect(received).toEqual([1,2,3, specialBytes.ESCAPE, 4, 5]);
    });

    test(prefix + ' channel switch', () => {
        const receiver = createReceiver();

        const openHandler = jest.fn(channelId => { });
        receiver.on('open', openHandler);

        const chunks = processData([
            specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END, 
            specialBytes.ESCAPE, specialBytes.START, 2, specialBytes.ID_END, 
        ]);
        for(const chunk of chunks)
            receiver.feed(chunk);

        expect(openHandler.mock.calls.length).toBe(2);
    });

    test(prefix + ' close after channel switch', () => {
        const receiver = createReceiver();

        const openHandler = jest.fn(channelId => { });
        receiver.on('open', openHandler);

        const closeHandler = jest.fn((channelId) => { });
        receiver.on('close', closeHandler);

        const chunks = processData([
            specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END, 
            specialBytes.ESCAPE, specialBytes.START, 2, specialBytes.ID_END, 
            specialBytes.ESCAPE, specialBytes.END
        ]);
        for(const chunk of chunks)
            receiver.feed(chunk);

        expect(openHandler.mock.calls.length).toBe(2);
        expect(closeHandler.mock.calls.length).toBe(1);
        expect(closeHandler.mock.calls[0][0]).toEqual(Buffer.from([2]));
    });
}