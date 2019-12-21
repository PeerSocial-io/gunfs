gunfs
=====

`npm install gunfs`

```
var GunFS = require("gunfs");//GunFS(dbRoot, FileSystemKey)
var gunfs = new GunFS(gun.get("you place the spot where files are"), "and you can have multipul sets in the spot");

gunfs.write(path, value, callback)  callback(err, gunResponce)<--

gunfs.read(path, callback, gunResponce)  callback(err, gunResponce ? gunResponceObject : gunResponceObject.value)<--

gunfs.delete(path, callback)  callback(err, true)<--

gunfs.list(callback) callback(err, [{ path, value, id, ct, mt }]);

gunfs.stats(path, callback) callback(err, { path, id, ct, mt })
            
gunfs.exist(path, callback) callback(err,true||null)

```

[https://github.com/bmatusiak](https://github.com/bmatusiak)