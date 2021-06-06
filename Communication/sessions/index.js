const _idGenerator = require("../helpers/idGenerator");
const createMap = require("../helpers/arrayMap");
const { uintToBufferBE } = require("../helpers/uintToBuffer");

const createSessions = () => {
    const _sessions = createMap();
    const idGenerator = _idGenerator(x => x !== 0 && !_sessions.exists(uintToBufferBE(x)));

    const api = {
        open: () => {
            const id = uintToBufferBE(idGenerator());

            return {
                id,
                close: () => {
                    _sessions.delete(id);
                }
            }
        }
    };

    return api;
};

module.exports = createSessions;