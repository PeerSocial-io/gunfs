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

var GunFS = require("./vfs.js");

var DBKEY = "testFS8";

var gunfs = new GunFS(gun.get(DBKEY));

var act = {};

var fireCount = 0;
gunfs.on("*", function(a) {
    console.log("path watch fired", a.path, a);
    fireCount += 1;
});

act.start = function(){
    fireCount = 0;
    act.a();
};

act.a = function() {
    console.log("----------------");
    gunfs.readdir("/", function(err, list) {
        if(err) throw err;
        console.log("a readdir",err, list);
        act.a2();
    });

};

act.a2 = function() {
    console.log("----------------");
    gunfs.mkdir("/test", function(err, list) {
        //if(err) throw err;
        console.log("a2 mkdir",err, list);
        act.a2aa();
    });

};
act.a2aa = function() {
    console.log("----------------");
    gunfs.mkdir("/testaa", function(err, list) {
        //if(err) throw err;
        console.log("a2aa mkdir",err, list);
        act.a2a();
    });

};

act.a2a = function() {
    console.log("----------------");
    gunfs.mkdir("/test/nested", function(err, list) {
        //if(err) throw err;
        console.log("a2a mkdir",err, list);
        act.a2ab();
    });

};

act.a2ab = function() {
    console.log("----------------");
    gunfs.stat("/test", function(err, stat) {
        if(err) throw err;
        console.log("a2ab stat",err, stat);
        act.a2b();
    });

};

act.a2b = function() {
    console.log("----------------");
    gunfs.readdir("/test", function(err, list) {
        if(err) throw err;
        console.log("a2b readdir",err, list);
        act.a2c();
    });

};

act.a2c = function() {
    console.log("----------------");
    gunfs.rename("/test/nested",{to:"/testaa/renamed"}, function(err, list) {
        if(err) throw err;
        console.log("a2c rename",err, list);
        act.a2d();
    });

};

act.a2d = function() {
    console.log("----------------");
    gunfs.readdir("/testaa", function(err, list) {
        if(err) throw err;
        console.log("a2d readdir",err, list);
        act.a3();
    });

};



act.a3 = function() {
    console.log("----------------");
    gunfs.readdir("/", function(err, list) {
        if(err) throw err;
        console.log("a3 readdir",err, list);
        act.a4();
    });

};

act.a4 = function() {
    console.log("----------------");
    gunfs.rmdir("/test", function(err, list) {
        if(err) throw err;
        console.log("a4 rmdir",err, list);
        act.a4a();
    });

};
act.a4a = function() {
    console.log("----------------");
    gunfs.rmdir("/testaa", function(err, list) {
        if(err) throw err;
        console.log("a4 rmdir",err, list);
        act.a5();
    });

};

act.a5 = function() {
    console.log("----------------");
    gunfs.readdir("/", function(err, list) {
        if(err) throw err;
        console.log("a5 readdir",err, list);
        act.b();
    });

};

act.b = function(){
    console.log("----------------");
    gunfs.mkfile("/test.txt","testing123", function(err, list) {
        if(err) throw err;
        console.log("b mkfile",err, list);
        act.b2();
    });
};


act.b2 = function() {
    console.log("----------------");
    gunfs.readdir("/", function(err, list) {
        if(err) throw err;
        console.log("b2 readdir",err, list);
        act.b2a();
    });

};


act.b2a = function() {
    console.log("----------------");
    gunfs.readdir("/test.txt", function(err, list) {
        if(!err) throw new Error("Should have failed here");
        console.log("b2a readdir",err, list);
        act.b2b();
    });

};
act.b2b = function() {
    console.log("----------------");
    gunfs.readfile("/test.txt", function(err, value) {
        if(err) throw err;
        console.log("b2b readfile",err, value);
        act.b2c();
    });

};

act.b2c = function() {
    console.log("----------------");
    gunfs.stat("/test.txt", function(err, stat) {
        if(err) throw err;
        console.log("b2c stat",err, stat);
        act.b2d();
    });

};

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
        act.c1a();
    });

};

//async
act.c1a = async function(){
    console.log("----------------");
    var res = await gunfs.readdir("/");
    console.log("c1a await gunfs.readdir", res);
    act.c1b();
    
};

act.c1b = async function(){
    console.log("----------------");
    var res = await gunfs.mkdir("/asyncTest");
    console.log("c1b await gunfs.mkdir", res);
    act.c1c();
};

act.c1c = async function(){
    console.log("----------------");
    var res = await gunfs.readdir("/");
    console.log("c1c await gunfs.readdir", res);
    act.c1d();
};


act.c1d = async function(){
    console.log("----------------");
    var res = await gunfs.mkfile("/asyncTest/filetesting.txt","somedata");
    console.log("c1d await gunfsgunfs.mkfile", res);
    act.c1e();
};

act.c1e = async function(){
    console.log("----------------");
    var res = await gunfs.readfile("/asyncTest/filetesting.txt");
    console.log("c1e await gunfsgunfs.mkfile", res);
    act.c1f();
};


act.c1f = async function(){
    console.log("----------------");
    var res = await gunfs.readdir("/asyncTest/");
    console.log("c1f await gunfs.readdir", res);
    act.c1g();
};

act.c1g = async function(){
    console.log("----------------");
    var res = await gunfs.rename("/asyncTest/filetesting.txt",{to:"/asyncTest/filetesting-renamed.txt"});
    console.log("c1g await gunfs.rename", res);
    act.c1h();
};


act.c1h = async function(){
    console.log("----------------");
    var res = await gunfs.readdir("/asyncTest/");
    console.log("c1h await gunfs.readdir", res);
    act.c1i();
};

act.c1i = async function(){
    console.log("----------------");
    var res = await gunfs.stat("/asyncTest/filetesting-renamed.txt");
    console.log("c1i await gunfs.stat", res);
    act.c1j();
};
act.c1j = async function(){
    console.log("----------------");
    var res = await gunfs.rmdir("/asyncTest");
    console.log("c1j await gunfs.rmdir", res);
    act.c1k();
};
act.c1k = async function(){
    console.log("----------------");
    var res = await gunfs.readdir("/");
    console.log("c1k await gunfs.readdir", res);
    act.done();
};

act.done = function() {
    console.log("----------------");
    console.log("events fired",fireCount);
    test_done();
};

// global.act = act;
// global.gun = gun;
// global.gunfs = gunfs;
act.start();

function test_done() { setTimeout(process.exit, 1000); }