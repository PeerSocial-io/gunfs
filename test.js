var Gun = require("gun");

var logShot = {};
Gun.log = (a, b, c, d) => {
    if (logShot[a]) return;
    logShot[a] = true;
    //console.log(a,b,c,d);
};

Gun.log.once = (a, b, c, d) => {
    if (logShot[a]) return;
    logShot[a] = true;
    Gun.log(a, b, c, d);
};
require('gun/sea');
require('gun/lib/unset');

var gun = Gun(['https://gunjs.herokuapp.com/gun']);

var GunFS = require("./index.js");

var DBKEY = "testFS1";
var SETKEY = "test5";

var gunfs = new GunFS(gun.get(DBKEY), SETKEY);

var act = {};

act.a = function() {
    gunfs.write("/test1.txt", "testing4321", function(err, data) {
        if (err) throw err;
        if (data) {
            console.log("write test good");
            act.a2();
        }
    });
};

act.a2 = function() {
    gunfs.write("/test2.txt", "testing1234", function(err, data) {
        if (err) throw err;
        if (data) {
            console.log("write test good");
            act.b();
        }
    });
};

act.b = function() {
    gunfs.read("/test1.txt", function(err, data) {
        if (err) throw err;
        if (data) {
            if(data != "testing4321") 
                throw new Error("read test FAIL (file did not match test data)");
                
            console.log("read test good", data);
            act.b2();
        }
    });
};

act.b2 = function() {
    gunfs.read("/test2.txt", function(err, data) {
        if (err) throw err;
        if (data) {
            if(data.value != "testing1234") 
                throw new Error("read test FAIL (file did not match test data)");
                
            console.log("read test good", data);
            act.b3();
        }
    }, true);//<--   get gun ack
};


act.b3 = function() {
    gunfs.read("/test3.txt", function(err, data) {
        if (data) {
            throw new Error("read test on unknown file FAIL (file should not have data)");
        }
        else if (err) {
            console.log("read test on unknown file good");
            act.c();
        }
        else {
            throw new Error("read test on unknown file FAIL (err not given)");
        }
    }, true);
};


act.c = function() {
    gunfs.list(function(err, data) {
        if (err) throw err;
        if (data) {
            if (data.length != 2)
                throw new Error("list test count did not = 2");
                
            console.log("list test good", data);
            act.d();
        }
    });
};

act.d = function() {
    gunfs.delete("/test2.txt", function(err, data) {
        if (err) throw err;
        console.log("del test good", data);
        act.e();
    });
};


act.e = function() {
    gunfs.exist("/test1.txt", function(err, data) {
        if (err && !data) throw err;
        console.log("exist test good", data);
        act.f();
    });
};


act.f = function() {
    gunfs.stats("/test1.txt", function(err, data) {
        if (err && !data) throw err;
        console.log("stats test good", data);
        act.g();
    });
};


act.g = function() {
    gunfs.write("/test1.txt", "testing4321-update", function(err, data) {
        if (err) throw err;
        if (data) {
            console.log("write test good");
            act.h();
        }
    });
};


act.h = function() {
    gunfs.stats("/test1.txt", function(err, data) {
        if (err && !data) throw err;
        console.log("stats test good", data);
        act.i();
    });
};




act.i = function() {
    gunfs.delete("/test1.txt", function(err, data) {
        if (err) throw err;
        console.log("del test good", data);
        act.j();
    });
};


act.j = function() {
    gunfs.list(function(err, data) {
        if (err) throw err;
        if (data) {
            if(data.length > 0)
                throw new Error("read test on unknown file FAIL (file should not have data)");
            console.log("list test good", data);
            process.exit();
        }
    });
};


act.a();