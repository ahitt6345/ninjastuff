var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var ID_NUM = 0;

var shinobiList = [];
var servers = [];
var accountDict = {};
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

var sakura   = new Shinobi("Sakura Haruno", 33640, 352377, 1782, 1497);
var yagura   = new Shinobi("Yagura", 47420, 286050, 1717, 1509);
var hanzo    = new Shinobi("Hanzo", 39016, 321381, 1715, 1529);
var chojuro  = new Shinobi("Chojuro", 23959, 335014, 2528, 1550);
var zabuza   = new Shinobi("Zabuza Momochi", 48418, 291408, 1750, 1495);
var kisame   = new Shinobi("Kisame", 45727, 273990, 1718, 1529);
var mei      = new Shinobi("Mei Terumi", 49732, 286117, 1718, 1577);
var Utakata  = new Shinobi("Utakata", 35073, 365410, 1778, 1568);
var tobirama = new Shinobi("Tobirama Senju", 48448, 291914, 1748, 1496);
var itachi   = new Shinobi("Itachi Uchiha", 48161, 274359, 1673, 1523);
var deidara  = new Shinobi("Deidara", 47064, 268898, 1639, 1537);
var han      = new Shinobi("Han", 28388, 368982, 1750, 1579);

var GameServer = function() {
    this.players = [];
    this.worldLevel = 1;
    this.campaignLevels = [];
    servers.push(this);
};
var Account = function(username, email, password) {
    this.email = email;
    this.password = password; // this field is debatable, i'd rather get the password from an encrypted file and 
    // never store it inside of the program, this is just insecure lol but it's necessary so that i can get to coding the fun parts now,
    // i'll come back to this later
    this.playerList = [];
};
var Player = function(account, nickname, servernum) {
    this.nickname = nickname;
    this.account = account;
    // default vars
    this.id = ID_NUM++; // we may have to generate it here, or when we generate the player object, i'm not sure yet this will be temporary... unless it works lol
    this.level = 1;
    this.exp = 0;
    this.ninjaList = [];
    this.accumulated = {
        minutes: 0,
        hours: 0,
    };
    this.gold = 0;
    this.copper = 1000; // starting with this amount... for now >:D, might have to worry about big numbers, but not yet :P
    this.exp = 1;
    this.inventory = [];
    this.teamFormation = {};
    this.servernum = servernum;
    servers[servernum].players.push(this)
};


app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.get('*', function(req, res) {
    res.sendFile(__dirname + req.url);
})
io.on('connection', function(socket) {
    socket.emit('Hello', {
        message: ("hi " + Date.now())
    });
    socket.on('register', function(data) {
        /*
            data is an object that contains 
            
            email [str]
            password [str]
            server [int]

            properties
        */
        var email = data.email;
        var password = data.password;
        var servernum = data.server;
        var username = data.username;
        var acc = new Account(email, password); // creates a new account using the information
        
        var player = new Player(account, username, servernum); // player object is a representation of an account that is binded to a specific server and is the object that stores the properties that the player actually interacts with. 
        acc.playerList.push(player);
        accountDict[email] = acc; // stores the account in a dictionary for easy access


    });
    socket.on('login', function(data) {
        var email = data.email;
        var password = data.password;
        var serv = data.server;
        if (accountDict[email] !== undefined && accountDict[email].password === password) { // if account exists, and the password from the client matches the server, bind the account to the current socket and allow manual actions for this account to interact with game data.game
            // also this account/password matching stuff is mad sketchy, i don't think this is the optimal way to set this up at all, granted it IS on the server so maybe it's okay as long as we don't send the password back to the client like this.
            socket.account = accountDict[email];
            var playerExists = false;
            for (var i = 0; i < accountDict[email].playerList.length; i++) {
                if (accountDict[email].playerList[i].servernum === serv) {
                    socket.playerObject = accountDict[email].playerList[i];
                    playerExists = true;
                    break;
                }
            }
            if (playerExists) { // player found and bound
                // give client access to the things that the player object has. 
                socket.emit('LOGGED_IN', {playerObj:socket.playerObject});
                return;
            }
        } 
        socket.emit("NOT_FOUND", {}); // no data required here, this event will only be emitted in the case that the account can't be found from the user's input. 
    });
});

http.listen(port, function() {
    console.log('listening on *:' + port);
});

new GameServer();
var rewardLoop = setInterval(function() {
    /*
        Player must manually collect the rewards otherwise it will max out at 36 hours. 
        We may include microtransactions in order to lessen the burden of this particular mechanic. 
        Or we might even make it harder so that we can reward people with more time on their hands 
        by reducing the amount of hours that players have to collect
    */
    servers.forEach(function(server) { // for each server in 'servers' list
        server.players.forEach(function(player) { // for each player in the server
            var accumulated = player.accumulated;
            if (accumulated.hours < 36) { // if player has not accumulated 36 hours
                if (accumulated.minutes >= 60) { // if player has accumulated 60 minutes, convert to hour, otherwise add another minute. 
                    accumulated.hours++;
                    accumulated.minutes = 1;
                } else {
                    accumulated.minutes++;
                }
            }
        });
    });

    /* TODO: for each socket that has a user binded to the session, send an update to the reward system on their side */


}, 60 * 1000); // every 60 seconds


