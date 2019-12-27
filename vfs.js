"use strict";

var EventEmitter = require("events").EventEmitter;
// var gun = require("gun")();

function GunFS(dbRoot) {
    this.dbRoot = () => { return dbRoot };
    this.root = this.dbRoot().get("root");
    this.notify = this.dbRoot().get("notify");


    var _self = this;
    var changeMap = {};
    var initTime = Date.now();
    this.notify.on((a, b, c, d) => {
        if (a && a.t > initTime) {
            var event = {
                path:a.path, 
                to:a.to,  
                t:a.t, 
                event:a.event
            }
            _self._emit(a.path, event)
            _self._emit("*", event)
        }
    })
}

GunFS.prototype = new EventEmitter();
GunFS.prototype._emit = GunFS.prototype.emit;
delete GunFS.prototype.emit;

/*

GunFS.prototype._listdir = function(directory, callback) {

    var ended = false;
    var count = 0;
    var list = [];
    directory.once((a, b) => {
        for (var i in a) {
            if (i.indexOf("_") == 0) continue;
            count += 1;
        }
        if (count == 0)
            callback(null, list);
    }).map().once((a, b, c, d) => {
        if (ended) return;
        if (a == null) count -= 1;
        
        if(a)
            list.push({ a:a,b:b,c:c,d:d} );

        if (count == list.length) {
            ended = true;
            callback(null, list);
        }
    });
};



GunFS.prototype.rmdir = function(path, callback) {
    var _self = this;
    this._listdir((err, list) => {
        var exist = false;
        for (var i in list) {
            if (list[i].a.path == path) {
                exist = list[i];
                break;
            }
        }
        
        if(exist){
                
            _self.directories.get(exist.b).put(null,(a)=>{
                callback(null, true);
            });
            
            
        }else callback(true);
    });
}*/

var findNode = async function(path, callback){
    var $resolve;
    
    function finish(err){
        if(callback)
            callback(err);
        if($resolve)
            $resolve(err);
    }
    
    var $_path = path;
    // var _self = this;
    if (typeof path == "string") {
        if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
        path = path.split("/");

        var lookupCallback = function(err, list, item, contence) {
            if (err)
                return finish(err)

            path.shift();
            var $path = path[0];

            if (!$path || $path == "") {
                return finish(null, list, $_path, item, contence);
            }
            var exist = null;

            for (var i in list) {
                if (list[i].name == $path) {
                    list[i].uid = i;
                    exist = list[i];
                    break;
                }
            }

            if (exist) {
                var stat = {
                    name: exist.name,
                    size: exist.size || 1,
                    mtime: exist.mt || 0,
                    ctime: exist.ct || 0,
                    mime: exist.type == "folder" ? "folder" : ""
                };
                return finish(null, stat);
            }


            if (!exist)
                return finish(404, null, $_path, item, contence);
            else {
                var chain = item.get(exist.id);
                listSet(chain, chain.get("contence"), lookupCallback);
            }
        };

        listSet(this.root, this.root.get("contence"), lookupCallback);

    }
    else {
        if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
    }
    
    return new Promise((resolve) => { $resolve = resolve; })
};






GunFS.prototype.stat = async function(path, callback) {
    var $resolve;
    
    function finish(err){
        if(callback)
            callback(err);
        if($resolve)
            $resolve(err);
    }
    
    var $_path = path;
    // var _self = this;
    if (typeof path == "string") {
        if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
        path = path.split("/");

        var lookupCallback = function(err, list, item, contence) {
            if (err)
                return callback(err)

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

            if (exist) {
                var stat = {
                    name: exist.name,
                    size: exist.size || 1,
                    mtime: exist.mt || 0,
                    ctime: exist.ct || 0,
                    mime: exist.type == "folder" ? "folder" : ""
                };
                return callback(null, stat);
            }


            if (!exist)
                return callback(404, null, $_path, item, contence);
            else {
                var chain = item.get(exist.id);
                listSet(chain, chain.get("contence"), lookupCallback);
                //callback(null, $pathID, $path, parent)
            }
        };

        listSet(this.root, this.root.get("contence"), lookupCallback);

    }
    else {
        if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
    }

    return new Promise((resolve) => { $resolve = resolve; })
};

