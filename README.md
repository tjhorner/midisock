# MIDIsock

A program that allows MIDI messages to be sent wirelessly.

## Requirements

- Node.js
- nw.js v0.8.6
- C/C++ compiler such as GCC
- Python

## Server Requirements

**If you're on Windows**

- A virtual MIDI device such as [LoopBe1](http://www.nerds.de/en/download.html)

**If you're on Linux/OSX**

- `libasound2-dev` package
- ALSA, installed and configured

## Building Modules

```shell
npm install
sudo npm install -g nw-gyp
cd node_modules/midi
nw-gyp rebuild --target=0.8.6
```
