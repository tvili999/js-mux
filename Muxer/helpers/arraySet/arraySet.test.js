const createSet = require("./index");

test('passes', () => {
    expect(true).toBe(true);
});

test('create set', () => {
    const set = createSet();
    expect(true).toBe(true);
});

test('one level deep', () => {
    const set = createSet();
    
    set.set([1]);
    set.set([2]);
    expect(set.exists([1])).toBe(true);
    expect(set.exists([2])).toBe(true);
});

test('multi levels', () => {
    const set = createSet();
    
    set.set([1, 3]);
    set.set([1, 3, 2]);
    expect(set.exists([1, 3])).toBe(true);
    expect(set.exists([1, 4])).toBe(false);
    expect(set.exists([1, 3, 2])).toBe(true);
});

test('delete', () => {
    const set = createSet();
    
    set.set([1, 3]);
    expect(set.exists([1, 3])).toBe(true);
    set.delete([1, 3]);
    expect(set.exists([1, 3])).toBe(false);
});
