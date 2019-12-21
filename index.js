var EventEmitter = require("events").EventEmitter;

function GunFS(dbRoot, FileSystemKey) {
    var _self = this;
    var initTime = Date.now();
    this.dbRoot = () => { return dbRoot };
    this.FileSystemKey = FileSystemKey;
    this.filesSet = this.dbRoot().get(this.FileSystemKey + "-files");

    var changeMap = {};

    this.filesSet.once().map().on((a, b, c, d) => {
        if (a && a.mt > initTime) {
            var fileObject = {
                id:b,
                ct: a.ct,
                mt: a.mt,
                path: a.path,
                value: a.value
            }
            if (!changeMap[a.path] || changeMap[a.path] < a.mt) {
                changeMap[a.path] = a.mt;
                _self._emit(fileObject.path, fileObject, a, b, c, d)
                _self._emit("*", fileObject, a, b, c, d)
            }
        }
    })
}

GunFS.prototype = new EventEmitter();
GunFS.prototype._emit = GunFS.prototype.emit;
delete GunFS.prototype.emit;

GunFS.prototype.write = function(path, value, callback) {
    var _self = this;
    this.exist(path, (err, exist) => {
        if (err, exist) {
            _self.read(path, (err, read) => {
                if (!err) {
                    var writeFile = this.dbRoot().get(this.FileSystemKey + path);
                    writeFile.put({ path: path, value: value, ct: read.ct, mt: Date.now() });
                    this.filesSet.set(writeFile, (res) => {
                        callback(null, res);
                    });
                }
            }, true);
        }
        else {
            var writeFile = this.dbRoot().get(this.FileSystemKey + path);
            writeFile.put({ path: path, value: value, ct: Date.now(), mt: Date.now() });
            this.filesSet.set(writeFile, (res) => {
                callback(null, res);
            });
        }
    });
};

GunFS.prototype.read = function(path, callback, returnGunObject) {
    this.dbRoot().get(this.FileSystemKey + path).once((res) => {
        if (res && !res.err) {
            if (returnGunObject) {
                callback(null, res);
            }
            else {
                callback(null, res.value);
            }
        }
        else {
            callback(true);
        }
    });
};

GunFS.prototype.delete = function(path, callback) {
    var delFile = this.dbRoot().get(this.FileSystemKey + path);
    this.write(path, null, () => {
        this.filesSet.unset(delFile);
        setTimeout(() => {
            callback(null, true);
        }, 10)
    });
};

GunFS.prototype.list = function(path, callback) {
    if (!callback && path) {
        callback = path;
        path = null;
    }
    var ended = false;
    var count = 0;
    var list = [];
    this.filesSet.once((a, b) => {
        for (var i in a) {
            if (i.indexOf("_") == 0) continue;
            count += 1;
        }
        if (count == 0)
            callback(null, list);
    }).map().once((a, b) => {
        if (ended) return;
        if (a == null) count -= 1;

        if (path != null) {
            if (a && a.path.indexOf(path) == 0)
                list.push({ path: a.path, value: a.value, id: b, ct: a.ct, mt: a.mt });
            else
                count -= 1;
        }
        else if (a && a.value != null)
            list.push({ path: a.path, value: a.value, id: b, ct: a.ct, mt: a.mt });
        else count -= 1;

        if (count == list.length) {
            ended = true;
            callback(null, list);
        }
    });
};

GunFS.prototype.stats = function(path, callback) {
    this.dbRoot().get(this.FileSystemKey + path).once((a, b) => {
        if (a && !a.err) {
            callback(null, {
                path: a.path,
                id: b,
                ct: a.ct,
                mt: a.mt
            });
        }
        else {
            callback(true);
        }
    });
};

GunFS.prototype.exist = function(path, callback) {
    this.dbRoot().get(this.FileSystemKey + path).once((res) => {
        if (res && !res.err)
            if (res.value) return callback(null, true);
        callback(null);
    });
};

module.exports = GunFS;