# RSSchool NodeJS websocket task
> Websocket battleship server and static http server

## Installation
1. Clone/download repo
2. `npm install`

## Usage
**Development**

`npm run start:dev`

* App served @ `http://localhost:8181` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost:8181` without nodemon

---

**All commands**

Command | Description
--- | ---
`npm run start:dev` | App served @ `http://localhost:8181` with nodemon
`npm run start` | App served @ `http://localhost:8181` without nodemon

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.

## Score

**Basic Scope**

- Websocket
    - **+6** Implemented workable websocket server
    - **+6** Handle websocket clients connection/disconnection properly
    - **+10** Websocket server message handler implemented properly
    - **+10** Websocket server message sender implemented properly
- User
    - **+5** Create user with password in temprorary database
    - **+5** User validation
- Room
    - **+6** Create game room
    - **+6** Add user to game room
    - **+6** Start game
    - **+6** Finish game
    - **+8** Update room's game state
    - **+4** Update player's turn   
    - **+8** Update players winner table
- Ships
    - **+10** Locate ship to the game board
- Game
    - **+8** Attack
    - **+4** Random attack

**Advanced Scope**
- **+30** Task implemented on Typescript 
- **+20** Codebase is separated (at least 4 modules)
- **+30** Make bot for single play 