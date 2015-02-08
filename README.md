# MIDIsock

A program that allows MIDI messages to be sent wirelessly.

## Requirements

- Node.js
- nw.js v0.8.6
- C/C++ compiler such as GCC
- ALSA

## Server Requirements

- Linux/OSX

## Building Modules

```shell
npm install
sudo npm install -g nw-gyp
cd node_modules/midi
nw-gyp rebuild --target=0.8.6
```
