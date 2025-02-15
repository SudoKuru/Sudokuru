import errorHandler from "../HandleError";
import { Solver } from "../Solver";
import { StrategyEnum, getBoardArray } from "../Sudoku";
import { Hint } from "../Hint";
import * as fs from 'fs';
import * as readline from 'readline';
import { getHint } from "../../lib/Hint";
import { Board } from "../Board";

const expressApp = require('express');
const app = expressApp();
const cors = require("cors");
const port = 3100;

const activeGame = {
    userID: "",
    puzzle: "003070040006002301089000000000107080517000006000400000271009005095000000000020000",
    currentTime: 0,
    moves: [{
        puzzleCurrentState: "000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        puzzleCurrentNotesState: "111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111"
    }],
    numHintsAskedFor: 0,
    numWrongCellsPlayed: 0,
    numWrongCellsPlayedPerStrategy: {
        OBVIOUS_SINGLE: 0,
        HIDDEN_SINGLE: 0,
        OBVIOUS_PAIR: 0,
        OBVIOUS_TRIPLET: 0,
        OBVIOUS_QUADRUPLET: 0,
        OBVIOUS_QUINTUPLET: 0,
        OBVIOUS_SEXTUPLET: 0,
        OBVIOUS_SEPTUPLET: 0,
        OBVIOUS_OCTUPLET: 0,
        HIDDEN_PAIR: 0,
        HIDDEN_TRIPLET: 0,
        HIDDEN_QUADRUPLET: 0,
        HIDDEN_QUINTUPLET: 0,
        HIDDEN_SEXTUPLET: 0,
        HIDDEN_SEPTUPLET: 0,
        HIDDEN_OCTUPLET: 0,
        POINTING_PAIR: 0,
        POINTING_TRIPLET: 0,
        BOX_LINE_REDUCTION: 0,
        X_WING: 0,
        SWORDFISH: 0,
        SINGLES_CHAINING: 0
    }
};

app.use(cors());
app.use(expressApp.urlencoded({ extended: true }));
app.use(expressApp.json());

app.get('/solver/nextStep', (req, res) => {
    let board: string[][] = getBoardArray(req.query.board);
    let algorithm: StrategyEnum[] = new Array();
    for (let i: number = 1; i <= StrategyEnum.COUNT; i++) {
        if (Number(req.query.amendNotes) === i) {
            algorithm.push(StrategyEnum.AMEND_NOTES);
        }
        else if (Number(req.query.obviousSingle) === i) {
            algorithm.push(StrategyEnum.OBVIOUS_SINGLE);
        }
        else if (Number(req.query.hiddenSingle) === i) {
            algorithm.push(StrategyEnum.HIDDEN_SINGLE);
        }
        else if (Number(req.query.obviousPair) === i) {
            algorithm.push(StrategyEnum.OBVIOUS_PAIR);
        }
        else if (Number(req.query.hiddenPair) === i) {
            algorithm.push(StrategyEnum.HIDDEN_PAIR);
        }
        else if (Number(req.query.pointingPair) === i) {
            algorithm.push(StrategyEnum.POINTING_PAIR);
        }
        else if (Number(req.query.obviousTriplet) === i) {
            algorithm.push(StrategyEnum.OBVIOUS_TRIPLET);
        }
        else if (Number(req.query.hiddenTriplet) === i) {
            algorithm.push(StrategyEnum.HIDDEN_TRIPLET);
        }
        else if (Number(req.query.pointingTriplet) === i) {
            algorithm.push(StrategyEnum.POINTING_TRIPLET);
        }
        else if (Number(req.query.obviousQuadruplet) === i) {
            algorithm.push(StrategyEnum.OBVIOUS_QUADRUPLET);
        }
        else if (Number(req.query.hiddenQuadruplet) === i) {
            algorithm.push(StrategyEnum.HIDDEN_QUADRUPLET);
        }
        else if (Number(req.query.obviousQuintuplet) === i) {
            algorithm.push(StrategyEnum.OBVIOUS_QUINTUPLET);
        }
        else if (Number(req.query.hiddenQuintuplet) === i) {
            algorithm.push(StrategyEnum.HIDDEN_QUINTUPLET);
        }
        else if (Number(req.query.obviousSextuplet) === i) {
            algorithm.push(StrategyEnum.OBVIOUS_SEXTUPLET);
        }
        else if (Number(req.query.hiddenSextuplet) === i) {
            algorithm.push(StrategyEnum.HIDDEN_SEXTUPLET);
        }
        else if (Number(req.query.obviousSeptuplet) === i) {
            algorithm.push(StrategyEnum.OBVIOUS_SEPTUPLET);
        }
        else if (Number(req.query.hiddenSeptuplet) === i) {
            algorithm.push(StrategyEnum.HIDDEN_SEPTUPLET);
        }
        else if (Number(req.query.obviousOctuplet) === i) {
            algorithm.push(StrategyEnum.OBVIOUS_OCTUPLET);
        }
        else if (Number(req.query.hiddenOctuplet) === i) {
            algorithm.push(StrategyEnum.HIDDEN_OCTUPLET);
        }
        else if (Number(req.query.simplifyNotes) === i) {
            algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        }
    }
    let notes: string[][];
    if (req.query.notes !== "undefined") {
        notes = JSON.parse(req.query.notes);
    }
    else {
        notes = undefined;
    }
    let solver: Solver = new Solver(board, algorithm, notes);
    let hint: Hint = solver.nextStep();
    if (hint !== null) {
        res.send({ board: solver.getBoard(), notes: solver.getNotes(), info: hint.getInfo(), action: hint.getAction(), cause: hint.getCause(), groups: hint.getGroups() });
    }
    else {
        res.send({ board: solver.getBoard(), notes: null, info: null, action: null, cause: null, groups: null });
    }
});

