# SimpleDB WebView

SimpleDB WebView is a web-based browser for SimpleDB databases with a clean UI. The front-end code is organized with [Backbone.js](http://documentcloud.github.com/backbone) and the back-end server is implemented with [Node.js](https://github.com/joyent/node) and its [simpledb](https://github.com/rjrodger/simpledb) module.

_This project is at a very early stage. Contributions are welcome!_

## Demo

A demo of this app is available at the link below. Due to [certain limitations](http://devcenter.heroku.com/articles/dyno-idling) with Heroku's hosting, *it might take several seconds* for the app to boot up.

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

Clone this repo, install the dependencies via `npm`, and fire up the web server:

    git clone git@github.com:arturadib/simpledb-webview.git
    cd simpledb-webview
    npm install
    node server.js
    
Point your browser to `localhost:8989`. Voila.
