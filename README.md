# SimpleDB WebView

SimpleDB WebView is a web-based browser and explorer for SimpleDB databases with a clean UI. The backend communication is done with [Node.js](https://github.com/joyent/node) and the [simpledb](https://github.com/rjrodger/simpledb) module.

_This project is at a very early stage. Contributions are welcome!_

## Screenshot

![Screenshot](http://arturadib.github.com/simpledb-webview/screenshot.png)

## Installation and usage

Make sure a recent version of Node.js is installed (tested with v0.4.7). 

Clone this repo and fire up the web server:

    git clone git@github.com:arturadib/simpledb-webview.git
    cd simpledb-webview
    node server.js
    
Point your browser to `localhost:8989`. Voila.

## Current limitations

* Can only read data
* No pagination - only the first 1000 items are shown at a time

## To-do

* Pagination
* Refresh button - should reflect changes in # of items
* Inline editing
