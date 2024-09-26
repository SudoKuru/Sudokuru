import errorHandler from "../HandleError";
import { Solver } from "../Solver";
import { StrategyEnum, getBoardArray } from "../Sudoku";
import { Hint } from "../Hint";
import { getHint } from "../../lib/Hint";
import { Board } from "../Board";

const expressApp = require('express');
const app = expressApp();
const cors = require("cors");
const port = 3100;

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
        else if (Number(req.query.nakedSingle) === i) {
            algorithm.push(StrategyEnum.NAKED_SINGLE);
        }
        else if (Number(req.query.hiddenSingle) === i) {
            algorithm.push(StrategyEnum.HIDDEN_SINGLE);
        }
        else if (Number(req.query.nakedPair) === i) {
            algorithm.push(StrategyEnum.NAKED_PAIR);
        }
        else if (Number(req.query.hiddenPair) === i) {
            algorithm.push(StrategyEnum.HIDDEN_PAIR);
        }
        else if (Number(req.query.pointingPair) === i) {
            algorithm.push(StrategyEnum.POINTING_PAIR);
        }
        else if (Number(req.query.nakedTriplet) === i) {
            algorithm.push(StrategyEnum.NAKED_TRIPLET);
        }
        else if (Number(req.query.hiddenTriplet) === i) {
            algorithm.push(StrategyEnum.HIDDEN_TRIPLET);
        }
        else if (Number(req.query.pointingTriplet) === i) {
            algorithm.push(StrategyEnum.POINTING_TRIPLET);
        }
        else if (Number(req.query.nakedQuadruplet) === i) {
            algorithm.push(StrategyEnum.NAKED_QUADRUPLET);
        }
        else if (Number(req.query.hiddenQuadruplet) === i) {
            algorithm.push(StrategyEnum.HIDDEN_QUADRUPLET);
        }
        else if (Number(req.query.nakedQuintuplet) === i) {
            algorithm.push(StrategyEnum.NAKED_QUINTUPLET);
        }
        else if (Number(req.query.hiddenQuintuplet) === i) {
            algorithm.push(StrategyEnum.HIDDEN_QUINTUPLET);
        }
        else if (Number(req.query.nakedSextuplet) === i) {
            algorithm.push(StrategyEnum.NAKED_SEXTUPLET);
        }
        else if (Number(req.query.hiddenSextuplet) === i) {
            algorithm.push(StrategyEnum.HIDDEN_SEXTUPLET);
        }
        else if (Number(req.query.nakedSeptuplet) === i) {
            algorithm.push(StrategyEnum.NAKED_SEPTUPLET);
        }
        else if (Number(req.query.hiddenSeptuplet) === i) {
            algorithm.push(StrategyEnum.HIDDEN_SEPTUPLET);
        }
        else if (Number(req.query.nakedOctuplet) === i) {
            algorithm.push(StrategyEnum.NAKED_OCTUPLET);
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

app.get('/getBackFilteredPuzzles', (req, res) => {
    let puzzles:string[] = JSON.parse(req.query.puzzles);
    let strategy:StrategyEnum = Number(req.query.strategy);
    let filteredPuzzles:string[] = [];
    for (let i:number = 0; i < puzzles.length; i++){
        let board:Board = new Board(puzzles[i]);
        let strategies:boolean[] = board.getStrategies();
        if (strategies[strategy]){
            filteredPuzzles.push(puzzles[i]);
        }
    }
    res.send(filteredPuzzles);
});

app.use(errorHandler);

app.listen(port, () => console.log(`Listening on: ${port}`));
