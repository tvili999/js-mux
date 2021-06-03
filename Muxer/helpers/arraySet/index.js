const valueSymbol = Symbol('value');

const createSet = () => {
    let rootObject = {};

    const getContainer = (key, create) => {
        key = [...key];
        let current = rootObject;
        while(key.length > 0) {
            const currentKey = key.shift();
            if(!current[currentKey]) {
                if(create) {
                    current[currentKey] = {};
                }
                else {
                    return undefined;
                }
            }
            current = current[currentKey];
        }
        return current;
    }

    return {
        exists: (key) => {
            const container = getContainer(key);
            if(!container)
                return false;
            return container[valueSymbol] || false;
        },
        set: (key) => {
            const container = getContainer(key, true);
            container[valueSymbol] = true;
        },
        delete: (key) => {
            const container = getContainer(key);
            if(!container)
                return undefined;

            const value = container[valueSymbol];

            if(container.hasOwnProperty(valueSymbol))
                delete container[valueSymbol];

            return value;
        }
    }
};

module.exports = createSet;