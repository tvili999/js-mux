const createMap = require("./index");

test('passes', () => {
    expect(true).toBe(true);
});

test('create map', () => {
    const map = createMap();
    expect(true).toBe(true);
});

test('one level deep', () => {
    const map = createMap();
    
    map.set([1], "A");
    map.set([2], "B");
    expect(map.get([1])).toBe("A");
    expect(map.get([2])).toBe("B");
});

test('multi levels', () => {
    const map = createMap();
    
    map.set([1, 3], "A");
    map.set([1, 3, 2], "B");
    expect(map.get([1, 3])).toBe("A");
    expect(map.get([1, 3, 2])).toBe("B");
});

test('delete', () => {
    const map = createMap();
    
    map.set([1, 3], "A");
    expect(map.get([1, 3])).toBe("A");
    map.delete([1, 3]);
    expect(map.get([1, 3])).toBe(undefined);
});
