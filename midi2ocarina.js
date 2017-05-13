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
    for (let i = 0; i < track.length; i++) {
        let note = track[i];
        if (note.noteNumber !== undefined && note.deltaTime) {
            // Play a note
            console.log(`${note.noteNumber}: ${note.deltaTime}`);
        }
    }
}
