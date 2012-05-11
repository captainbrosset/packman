//require("colors");

var charSequence = ["◐", "◓", "◑", "◒"];
//var charSequence = ["⬖", "⬘", "⬗", "⬙"];
//var charSequence = ["〫", "〪", "〭", "〬"];

var cursor = 0;
var interval = null;
var freq = 100;

// Inspired (stolen) from Mocha
// https://github.com/visionmedia/mocha/blob/master/mocha.js
function hideCursor(){
  process.stdout.write('\033[?25l');
};

function showCursor(){
  process.stdout.write('\033[?25h');
};

function start() {
    if(!interval) {
        hideCursor();
            process.on('SIGINT', function(){
            showCursor();
            console.log('\n');
            process.exit();
        });

        console.log();
        interval = setInterval(display, freq);
    }
};

function stop() {
    if(interval) {
        clearInterval(interval);
        interval = null;
    }
};

function display() {
    if(cursor < charSequence.length - 1) {
        cursor ++;
    } else {
        cursor = 0;
    }

    process.stdout.write("\r " + charSequence[cursor].yellow + " watching ...".yellow);
};

module.exports.start = start;