// Inspired (and partly stolen) from Mocha
// https://github.com/visionmedia/mocha/blob/master/mocha.js


// Frames, independent of the time packman watcher has been running
//var frames = ["◐", "◓", "◑", "◒"],
var frames = [
        "    <>    ",
        "   <<>>   ",
        "  <<<>>>  ",
        " <<<<>>>> ",
        "<<<<<>>>>>",
        "<<<<  >>>>",
        "<<<    >>>",
        "<<      >>",
        "<        >",
        "          "
    ],
    cursor = 0,
    interval = null,
    freq = 70;

// Messages, get updated depending on how long packman watcher has been running
// Multiply index of the array by 10 to get the number of seconds
var messages = [
    "waiting for changes ...                                             ".yellow,
    "waiting for changes ...                                             ".yellow,
    "still waiting ...                                                   ".yellow,
    "still waiting ...                                                   ".yellow,
    "are you still there?                                                ".yellow,
    "are you there?                                                      ".yellow,
    "what the fuck ....                                                  ".yellow,
    "I need to quit this job                                             ".yellow,
    "who do you think I am?                                              ".yellow,
    "I don't care, do what you want, I'm not packaging your files anymore".yellow,
    "NOT watching ...                                                    ".yellow,
    "still NOT watching ...                                              ".yellow,
    "(sigh) ... I don't have anything else to do anyway ...              ".yellow,
    "just let me know when you're back                                   ".yellow,
];
var messageIndex = 0;

function hideCursor() {process.stdout.write('\033[?25l');};
function showCursor() {process.stdout.write('\033[?25h');};

function play() {
    if(!interval) {
        // FIXME: crashes on Windows ??? no idea why for now
        //hideCursor();
        /*process.on('SIGINT', function(){
            showCursor();
            console.log('\n');
            process.exit();
        });*/

        console.log();
        interval = setInterval(function() {
            process.stdout.write("\r " + frames[cursor++ % frames.length].yellow + " " + messages[messageIndex]);
        }, freq);
    }
};

function updateWaitingMessage(duration) {
    var _index = Math.floor(duration / 10);
    messageIndex = _index >= messages.length ? messages.length - 1 : _index;
};

module.exports.play = play;
module.exports.updateWaitingMessage = updateWaitingMessage;
