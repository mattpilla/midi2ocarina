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
    console.log(midi.tracks);
}
