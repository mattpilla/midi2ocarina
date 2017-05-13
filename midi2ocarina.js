#! /usr/bin/env node

const minimist = require('minimist');
const midiFileParser = require('midi-file-parser');
const fs = require('fs');
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
            sequence.push({noteNumber: number});
        }
    }
    // Translate sequence to ocarina range
    var translation = min - ((min + 1) % 12);
    for (let i = 0; i < sequence.length; i++) {
        sequence[i].noteNumber -= translation;
        if (sequence[i].noteNumber > 18) {
            // For now, only allow songs that that can shift octaves
            return console.log('Note range is too large: cannot translate to ocarina');
        }
    }
    console.log(sequence);
}

/*
|..|    0, -128,.........Z.Audrl.r|
`|..|    0, ${stick},.........${Z}.${A}${cU}${cD}${cR}${cL}.${R}|`
*/
const ocarinaNotes = [
    {a: true, down: true, z: true}, // B1
    {a: true, down: true},          // C1
    {a: true, z: true},             // C#1
    {a: true},                      // D1
    {a: true, r: true},             // D#1
    {cd: true, z: true},            // E1
    {cd: true},                     // F1
    {cd: true, r: true},            // F#
    {cd: true, up: true},           // G
    {cr: true, z: true},            // G#
    {cr: true},                     // A
    {cr: true, r: true},            // A#
    {cl: true},                     // B2
    {cl: true, r: true},            // C2
    {cu: true, z: true},            // C#2
    {cu: true},                     // D2
    {cu: true, r: true},            // D#2
    {cu: true, up: true},           // E2
    {cu: true, up: true, r: true}   // F2
];
