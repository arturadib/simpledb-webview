# SimpleDB WebView

SimpleDB WebView is a web-based browser and explorer for SimpleDB databases with a clean UI. The backend communication is done with [Node.js](https://github.com/joyent/node) and the [simpledb](https://github.com/rjrodger/simpledb) module.

_This project is at a very early stage. Contributions are welcome!_

## Demo

A demo of this app is available at:

https://simpledb.herokuapp.com

**Note carefully the secure `https` prefix**. Without it your AWS credentials will travel unencrypted all the way to `herokuapp.com`. Still, although I've gone out of my way to offer this secure channel, _I make no guarantees whatsoever about the safety of your AWS credentials! Use at your own risk._

To avoid this additional security layer, install the app locally on your computer as described below.

Here's a screenshot of the app in action:

![Screenshot](https://github.com/arturadib/simpledb-webview/raw/master/README-screenshot.png)

## Features

* Automatic consolidation of attributes into table format
* One-click attribute sorting

## Getting started

Make sure a recent version of Node.js is installed (tested with v0.4.7). 

Clone this repo and fire up the web server:

    git clone git@github.com:arturadib/simpledb-webview.git
    cd simpledb-webview
    npm install
    node server.js
    
Point your browser to `localhost:8989`. Voila.
