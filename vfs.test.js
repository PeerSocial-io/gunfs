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

var DBKEY = "testFS8";
//var SETKEY = "test11";

var gunfs = new GunFS(gun.get(DBKEY));

var act = {};

var fireCount = 0;
gunfs.on("*", function(a) {
    console.log("path watch fired", a.path, a);
    fireCount += 1;
});


act.a = function() {
    console.log("----------------")
    gunfs.readdir("/", function(err, list) {
        if(err) throw err;
        console.log("a readdir",err, list);
        act.a2()
    })

}

act.a2 = function() {
    console.log("----------------")
    gunfs.mkdir("/test", function(err, list) {
        //if(err) throw err;
        console.log("a2 mkdir",err, list);
        act.a2aa()
    })

}
act.a2aa = function() {
    console.log("----------------")
    gunfs.mkdir("/testaa", function(err, list) {
        //if(err) throw err;
        console.log("a2aa mkdir",err, list);
        act.a2a()
    })

}

act.a2a = function() {
    console.log("----------------")
    gunfs.mkdir("/test/nested", function(err, list) {
        //if(err) throw err;
        console.log("a2a mkdir",err, list);
        act.a2ab()
    })

}

act.a2ab = function() {
    console.log("----------------")
    gunfs.stat("/test", function(err, stat) {
        if(err) throw err;
        console.log("a2ab stat",err, stat);
        act.a2b()
    })

}

act.a2b = function() {
    console.log("----------------")
    gunfs.readdir("/test", function(err, list) {
        if(err) throw err;
        console.log("a2b readdir",err, list);
        act.a2c()
    })

}

act.a2c = function() {
    console.log("----------------")
    gunfs.rename("/test/nested","/testaa/renamed", function(err, list) {
        if(err) throw err;
        console.log("a2c rename",err, list);
        act.a2d()
    })

}

act.a2d = function() {
    console.log("----------------")
    gunfs.readdir("/testaa", function(err, list) {
        if(err) throw err;
        console.log("a2d readdir",err, list);
        act.a3()
    })

}



act.a3 = function() {
    console.log("----------------")
    gunfs.readdir("/", function(err, list) {
        if(err) throw err;
        console.log("a3 readdir",err, list);
        act.a4()
    })

}

act.a4 = function() {
    console.log("----------------")
    gunfs.rmdir("/test", function(err, list) {
        if(err) throw err;
        console.log("a4 rmdir",err, list);
        act.a4a()
    })

}
act.a4a = function() {
    console.log("----------------")
    gunfs.rmdir("/testaa", function(err, list) {
        if(err) throw err;
        console.log("a4 rmdir",err, list);
        act.a5()
    })

}

act.a5 = function() {
    console.log("----------------")
    gunfs.readdir("/", function(err, list) {
        if(err) throw err;
        console.log("a5 readdir",err, list);
        act.b()
    })

}

act.b = function(){
    console.log("----------------")
    gunfs.mkfile("/test.txt","testing123", function(err, list) {
        if(err) throw err;
        console.log("b mkfile",err, list);
        act.b2()
    })
}


act.b2 = function() {
    console.log("----------------")
    gunfs.readdir("/", function(err, list) {
        if(err) throw err;
        console.log("b2 readdir",err, list);
        act.b2a()
    })

}


act.b2a = function() {
    console.log("----------------")
    gunfs.readdir("/test.txt", function(err, list) {
        if(!err) throw new Error("Should have failed here");
        console.log("b2a readdir",err, list);
        act.b2b()
    })

}
act.b2b = function() {
    console.log("----------------")
    gunfs.readfile("/test.txt", function(err, value) {
        if(err) throw err;
        console.log("b2b readfile",err, value);
        act.b2c()
    })

}

act.b2c = function() {
    console.log("----------------")
    gunfs.stat("/test.txt", function(err, stat) {
        if(err) throw err;
        console.log("b2c stat",err, stat);
        act.b2d()
    })

}

act.b2d = function() {
    console.log("----------------");
    gunfs.rmfile("/test.txt", function(err, list) {
        if(err) throw err;
        console.log("b2d rmfile",err, list);
        act.b2e();
    });

};


act.b2e = function() {
    console.log("----------------");
    gunfs.readdir("/", function(err, list) {
        if(err) throw err;
        console.log("b2e readdir",err, list);
        act.done();
    });

};

//async
act.b3a = async function(){
    console.log("----------------")
    var dirList = await gunfs.readdir("/");
    console.log(dirList);
}


act.done = function() {
    console.log("----------------")
    console.log("events fired",fireCount)
    //test_done()
}

global.act = act;
global.gun = gun;
global.gunfs = gunfs;
//act.a();

function testMachine() {

    var machines = gun.get('machines');
    var machineID = gun._.opt.uuid();

    var machine = gun.get(machineID);
    machine.put({ name: "targus" });
    // let's add machine to the list of machines;
    machines.set(machine, () => {});
    // now let's remove machine from the list of machines
    //machines.unset(machine);

    var cogs = gun.get('cogs');

    // setTimeout(process.exit,1000)

    function listSet(set, callback) {
        var ended = false;
        var list = [];
        var machineCount = 0;
        set.once((a, b) => {
            if (ended) return;
            for (var i in a) {
                if (i.indexOf("_") == 0) continue;
                machineCount += 1;
            }
            if (machineCount == 0) {
                ended = true;
                return callback(null, list);
            }


        }).map((item) => {
            return !!item ? item : null;
        }).once((a, b) => {
            if (ended) return;
            if (a == null)
                machineCount -= 1;

            if (a)
                list.push({ a: a, b: b });

            if (machineCount == list.length) {
                ended = true;
                return callback(null, list);
            }
        });
    }

    listSet(machines, (err, m) => {
        console.log("machine", m)
        var oldMachine = gun.get(m[0].b)
        machines.unset(oldMachine);
        cogs.set(oldMachine);


        listSet(cogs, (err, c) => {
            console.log("cogs", c)

            if (c[0]) {
                var oldMachine = gun.get(c[0].b);
                cogs.unset(oldMachine);
                machines.set(oldMachine);

                listSet(machines, (err, m) => {
                    console.log("machine", m)
                    test_done()
                })

            }

        })


    })

}

function test_done() { setTimeout(process.exit, 1000); };