GunFS.prototype.readfile = async function(path, callback) {
    var $resolve;
    
    function finish(err){
        if(callback)
            callback(err);
        if($resolve)
            $resolve(err);
    }
    
    var $_path = path;
    // var _self = this;
    if (typeof path == "string") {
        if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
        path = path.split("/");

        var lookupCallback = function(err, list, item, contence) {
            if (err)
                return callback(err)

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

            if (exist && exist.value)
                return callback(null, exist.value);

            if (!exist)
                return callback(404, null, $_path, item, contence);
            else {
                var chain = item.get(exist.id);
                listSet(chain, chain.get("contence"), lookupCallback);
                //callback(null, $pathID, $path, parent)
            }
        };

        listSet(this.root, this.root.get("contence"), lookupCallback);

    }
    else {
        if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
    }

    return new Promise((resolve) => { $resolve = resolve; })
};

GunFS.prototype.readdir = async function(path, callback) {
    var $resolve;
    
    function finish(err,a,b,c,d){
        if(callback)
            callback(err,a,b,c,d);
        if($resolve)
            $resolve(err,a,b,c,d);
    }
    
    var $_path = path;
    // var _self = this;
    if (typeof path == "string") {
        if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
        path = path.split("/");

        var lookupCallback = function(err, list, item, contence) {
            if (err)
                return finish(err)

            path.shift();
            var $path = path[0];

            if (!$path || $path == "") {
                return finish(null, list, $_path, item, contence);
            }
            var exist = null;

            for (var i in list) {
                if (list[i].name == $path) {
                    list[i].uid = i;
                    exist = list[i];
                    break;
                }
            }

            if (exist && exist.value)
                return finish("path is a file");

            if (!exist)
                return finish(404, null, $_path, item, contence);
            else {
                var chain = item.get(exist.id);
                listSet(chain, chain.get("contence"), lookupCallback);
            }
        };

        listSet(this.root, this.root.get("contence"), lookupCallback);

    }
    else {
        if (!(path.indexOf("/") == 0)) throw new Error("Must be full path starting with /");
    }

    return new Promise((resolve) => { $resolve = resolve; })
};

GunFS.prototype.mkfile = async function(path, value, callback) {
    var $resolve;
    
    function finish(err){
        if(callback)
            callback(err);
        if($resolve)
            $resolve(err);
    }
    
    var _self = this;

    var parentDir = path.split("/")
    var file_name = parentDir.pop();
    parentDir = parentDir.join("/")
    if (parentDir == "") parentDir = "/";

    this.readdir(parentDir, (err, list, name, item, contence) => {
        var exist = false;
        if (err == 404)
            return callback("parent dir not found");

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
                value: value,
                id: pathID,
                ct: Date.now(),
                mt: Date.now(),
                type: ""
            };
        }
        else {
            $contence = contence.get(exist.uid);
            newFile = {
                value: value,
                mt: Date.now()
            };
        }

        $contence.put(newFile, function() {
            _self.notify.put({ path:path, to:null, t:Date.now(), event: "change"})
            if (!exist)
                contence.set($contence, (res) => {
                    callback(null);
                });
            else
                callback(null);
        });


    });
    
    return new Promise((resolve) => { $resolve = resolve; })
};

GunFS.prototype.mkdir = async function(path, callback) {
    var $resolve;
    
    function finish(err){
        if(callback)
            callback(err);
        if($resolve)
            $resolve(err);
    }
    
  
    var _self = this;

    var parentDir = path.split("/")
    var folder_name = parentDir.pop();
    parentDir = parentDir.join("/")
    if (parentDir == "") parentDir = "/";

    this.readdir(parentDir, (err, list, name, item, contence) => {

        if (err == 404)
            return finish("parent dir not found");

        for (var i in list) {
            if (list[i].name == folder_name)
                return finish("dir already exist");
        }


        var pathID = _self.dbRoot()._.gun.opt()._.opt.uuid();
        var dir = item.get(pathID);
        dir.put({ name: folder_name, id: pathID, ct: Date.now(), mt: Date.now(), type: "folder" }, () => {
            _self.notify.put({ path:path, to:null, t:Date.now(), event: "change"})
            contence.set(dir, (res) => {
                finish(null);
            });
        });

    });
    
    return new Promise((resolve) => { $resolve = resolve; })
};

