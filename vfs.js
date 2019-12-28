"use strict";
var EventEmitter = require("events").EventEmitter;
// var gun = require("gun")();
function GunFS(dbRoot) {
    this.dbRoot = () => { return dbRoot };
    this.root = this.dbRoot().get("root");
    this.notify = this.dbRoot().get("notify");
    var _self = this;
    var initTime = Date.now();
    this.notify.on((a, b, c, d) => {
        if (a && a.t > initTime) {
            var event = {
                path: a.path,
                to: a.to,
                t: a.t,
                event: a.event
            };
            _self._emit(a.path, event);
            _self._emit("*", event);
        }
    });
}
GunFS.prototype = new EventEmitter();
GunFS.prototype._emit = GunFS.prototype.emit;
delete GunFS.prototype.emit;
GunFS.prototype.stat = async function(path, options, callback) {
    if (typeof options == "function") callback = options;
    var _self = this;
    var doPromise = false;
    if (!callback) doPromise = true;

    function run() {
        var $_path = path;
        if (typeof path == "string") {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
            path = path.split("/");
            var lookupCallback = function(err, list, item, contence) {
                if (err) return callback(err);
                path.shift();
                var $path = path[0];
                if (!$path || $path == "") {
                    return callback(null, list, $_path, item, contence);
                }
                var exist = null;
                for (var i in list) {
                    if (list[i].name == $path) {
                        list[i].uid = i;
                        exist = list[i];
                        break;
                    }
                }
                if (exist && path.length == 1) {
                    var stat = {
                        name: exist.name,
                        size: exist.size || 1,
                        mtime: exist.mt || 0,
                        ctime: exist.ct || 0,
                        mime: exist.type == "folder" ? "folder" : ""
                    };
                    return callback(null, stat);
                }
                if (!exist) return callback(404, null, $_path, item, contence);
                else {
                    var chain = item.get(exist.id);
                    getSet(chain, chain.get("contence"), lookupCallback);
                }
            };
            getSet(_self.root, _self.root.get("contence"), lookupCallback);
        }
        else {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
        }
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.readfile = async function(path, options, callback) {
    if (typeof options == "function") callback = options;
    var _self = this;
    var doPromise = false;
    if (!callback) doPromise = true;

    function run() {
        var $_path = path;
        // var _self = this;
        if (typeof path == "string") {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
            path = path.split("/");
            var lookupCallback = function(err, list, item, contence) {
                if (err) return callback(err);
                path.shift();
                var $path = path[0];
                if (!$path || $path == "") {
                    return callback(null, list, $_path, item, contence);
                }
                var exist = null;
                for (var i in list) {
                    if (list[i].name == $path) {
                        list[i].uid = i;
                        exist = list[i];
                        break;
                    }
                }
                if (exist && exist.value) return _self._decode(exist.value,(value)=>{
                    callback(null, value);
                });
                if (!exist) return callback(404, null, $_path, item, contence);
                else {
                    var chain = item.get(exist.id);
                    getSet(chain, chain.get("contence"), lookupCallback);
                }
            };
            getSet(_self.root, _self.root.get("contence"), lookupCallback);
        }
        else {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
        }
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.readdir = async function(path, options, callback) {
    if (typeof options == "function") callback = options;
    var _self = this;
    var doPromise = false;
    if (!callback) doPromise = true;

    function run() {
        var $_path = path;
        if (typeof path == "string") {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
            path = path.split("/");
            var lookupCallback = function(err, list, item, contence) {
                if (err) return callback(err);
                path.shift();
                var $path = path[0];
                if (!$path || $path == "") {
                    return callback(null, list, $_path, item, contence);
                }
                var exist = null;
                for (var i in list) {
                    if (list[i].name == $path) {
                        list[i].uid = i;
                        exist = list[i];
                        break;
                    }
                }
                if (exist && exist.value) return callback("path is a file");
                if (!exist) return callback(404, null, $_path, item, contence);
                else {
                    var chain = item.get(exist.id);
                    getSet(chain, chain.get("contence"), lookupCallback);
                }
            };
            getSet(_self.root, _self.root.get("contence"), lookupCallback);
        }
        else {
            if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
        }
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.mkfile = async function(path, options, callback) {
    var _self = this;
    
    var doPromise = false;
    if (!callback) doPromise = true;
    
    function getValue(cb) {
        var v = "";
        if (typeof options == "object" && options.stream) {
            options.stream.on("data", function(e) {
                if (e) v += e;
            });
            options.stream.on("end", function(e) {
                if (e) v += e;
                cb(v);
            });
        }
        else if (typeof options == "string") {
            v = options;
            cb(v);
        }
    }
    
    function run() {
        var parentDir = path.split("/");
        var file_name = parentDir.pop();
        parentDir = parentDir.join("/");
        if (parentDir == "") parentDir = "/";
        _self.readdir(parentDir, (err, list, name, item, contence) => {
            var exist = false;
            if (err == 404) return callback("parent dir not found");
            for (var i in list) {
                if (list[i].name == file_name) {
                    list[i].uid = i;
                    exist = list[i];
                    break;
                }
            }
            var $contence;
            var newFile;
            if (!exist) {
                var pathID = _self.dbRoot()._.gun.opt()._.opt.uuid();
                $contence = item.get(pathID);
                newFile = {
                    name: file_name,
                    //value: value,
                    id: pathID,
                    ct: Date.now(),
                    mt: Date.now(),
                    type: ""
                };
            }
            else {
                $contence = contence.get(exist.uid);
                newFile = {
                    mt: Date.now()
                };
            }
            getValue((value) => {
                _self._encode(value,(value)=>{
                    newFile.value = value;
                    newFile.size = lengthInUtf8Bytes(value);
                    $contence.put(newFile, function() {
                        _self.notify.put({ path: path, to: null, t: Date.now(), event: "change", type: "file"});
                        if (!exist) contence.set($contence, (res) => {
                            callback(null);
                        });
                        else callback(null);
                    });
                });
            });
        });
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.mkdir = async function(path, options, callback) {
    if (typeof options == "function") callback = options;
    var _self = this;
    var doPromise = false;
    if (!callback) doPromise = true;

    function run() {
        var parentDir = path.split("/")
        var folder_name = parentDir.pop();
        parentDir = parentDir.join("/")
        if (parentDir == "") parentDir = "/";
        _self.readdir(parentDir, (err, list, name, item, contence) => {
            if (err == 404) return callback("parent dir not found");
            for (var i in list) {
                if (list[i].name == folder_name) return callback("dir already exist");
            }
            var pathID = _self.dbRoot()._.gun.opt()._.opt.uuid();
            var dir = item.get(pathID);
            dir.put({ name: folder_name, id: pathID, ct: Date.now(), mt: Date.now(), type: "folder" }, () => {
                _self.notify.put({ path: path, to: null, t: Date.now(), event: "change", type: "folder" });
                contence.set(dir, (res) => {
                    callback(null);
                });
            });
        });
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.rmfile = async function(path, options, callback) {
    return await this.rmdir(path, options, callback);
};
GunFS.prototype.rmdir = async function(path, options, callback) {
    if (typeof options == "function") callback = options;
    var _self = this;
    var doPromise = false;
    if (!callback) doPromise = true;

    function run() {
        var parentDir = path.split("/");
        var folder_name = parentDir.pop();
        parentDir = parentDir.join("/");
        if (parentDir == "") parentDir = "/";
        _self.readdir(parentDir, (err, list, name, item, contence) => {
            var exist = false;
            if (err == 404) return callback("parent path not found");
            for (var i in list) {
                if (list[i].name == folder_name) {
                    list[i].uid = i;
                    exist = list[i];
                    break;
                }
            }
            if (exist) {
                // var pathID = exist.uid;
                // var dir = item.get(exist.id);
                var $contence = contence.get(exist.uid);
                //$contence.put(null,(res)=>{   //<---  should we create a trash bin?
                contence.unset($contence);
                _self.notify.put({ path: path, to: null, t: Date.now(), event: "delete" });
                callback(null);
                //})
            }
            else callback("path not found");
        });
    }
    if (doPromise) return new Promise((resolve) => {
        callback = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype.rename = async function(pathFrom, options, done) {
    var _self = this;
    var pathTo = options.to;
    var doPromise = false;
    if (!done) doPromise = true;

    function run() {
        getTo((err, to_list, to_name, to_item, to_contence, parentDir, $name) => {
            if (err) return done(err);
            getFrom((err, from_parentDir, dir, contence, uid) => {
                if (err) return done(err);
                var $contence = contence.get(uid);
                if (parentDir != from_parentDir) {
                    contence.unset(dir);
                    to_contence.set(dir);
                }
                $contence.put({ name: $name }, (res) => {
                    _self.notify.put({ path: pathFrom, to: parentDir + "/" + $name, t: Date.now(), event: "rename" });
                    done(null);
                });
            });
        });
    }

    function getTo(callback) {
        var parentDir = pathTo.split("/");
        var $name = parentDir.pop();
        parentDir = parentDir.join("/");
        if (parentDir == "") parentDir = "/";
        _self.readdir(parentDir, (err, list, name, item, contence) => {
            if (err == 404) return callback("parent path not found");
            for (var i in list) {
                if (list[i].name == $name) return callback("path already exist");
            }
            callback(err, list, name, item, contence, parentDir, $name);
        });
    }

    function getFrom(callback) {
        var parentDir = pathFrom.split("/");
        var $name = parentDir.pop();
        parentDir = parentDir.join("/");
        if (parentDir == "") parentDir = "/";
        _self.readdir(parentDir, (err, list, name, item, contence) => {
            var exist = false;
            if (err == 404) return callback("parent path not found");
            for (var i in list) {
                if (list[i].name == $name) {
                    list[i].uid = i;
                    exist = list[i];
                    break;
                }
            }
            if (exist) {
                var dir = item.get(exist.id);
                callback(null, parentDir, dir, contence, exist.uid);
            }
            else callback("file not found");
        });
    }
    if (doPromise) return new Promise((resolve) => {
        done = function(err, results) {
            resolve(err || results);
        };
        run();
    });
    else run();
};
GunFS.prototype._encode = function(value,cb){
    cb(value);
};
GunFS.prototype._decode = function(value,cb){
    cb(value);
};

async function getSet(listSet, contence, callback) {
    var ended = false;
    var list = [];
    var count = 0;
    contence.once(function(a, b, c, d) {
        if (ended) return;
        for (var i in a) {
            if (i.indexOf("_") == 0) continue;
            count += 1;
        }
        if (count == 0) {
            ended = true;
            return callback(null, listArrToObj(list), listSet, contence);
        }
    }).map(function(item) {
        return !!item ? item : null;
    }).once(function(a, b, c, d) {
        if (ended) return;
        if (a == null) count -= 1;
        if (a) list.push({ a: a, b: b });
        if (count == list.length) {
            ended = true;
            return callback(null, listArrToObj(list), listSet, contence);
        }
    });

    function listArrToObj(arr) {
        var obj = {};
        for (var i in arr) {
            obj[arr[i].b] = arr[i].a;
        }
        return obj;
    }
}
function lengthInUtf8Bytes(str) {
  // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}
module.exports = GunFS;