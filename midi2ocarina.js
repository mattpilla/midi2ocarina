#! /usr/bin/env node

var minimist = require('minimist');

var args = minimist(process.argv.slice(2));

// no midi file supplied; show usage
if (!args._.length) {
    return console.log(
        '\nmidi file argument is required\n\n'
        + 'usage: node midi2ocarina <midi_file>\n'
        + 'example: node midi2ocarina midi/test.mid\n\n'
        + 'midi_file\tfile to convert'
    );
} else {
    console.log(args._[0]);
}
