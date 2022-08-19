var socket = io('http://localhost:3000');
socket.on('connection', function(socket) {

});

var Shinobi = function(name, atk, hp, def, spd, attributes) {
    this.name = name;
    this.atk = atk;
    this.hp = hp;
    this.def = def;
    this.spd = spd;
    this.cri = 0;
    this.ctrl = 0;
    /*
    this.criRes = 0; // let's exclude these fields for now for simplicity's sake
    this.dmgRed = 0;
    this.healing = 0;
    this.dmgbonus = 0;
    this.mdmg = 0;
    this.mdmgred = 0;
    this.cridmg = 1.5;
    this.ctrlres = 0;
    this.acc = 1;
    this.dodge = 0;
    this.healrec = 0;
    this.tdmg = 0;
    this.tdmgred = 0;*/
    shinobiList.push(this);
};

var imageStore = [];

var picnames = ['amenin.png', 'danzo.png', 'firec.png', 'kazenin.png', 'kisame.png', 'mei.png', 'minato.png', 'naruto.png', 'pretapath.png', 'suigetsu.png', 'tobi.png', 'tobirama.png', 'tsunade.png', 'utakata.png', 'windc.png'];
var preload = function() {
    // some black magic in order to preload every single image lol
    var sloadImage = function() {
        imageStore.push(loadImage.apply(null, arguments));
    };
    picnames.forEach(function(pic) {
        sloadImage(pic);
    });
};
var setup = function() {

};
var draw = function() {

};
var submitRegistrationData = function() {
    var email = prompt("What is your email?");
    var password = prompt("What is your password?");
    var servernum = prompt("What server would you like to connect to?");
    var username = prompt(`Please give us a display name for your avatar in server ${servernum}.`);
    socket.emit("register", { // this will need to be replaced by something WAY more secure than this, this is just stupid lol
        'email': email,
        'password': password,
        'server': server,
        'username': username
    });
};
var submitLoginData = function() {
    /*var email = document.getElementById('email').value; // when we actually implement UI, we'll use these, but for now we're gonna use the alert boxes instead
    var password = document.getElementById('password').value;
    var selectedServer = document.getElementById('server').value;*/
    var email = prompt("What is your email?");
    var password = prompt("What is your password?");
    var servernum = prompt("What server would you like to connect to?");

    socket.once("NOT_FOUND", function(data) { // start listening for the error message that tells you if the email doesn't exist in the database
        var reg = confirm("Profile has not been found. Would you like to register with this information instead?"); // replace with some other UI BS
        if (reg) { // if person wants to register
            var username = prompt(`You already gave us your email, password, and server number. Please give us a display name for your avatar in server ${servernum}.`);
            socket.emit("register", { // this will need to be replaced by something WAY more secure than this, this is just stupid lol
                'email': email,
                'password': password,
                'server': server,
                'username': username
            });
        }
    })
    socket.emit("login", { // this will need to be replaced by something WAY more secure than this, this is just stupid lol
        'email': email,
        'password': password,
        'server': server
    });

};