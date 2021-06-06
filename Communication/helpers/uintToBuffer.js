const uintToBufferBE = (num, bytes = 4) => {
    const array = [];
    if(bytes == 0) {
        while(num) {
            array.unshift(num & 0xff);
            num = num >> 8;
        }
    }
    else {
        for(let i = bytes; i; --i) {
            array.unshift(num & 0xff);
            num = num >> 8;
        }
    }
    return Buffer.from(array);
}

module.exports = {
    uintToBufferBE
};