GunFS.prototype.rmfile = async function(path, callback) {
    return await this.rmdir(path, callback);
};

GunFS.prototype.rmdir = async function(path, callback) {
    var $resolve;
    
    var _self = this;

    var parentDir = path.split("/")
    var folder_name = parentDir.pop();
    parentDir = parentDir.join("/")
    if (parentDir == "") parentDir = "/";

    this.readdir(parentDir, (err, list, name, item, contence) => {
        var exist = false;
        if (err == 404)
            return callback("parent path not found");

        for (var i in list) {
            if (list[i].name == folder_name) {
                list[i].uid = i;
                exist = list[i];
                break;
            }
        }

        if (exist) {
            var pathID = exist.uid;
            var dir = item.get(exist.id);
            var $contence = contence.get(exist.uid);
            //$contence.put(null,(res)=>{
            contence.unset($contence);
            _self.notify.put({ path:path, to:null, t:Date.now(), event: "delete"})
            callback(null);
            //})
        }
        else
            callback("path not found");

    });
    
    return new Promise((resolve) => { $resolve = resolve; });
};

GunFS.prototype.rename = async function(pathFrom, pathTo, done) {
    var $resolve;
    function finish(err){
        if(done)
            done(err);
        if($resolve)
            $resolve(err);
    }
    
    
    var _self = this;

    getTo((err, to_list, to_name, to_item, to_contence, parentDir, folder_name) => {
        if (err) return done(err);

        getFrom((err, from_parentDir, dir, contence, uid) => {
            if (err) return done(err);

            var $contence = contence.get(uid);
            //$contence.put(null,(res)=>{
            if (parentDir != from_parentDir) {
                contence.unset(dir);
                to_contence.set(dir);
            }
            $contence.put({ name: folder_name }, (res) => {
                _self.notify.put({ path:pathFrom, to:parentDir+"/"+folder_name,  t:Date.now(), event: "rename"})
                done(null)
            })
        })
    })

    function getTo(callback) {
        var parentDir = pathTo.split("/")
        var $name = parentDir.pop();
        parentDir = parentDir.join("/")
        if (parentDir == "") parentDir = "/";

        _self.readdir(parentDir, (err, list, name, item, contence) => {
            if (err == 404)
                return callback("parent path not found");

            for (var i in list) {
                if (list[i].name == $name)
                    return callback("path already exist");
            }

            callback(err, list, name, item, contence, parentDir, $name)

        });
    }

    function getFrom(callback) {
        var parentDir = pathFrom.split("/")
        var $name = parentDir.pop();
        parentDir = parentDir.join("/")
        if (parentDir == "") parentDir = "/";

        _self.readdir(parentDir, (err, list, name, item, contence) => {
            var exist = false;
            if (err == 404)
                return callback("parent path not found");

            for (var i in list) {
                if (list[i].name == $name) {
                    list[i].uid = i;
                    exist = list[i];
                    break;
                }
            }

            if (exist) {
                //var pathID = exist.uid;
                var dir = item.get(exist.id);
                callback(null, parentDir, dir, contence, exist.uid);
            }
            else
                callback("file not found");

        });
    }
    
    
    return new Promise((resolve) => { $resolve = resolve; });
};

async function listSet(listSet, contence, callback) {

    var ended = false;
    var list = [];
    var count = 0;
    var chain = contence.once(function(a, b, c, d){
        this;
        var self = this;
        if (ended) return;
        for (var i in a) {
            if (i.indexOf("_") == 0) continue;
            count += 1;
        }
        if (count == 0) {
            ended = true;
            return callback(null, listArrToObj(list), listSet, contence);
        }


    }).map((item) => {
        var self = this;
        
        return !!item ? item : null;
    }).once(function(a, b, c, d){
        var self = this;
        
        if (ended) return;
        if (a == null)
            count -= 1;

        if (a)
            list.push({ a: a, b: b });

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


module.exports = GunFS;