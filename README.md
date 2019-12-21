gunfs
=====

`npm install gunfs`

```

GunFS.write(path, value, callback)  callback(err, gunResponce)<--

GunFS.read(path, callback, gunResponce)  callback(err, gunResponce ? gunResponceObject : gunResponceObject.value)<--

GunFS.delete(path, callback)  callback(err, true)<--

GunFS.list(callback) callback(err, [{ path, value, id, ct, mt }]);

GunFS.stats(path, callback) callback(err, { path, id, ct, mt })
            
GunFS.exist(path, callback) callback(err,true||null)

```

[https://github.com/bmatusiak](https://github.com/bmatusiak)