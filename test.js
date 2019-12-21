var Gun = require("gun");

require('gun/sea');
require('gun/lib/unset');


//hide gun output to express the test output
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

var gun = Gun( /*['https://gunjs.herokuapp.com/gun']*/ );

var GunFS = require("./index.js");

var DBKEY = "testFS1";
var SETKEY = "test10";

var gunfs = new GunFS(gun.get(DBKEY), SETKEY);

var act = {};

var fireCount = 0;
gunfs.on("*", function(a) {
    console.log("path watch fired", a.path, a);
    fireCount += 1;
});

//a test = writing
act.a = function() {
    console.log("a-------------write");
    gunfs.write("/test1.txt", "testing4321", function(err, data) {
        if (err) throw err;
        if (data) {
            console.log("write test good");
            act.a2();
        }
    });
};

act.a2 = function() {
    console.log("a2-------------write");
    gunfs.write("/folder/test2.txt", "testing1234", function(err, data) {
        if (err) throw err;
        if (data) {
            console.log("write test good");
            act.b();
        }
    });
};

//b test = reading
act.b = function() {
    console.log("b-------------read");
    gunfs.read("/test1.txt", function(err, data) {
        if (err) throw err;
        if (data) {
            if (data != "testing4321")
                throw new Error("read test FAIL (file did not match test data)");

            console.log("read test good", data);
            act.b2();
        }
    });
};

act.b2 = function() {
    console.log("b2-------------read");
    gunfs.read("/folder/test2.txt", function(err, data) {
        if (err) throw err;
        if (data) {
            if (data.value != "testing1234")
                throw new Error("read test FAIL (file did not match test data)");

            console.log("read test good", data);
            act.b3();
        }
    }, true); //<--   get gun ack
};

act.b3 = function() {
    console.log("b3-------------read-fail");
    gunfs.read("/folder/test3.txt", function(err, data) {
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

//c test = listing
act.c = function() {
    console.log("c-------------list");
    gunfs.list(function(err, data) {
        if (err) throw err;
        if (data) {
            if (data.length != 2)
                throw new Error("list test count did not = 2");

            console.log("list test good", data);
            act.c2();
        }
    });
};


act.c2 = function() {
    console.log("c2-------------list-path");
    gunfs.list("/folder/", function(err, data) {
        if (err) throw err;
        if (data) {
            if (data.length != 1)
                throw new Error("list test count did not = 1");

            console.log("list test good", data);
            act.d();
        }
    });
};

//d test = deleting
act.d = function() {
    console.log("d-------------delete");
    gunfs.delete("/folder/test2.txt", function(err, data) {
        if (err) throw err;
        console.log("del test good", data);
        act.e();
    });
};

//e test = existing
act.e = function() {
    console.log("e-------------exist");
    gunfs.exist("/test1.txt", function(err, data) {
        if (err && !data) throw err;
        console.log("exist test good", data);
        act.f();
    });
};

//f test = info
act.f = function() {
    console.log("f-------------stats");
    gunfs.stats("/test1.txt", function(err, data) {
        if (err && !data) throw err;
        console.log("stats test good", data);
        act.f2();
    });
};

act.f2 = function() {
    console.log("f2-------------write");
    gunfs.write("/test1.txt", "testing4321-update", function(err, data) {
        if (err) throw err;
        if (data) {
            console.log("write test good");
            act.f3();
        }
    });
};

act.f3 = function() {
    console.log("f3-------------stats");
    gunfs.stats("/test1.txt", function(err, data) {
        if (err && !data) throw err;
        console.log("stats test good", data);
        act.g();
    });
};

//g test = deleting test data (cleanup test)
act.g = function() {
    console.log("g-------------delete");
    gunfs.delete("/test1.txt", function(err, data) {
        if (err) throw err;
        console.log("del test good", data);
        act.h();
    });
};


//g test = list test empty (cleanup test check)
act.h = function() {
    console.log("h-------------list");
    gunfs.list(function(err, data) {
        if (err) throw err;
        if (data) {
            if (data.length > 0)
                throw new Error("list test fail, (list should be empty)");
            console.log("list test good", data);
            act.done();
        }
    });
};

act.done = function(){
    console.log("done-------------events");
    if (fireCount != 5)// a, a2, d, f2, g  
        throw new Error("Events count did not match");
        
    console.log("EVENTS FIRED", fireCount);
    process.exit();
};

    //have no files to start test
    gunfs.list(function(err, data) { 
        if(err) throw err;
        if (data)
            if (data.length > 0)
                throw new Error("list test fail, (list should be empty)");

        var testTimer = 3000;
        setTimeout(act.a, testTimer);
        console.log("test starting in " + (testTimer / 1000) + "sec");
    });
