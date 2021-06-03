module.exports = (idTaken, maxConnections = 10000) => {
    let _maxConnections = maxConnections;

    let _nextId = -1;

    return () => {
        let id;
        let origNextId = _nextId;
        do {
            _nextId++;
            if(_nextId == _maxConnections) {
                _nextId = 0;
            }
            id = _nextId;
            if(_nextId == origNextId) {
                id = _maxConnections;
                _maxConnections += maxConnections;
            }
        } while(!idTaken(id));
        return id;
    }
}