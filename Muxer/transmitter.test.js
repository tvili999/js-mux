test('passes', () => {
    expect(true).toBe(true);
});

const createTransmitter = require("./transmitter");
const specialBytes = require("./specialBytes");

const collectData = () => {
    const addData = (data) => addData.buffer = [...addData.buffer, ...data];
    addData.buffer = [];

    return addData;
}

test('passes', () => {
    expect(true).toBe(true);
});

test('open channel', () => {
    const transmitter = createTransmitter();

    const dataCollector = collectData();
    transmitter.on('data', dataCollector);

    transmitter.send([1], []);
    
    expect(dataCollector.buffer).toEqual([specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END]);
});

test('close channel', () => {
    const transmitter = createTransmitter();

    const dataCollector = collectData();
    transmitter.on('data', dataCollector);

    transmitter.send([1], []);
    transmitter.close([1]);

    expect(dataCollector.buffer).toEqual([specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END, specialBytes.ESCAPE, specialBytes.END]);
});

test('simple data', () => {
    const transmitter = createTransmitter();

    const dataCollector = collectData();
    transmitter.on('data', dataCollector);

    const data = [1,2,3,4,5];

    transmitter.send([1], data);
    transmitter.close([1]);

    expect(dataCollector.buffer).toEqual([specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END, ...data ,specialBytes.ESCAPE, specialBytes.END]);
});

test('data with escapes', () => {
    const transmitter = createTransmitter();

    const dataCollector = collectData();
    transmitter.on('data', dataCollector);

    const data = [1,2,3, specialBytes.ESCAPE, 4, 5];

    transmitter.send([1], data);
    transmitter.close([1]);

    expect(dataCollector.buffer).toEqual([
        specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END, 
        1,2,3, specialBytes.ESCAPE, specialBytes.ESCAPE, 4, 5, 
        specialBytes.ESCAPE, specialBytes.END
    ]);
});

test('channel switch', () => {
    const transmitter = createTransmitter();

    const dataCollector = collectData();
    transmitter.on('data', dataCollector);

    transmitter.send([1], []);
    transmitter.send([2], []);
    
    expect(dataCollector.buffer).toEqual([
        specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END, 
        specialBytes.ESCAPE, specialBytes.START, 2, specialBytes.ID_END
    ]);
});

test('close after channel switch', () => {
    const transmitter = createTransmitter();

    const dataCollector = collectData();
    transmitter.on('data', dataCollector);

    transmitter.send([2], []);
    transmitter.send([1], []);
    transmitter.close([2]);
    
    expect(dataCollector.buffer).toEqual([
        specialBytes.ESCAPE, specialBytes.START, 2, specialBytes.ID_END, 
        specialBytes.ESCAPE, specialBytes.START, 1, specialBytes.ID_END, 
        specialBytes.ESCAPE, specialBytes.START, 2, specialBytes.ID_END, 
        specialBytes.ESCAPE, specialBytes.END
    ]);
});
