const eq = require("./eq");

test('pass', () => {
    expect(true).toBe(true);
})

test('same arrays return true', () => {
    const result = eq([1,2,3], [1,2,3]);
    expect(result).toBe(true);
});

test('different length array return false', () => {
    const result = eq([1,2], [1,2,3]);
    expect(result).toBe(false);
});

test('same length different array return false', () => {
    const result = eq([1,2, 4], [1,2,3]);
    expect(result).toBe(false);
});

test('one element different array return false', () => {
    const result = eq([0], [1]);
    expect(result).toBe(false);
});

test('same references return true', () => {
    const ref = {};
    const result = eq(ref, ref);
    expect(result).toBe(true);
});

test('truthy/falsy difference return false', () => {
    expect(eq(true, false)).toBe(false);
    expect(eq(false, true)).toBe(false);
});

test('truthy/falsy difference return false', () => {
    expect(eq(true, false)).toBe(false);
    expect(eq(false, true)).toBe(false);
});
