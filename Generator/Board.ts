import { CustomError, CustomErrorEnum } from "./CustomError";
import { getBoardArray, SudokuEnum } from "./Sudoku";
import { Solver } from "./Solver";
import { Hint } from "./Hint";
import { StrategyEnum } from "./Sudoku"
import { Cell } from "./Cell";
import { Group } from "./Group";

const GAME_LENGTH_DIFFICULTY_MULTIPLIER: number = 0.02;

/**
 * Constructed using board string
 * Throws exception if invalid board
 * Returns:
 * Board (2d array, one array per row each containing one string per cell)
 * Solution (2d array or string)
 * Most complex strategy that could be needed to solve
 * Difficulty (integer on scale)
 */

export class Board{
    private board: string[][];
    private solution: string[][];
    private solutionString: string;
    private mostDifficultStrategy: StrategyEnum;
    private strategies: boolean[];
    private difficulty: number;
    private solver: Solver;

    /**
     * Creates board object if valid, otherwise throws error
     * @param board - 81 length board string (left to right, top to bottom)
     */
    constructor(board:string);

    /**
     * Creates board object if valid, otherwise throws error
     * @param board - 81 length board string (left to right, top to bottom)
     * @param algorithm - specific order to apply strategies
     */
    constructor(board:string, algorithm: StrategyEnum[]);

    constructor(board: string, algorithm?: StrategyEnum[]) {

        this.validatePuzzle(board);

        this.board = getBoardArray(board);

        this.mostDifficultStrategy = -1;
        this.strategies = new Array(StrategyEnum.COUNT).fill(false);
        this.difficulty = 0;

        if (algorithm === undefined) {
            this.solver = new Solver(this.board);
        }
        else {
            this.solver = new Solver(this.board, algorithm);
        }

        this.solve();
    }

    /**
     * Get board array
     * @returns board array
     */
    public getBoard():string[][] {
        return this.board;
    }

    /**
     * Get solution array
     * @returns solution array
     */
    public getSolution():string[][] {
        return this.solution;
    }

    /**
     * Get solution string
     * @returns solution string
     */
    public getSolutionString():string {
        return this.solutionString;
    }

    /**
     * Get strategy score
     * @returns strategy score
     */
    public getStrategyScore():number {
        return this.mostDifficultStrategy;
    }

    /**
     * Get boolean array containing strategies used by Solver
     * @returns strategies boolean array
     */
    public getStrategies():boolean[] {
        return this.strategies;
    }

    /**
     * Get difficulty
     * @returns difficulty
     */
    public getDifficulty():number {
        return this.difficulty;
    }

    /**
     * Given a strategy returns an array containing its prereqs
     * @param strategy - strategy getting prereqs for
     * @returns array of prereqs for the given strategy
     */
    private getPrereqs(strategy: StrategyEnum):StrategyEnum[] {
        let prereqs:StrategyEnum[] = new Array();
        if (strategy === StrategyEnum.NAKED_OCTUPLET) {
            prereqs.push(StrategyEnum.NAKED_SEPTUPLET);
            strategy = StrategyEnum.NAKED_SEPTUPLET;
        }
        if (strategy === StrategyEnum.NAKED_SEPTUPLET) {
            prereqs.push(StrategyEnum.NAKED_SEXTUPLET);
            strategy = StrategyEnum.NAKED_SEXTUPLET;
        }
        if (strategy === StrategyEnum.NAKED_SEXTUPLET) {
            prereqs.push(StrategyEnum.NAKED_QUINTUPLET);
            strategy = StrategyEnum.NAKED_QUINTUPLET;
        }
        if (strategy === StrategyEnum.NAKED_QUINTUPLET) {
            prereqs.push(StrategyEnum.NAKED_QUADRUPLET);
            strategy = StrategyEnum.NAKED_QUADRUPLET;
        }
        if (strategy === StrategyEnum.NAKED_QUADRUPLET) {
            prereqs.push(StrategyEnum.NAKED_TRIPLET);
            strategy = StrategyEnum.NAKED_TRIPLET;
        }
        if (strategy === StrategyEnum.NAKED_TRIPLET) {
            prereqs.push(StrategyEnum.NAKED_PAIR);
            strategy = StrategyEnum.NAKED_PAIR;
        }
        if (strategy === StrategyEnum.NAKED_PAIR || strategy === StrategyEnum.HIDDEN_SINGLE) {
            prereqs.push(StrategyEnum.NAKED_SINGLE);
        }
        return prereqs;
    }