app.get('/getHint', (req, res) => {
    let solution:string[][] = (new Board(req.query.boardString)).getSolution();
    res.send(getHint(JSON.parse(req.query.board), JSON.parse(req.query.notes), undefined, solution));
});

app.get('/api/v1/user/newGame', (req, res) => {
    // Overwrites activeGame.txt with activeGame constant and then returns it
    try {
        let writer = fs.createWriteStream('activeGame.txt');
        writer.write(JSON.stringify(activeGame));
        writer.end();
    } catch(err) {
        console.log(err);
    }
    res.send(activeGame);
});

app.get('/api/v1/user/activeGames', (req, res) => {
    // Gets the current activeGame from activeGame.txt or throws 404 error if activeGame.txt doesn't exist
    if (!fs.existsSync("activeGame.txt")) {
        res.sendStatus(404);
        return;
    }

    const rl = readline.createInterface({
        input: fs.createReadStream("activeGame.txt"),
        crlfDelay: Infinity
    });
    rl.on('line', (line) => {
        res.send(JSON.parse(line));
    });
});

app.patch('/api/v1/activeGames', (req, res) => {
    // Returns failure if there isn't an active game to save progress to
    if (!fs.existsSync("activeGame.txt")) {
        res.sendStatus(404);
        return;
    }

    // Reads in current active game
    const rl = readline.createInterface({
        input: fs.createReadStream("activeGame.txt"),
        crlfDelay: Infinity
    });
    let activeGame:JSON;
    rl.on('line', (line) => {
        activeGame = JSON.parse(line);
        // Update activeGame
        Object.keys(req.body).forEach(function(key) {
            activeGame[key] = req.body[key];
        });

        // Saves changes to active game
        try {
            let writer = fs.createWriteStream('activeGame.txt');
            writer.write(JSON.stringify(activeGame));
            writer.end();
        } catch(err) {
            console.log(err);
            console.log(JSON.stringify(activeGame));
            res.sendStatus(500);
            return;
        }
        res.sendStatus(200);
        return;
    });
});

app.delete('/api/v1/activeGames', (req, res) => {
    try {
        fs.unlinkSync("activeGame.txt");
    } catch(err) {
        res.sendStatus(500);
        return;
    }
    res.sendStatus(200);
    return;
});

app.get('/api/v1/user/drill', (req, res) => {
    res.send({ puzzle: "003070040006002301089000000000107080517000006000400000271009005095000000000020000" });
});

app.use(errorHandler);

app.listen(port, () => console.log(`Listening on: ${port}`));
