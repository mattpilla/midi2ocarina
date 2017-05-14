#! /usr/bin/env node

const minimist = require('minimist');
const midiFileParser = require('midi-file-parser');
const fs = require('fs');
const path = require('path');
const args = minimist(process.argv.slice(2));

// no midi file supplied; show usage
if (!args._.length) {
    return console.log(
        '\nmidi file argument is required\n\n'
        + 'usage: node midi2ocarina <midi_file>\n'
        + 'example: node midi2ocarina midi/test.mid\n\n'
        + 'midi_file\tfile to convert'
    );
} else {
    /*
    |..|    0, -128,.........Z.Audrl.r|
    `|..|    0, ${stick},.........${Z}.${A}${cU}${cD}${cR}${cL}.${R}|`
    */
    var ocarinaNotes = [
        {a: 'A', z: 'Z', stick: -128},  // B1
        {a: 'A', stick: -128},          // C1
        {a: 'A', z: 'Z'},               // C#1
        {a: 'A'},                       // D1
        {a: 'A', r: 'R'},               // D#1
        {cd: 'd', z: 'Z'},              // E1
        {cd: 'd'},                      // F1
        {cd: 'd', r: 'R'},              // F#
        {cd: 'd', stick: 127},          // G
        {cr: 'r', z: 'Z'},              // G#
        {cr: 'r'},                      // A
        {cr: 'r', r: 'R'},              // A#
        {cl: 'l'},                      // B2
        {cl: 'l', r: 'R'},              // C2
        {cu: 'u', z: 'Z'},              // C#2
        {cu: 'u'},                      // D2
        {cu: 'u', r: 'R'},              // D#2
        {cu: 'u', stick: 127},          // E2
        {cu: 'u', r: 'R', stick: 127}   // F2
    ];

    // Parse given midi
    var file = fs.readFileSync(args._[0], 'binary');
    var midi = midiFileParser(file);
    // Just do the first track for now. TODO: Multiple tracks
    let track = midi.tracks[1];
    // Collect each note and find minimum (for translation)
    var min = 128;
    var sequence = []; // collect each note
    for (let i = 0; i < track.length; i++) {
        let note = track[i];
        let number = note.noteNumber;
        if (number !== undefined && note.deltaTime) {
            if (number < min) {
                min = number;
            }
            sequence.push({noteNumber: number, deltaTime: note.deltaTime});
        }
    }
    // Translate sequence to ocarina range and generate Lua script
    var script = '';
    var translation = min - ((min + 1) % 12);
    for (let i = 0; i < sequence.length; i++) {
        let ocarinaNote = sequence[i].noteNumber - translation;
        if (ocarinaNote > 18) {
            // For now, only allow songs that that can shift octaves
            return console.log('Note range is too large: cannot translate to ocarina');
        }
        script += playNote(ocarinaNote, sequence[i].deltaTime);
    }
    // Save script in the lua folder
    var filename = 'lua/' + path.basename(args._[0]) + '.lua';
    fs.writeFile(filename, script, err => {
        if (err) {
            return console.log(err);
        }
        console.log('Lua script generated: ' + filename);
    });
}

// Gives character for input string if button is pressed, or its default otherwise
function buttonChar(index, button) {
    return ocarinaNotes[index][button] ? ocarinaNotes[index][button] : '.';
}

// Pads stick direction with spaces to be 5 characters long
function padStick(val) {
    val = val == '.' ? 0 : val;
    return ('     ' + val).slice(-5);
}

// Generates Lua lines for playing the ocarina note at the given index
function playNote(index, time) {
    let buttons = ['stick', 'z', 'a', 'cu', 'cd', 'cr', 'cl', 'r'];
    let input = {}; // button values for input string
    for (let i = 0; i < buttons.length; i++) {
        input[buttons[i]] = buttonChar(index, buttons[i]);
    }
    let note = `
joypad.setfrommnemonicstr("|..|    0,${padStick(input.stick)},.........${input.z}.${input.a}${input.cu}${input.cd}${input.cr}${input.cl}.${input.r}|")
emu.frameadvance()`;
    return note.repeat(6 * time/48);
}
