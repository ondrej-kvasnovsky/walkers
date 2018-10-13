# Walkers

A "game" that allows users to connect to a shared game board with obstacles and walk around. 
The green dot is you and the red dots are the other players. The gray dots are the obstacles.

[![Watch the demo](https://img.youtube.com/vi/3rGcEy7MA38/maxresdefault.jpg)](https://youtu.be/3rGcEy7MA38)


## Implementation details

* it is using `A*` algorithm to find the shortest path from a start point to an end point
* it is using web sockets to share user position and update position of other players
* it is using JavaScript, NodeJS, SocketIO and P5 libraries

## How to run the app

Clone it on local and run `npm install` and `npm run`. 
The app will be available on [http://localhost:3000](http://localhost:3000). 