    /**
     * Solves the puzzle and sets strategy and solution
     */
    private solve():void {
        let hint:Hint = this.solver.nextStep();
        let stepCount:number = 0;
        while (hint !== null) {
            this.strategies[hint.getStrategyType()] = true;
            this.difficulty += hint.getDifficulty();
            stepCount++;
            if (hint.getStrategyType() > this.mostDifficultStrategy) {
                this.mostDifficultStrategy = hint.getStrategyType();
            }
            hint = this.solver.nextStep();
        }
        this.solution = this.solver.getSolution();
        this.setSolutionString();
        this.difficulty /= stepCount;
        this.difficulty = Math.ceil(this.difficulty * (1 + (stepCount * GAME_LENGTH_DIFFICULTY_MULTIPLIER)));
        return;
    }

    /**
     * Sets solution string
     */
    private setSolutionString():void {
        this.solutionString = "";
        for (let i:number = 0; i < this.solution.length; i++) {
            for (let j:number = 0; j < this.solution[i].length; j++) {
                this.solutionString += this.solution[i][j];
            }
        }
        return;
    }

    /**
     * Determines if the input board is a valid Sudoku board
     * @param board - 81 length board string (left to right, top to bottom)
     * @throws {@link CustomError}
     * Thrown if board has invalid length, characters, is already solved, or if there are duplicate values 
     * in a row, column, or box (Excluding zeros)
     */
    public validatePuzzle(board: string):boolean {

        // Regex ^[0123456789]*$ which makes sure only contains those chars
        let valid:string = SudokuEnum.EMPTY_CELL + SudokuEnum.CANDIDATES;
        valid = "^[" + valid + "]*$";

        if (board.length !== SudokuEnum.BOARD_LENGTH) {
            throw new CustomError(CustomErrorEnum.INVALID_BOARD_LENGTH);
        }
        else if (!new RegExp(valid).test(board)) {
            throw new CustomError(CustomErrorEnum.INVALID_BOARD_CHARACTERS);
        }
        else if (!board.includes(SudokuEnum.EMPTY_CELL)) {
            throw new CustomError(CustomErrorEnum.BOARD_ALREADY_SOLVED);
        }
        else {
            // Checks board for duplicate values in the same row/column/box
            var boardArray: string[][] = getBoardArray(board);
            // checks every row for duplicate values
            for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
                // stores values found in the row
                let rowGroup:Group = new Group(false);
                for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                    // If there is a value in the cell and it's already been added to the group throw a duplicate value error, otherwise just insert it
                    if ((boardArray[row][column] !== SudokuEnum.EMPTY_CELL) && !rowGroup.insert(boardArray[row][column])) {
                        throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_ROW);
                    }
                }
            }
            // checks every column for duplicate values
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                // stores values found in the column
                let columnGroup:Group = new Group(false);
                for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
                    // If there is a value in the cell and it's already been added to the group throw a duplicate value error, otherwise just insert it
                    if ((boardArray[row][column] !== SudokuEnum.EMPTY_CELL) && !columnGroup.insert(boardArray[row][column])) {
                        throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_COLUMN);
                    }
                }
            }
            // checks every box for duplicate values
            for (let box:number = 0; box < SudokuEnum.BOX_COUNT; box++) {
                // stores values found in the box
                let boxGroup:Group = new Group(false);
                let rowStart:number = Cell.getBoxRowStart(box);
                for (let row:number = rowStart; row < (rowStart + SudokuEnum.BOX_LENGTH); row++) {
                    let columnStart:number = Cell.getBoxColumnStart(box);
                    for (let column:number = columnStart; column < (columnStart + SudokuEnum.BOX_LENGTH); column++) {
                    // If there is a value in the cell and it's already been added to the group throw a duplicate value error, otherwise just insert it
                    if ((boardArray[row][column] !== SudokuEnum.EMPTY_CELL) && !boxGroup.insert(boardArray[row][column])) {
                        throw new CustomError(CustomErrorEnum.DUPLICATE_VALUE_IN_BOX);
                    }
                    }
                }
            }
        }
        return true;
    }
}