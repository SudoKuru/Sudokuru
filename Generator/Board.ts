import { CustomError, CustomErrorEnum } from "./CustomError";
import { anyCellsEqual, getBoardArray, SudokuEnum } from "./Sudoku";
import { Solver } from "./Solver";
import { Hint } from "./Hint";
import { StrategyEnum } from "./Sudoku"
import { Cell } from "./Cell";
import { Group } from "./Group";
import { MAX_DIFFICULTY } from "./Strategy";

const MAX_GAME_LENGTH_MODIFIER = 70;
const GAME_LENGTH_DIFFICULTY_MULTIPLIER: number = 0.02;

export function getMaxGameDifficulty(hardestStrategyDifficulty: number):number {
    return (hardestStrategyDifficulty * (1 + (MAX_GAME_LENGTH_MODIFIER * GAME_LENGTH_DIFFICULTY_MULTIPLIER)));
}

const MAX_GAME_DIFFICULTY = getMaxGameDifficulty(MAX_DIFFICULTY);

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
    private strategies: boolean[];
    private drills: boolean[];
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

        this.strategies = new Array(StrategyEnum.COUNT).fill(false);
        this.drills = new Array(StrategyEnum.COUNT).fill(false);
        this.difficulty = 0;

        if (algorithm === undefined) {
            this.solver = new Solver(this.board);
        }
        else {
            this.solver = new Solver(this.board, algorithm);
        }

        this.setDrills();

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
     * Get drills
     * @returns drills
     */
    public getDrills():boolean[] {
        return this.drills;
    }

    /**
     * Adds a StrategyEnum to drills for strategies that can be used as the first step in solving this board
     * If a strategies prereqs are included then it is excluded in order to ensure good examples of strategies are used
     * For example, if there is a naked pair made up of two naked singles only the naked single will be used as a drill
     * Amend and simplify notes are excluded as they don't make very helpful drills, better to leave them as lessons
     */
    private setDrills():void {
        // Run through all of the simplify notes so drills that require notes to be removed can be added
        let solver:Solver = new Solver(this.board);
        let hints:Hint[] = solver.getAllHints();
        // Excludes amend and simplify strategies from hints as they are highest priority
        while ((solver.nextStep()).getStrategyType() <= StrategyEnum.SIMPLIFY_NOTES) {
            hints = solver.getAllHints();
        }
        // Adds drills
        this.drills = new Array(StrategyEnum.COUNT).fill(false);
        let drillCells:Cell[][] = new Array(StrategyEnum.COUNT);
        for (let i:number = 0; i < hints.length; i++) {
            this.drills[hints[i].getStrategyType()] = true;
            drillCells[hints[i].getStrategyType()] = hints[i].getCellsCause();
        }
        // Removes strategies whose prereqs are included
        for (let i:number = 0; i < this.drills.length; i++) {
            if (this.drills[i]) {
                let prereqs:StrategyEnum[] = this.getPrereqs(i);
                for (let j:number = 0; j < prereqs.length; j++) {
                    // Checks if there is a drill that is a prereq of the current drill, if so sees if they overlap in which case drill is excluded
                    if (this.drills[prereqs[j]]) {
                        let drillA:Cell[] = drillCells[i];
                        let drillB:Cell[] =drillCells[prereqs[j]];
                        if (anyCellsEqual(drillA, drillB)) {
                            this.drills[i] = false;
                            j = prereqs.length;
                        }
                    }
                }
            }
        }
        return;
    }

    /**
     * Given a strategy returns an array containing its prereqs
     * @param strategy - strategy getting prereqs for
     * @returns array of prereqs for the given strategy
     */
    private getPrereqs(strategy: StrategyEnum):StrategyEnum[] {
        let prereqs:StrategyEnum[] = new Array();
        if (strategy === StrategyEnum.HIDDEN_OCTUPLET) {
            prereqs.push(StrategyEnum.NAKED_OCTUPLET);
            strategy = StrategyEnum.NAKED_OCTUPLET;
        }
        if (strategy === StrategyEnum.NAKED_OCTUPLET || strategy === StrategyEnum.HIDDEN_SEPTUPLET) {
            prereqs.push(StrategyEnum.NAKED_SEPTUPLET);
            strategy = StrategyEnum.NAKED_SEPTUPLET;
        }
        if (strategy === StrategyEnum.NAKED_SEPTUPLET || strategy === StrategyEnum.HIDDEN_SEXTUPLET) {
            prereqs.push(StrategyEnum.NAKED_SEXTUPLET);
            strategy = StrategyEnum.NAKED_SEXTUPLET;
        }
        if (strategy === StrategyEnum.NAKED_SEXTUPLET || strategy === StrategyEnum.HIDDEN_QUINTUPLET) {
            prereqs.push(StrategyEnum.NAKED_QUINTUPLET);
            strategy = StrategyEnum.NAKED_QUINTUPLET;
        }
        if (strategy === StrategyEnum.NAKED_QUINTUPLET || strategy === StrategyEnum.HIDDEN_QUADRUPLET) {
            prereqs.push(StrategyEnum.NAKED_QUADRUPLET);
            strategy = StrategyEnum.NAKED_QUADRUPLET;
        }
        if (strategy === StrategyEnum.NAKED_QUADRUPLET || strategy === StrategyEnum.HIDDEN_TRIPLET) {
            prereqs.push(StrategyEnum.NAKED_TRIPLET);
            strategy = StrategyEnum.NAKED_TRIPLET;
        }
        if (strategy === StrategyEnum.NAKED_TRIPLET || strategy === StrategyEnum.HIDDEN_PAIR) {
            prereqs.push(StrategyEnum.NAKED_PAIR);
            strategy = StrategyEnum.NAKED_PAIR;
        }
        if (strategy === StrategyEnum.POINTING_TRIPLET) {
            prereqs.push(StrategyEnum.POINTING_PAIR);
            strategy = StrategyEnum.POINTING_PAIR;
        }
        if (strategy === StrategyEnum.POINTING_PAIR) {
            prereqs.push(StrategyEnum.HIDDEN_SINGLE);
            strategy = StrategyEnum.HIDDEN_SINGLE;
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
        // Stores hint for current step
        let hint:Hint = this.solver.nextStep();
        // Number of steps taken so far using standard strategies (as opposed to simple base ones) to solve the puzzle
        let strategyStepCount:number = 0;
        // Number of steps taken on simple base strategies (note management via amend/simplify and placing values via naked single)
        let simpleStepCount:number = 0;
        let simpleDifficulty:number;
        // Gets hint for each stop to solve puzzle (hint is null when board is finished being solved)
        while (hint !== null) {
            // Records what strategy was used
            this.strategies[hint.getStrategyType()] = true;
            // Updates difficulty rating based on how hard current step is
            if (hint.getStrategyType() === StrategyEnum.AMEND_NOTES || hint.getStrategyType() === StrategyEnum.SIMPLIFY_NOTES ||
                hint.getStrategyType() === StrategyEnum.NAKED_SINGLE) {
                simpleStepCount++;
                if (simpleDifficulty === undefined) {
                    simpleDifficulty = hint.getDifficulty();
                }
            }
            else {
                this.difficulty += hint.getDifficulty();
                strategyStepCount++;            
            }
            // Gets hint for next step
            hint = this.solver.nextStep();
        }
        // Sets simple step count to the number that will actually be used to calculate difficulty (10%)
        simpleStepCount = Math.ceil(simpleStepCount / 70);
        // Combine standard and simple steps
        let stepCount:number = strategyStepCount + simpleStepCount;
        this.difficulty += simpleStepCount * simpleDifficulty;
        // Sets solution string
        this.solution = this.solver.getSolution();
        this.setSolutionString();
        // Adds prereqs to strategies (strategies that current strategies could be reduced to)
        for (let i:number = 0; i < StrategyEnum.COUNT; i++) {
            if (this.strategies[i]) {
                let prereqs:StrategyEnum[] = this.getPrereqs(StrategyEnum[StrategyEnum[i]]);
                for (let j:number = 0; j < prereqs.length; j++) {
                    this.strategies[prereqs[j]] = true;
                }
            }
        }
        // Adjusts difficulty for game length
        this.difficulty /= stepCount;
        //console.log("simple steps: " + simpleStepCount + " compared to strategySteps: " + strategyStepCount);
        //console.log("average step difficulty: " + this.difficulty);
        this.difficulty = Math.ceil(this.difficulty * (1 + (Math.min((strategyStepCount*1.4) + (simpleStepCount * 12) - 30, MAX_GAME_LENGTH_MODIFIER) * GAME_LENGTH_DIFFICULTY_MULTIPLIER)));
        //console.log("game length modifier: " + Math.min((strategyStepCount*1.4) + (simpleStepCount * 12) - 30, MAX_GAME_LENGTH_MODIFIER));
        //console.log("final difficulty: " + this.difficulty + " compared to max: " + MAX_GAME_DIFFICULTY);
        // Add some random noise
        this.difficulty = Math.min(MAX_GAME_DIFFICULTY, this.difficulty * (Math.random() * 4));
        // Sets difficulty on 1-1000 scale
        this.difficulty = Math.ceil(1000 * (this.difficulty / MAX_GAME_DIFFICULTY));
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
     * Returns if given value is a possible candidate at given position taking into account row/column/box constraints
     * @param row - row to check
     * @param col - column to check
     * @param value - value to check
     * @param board - 2d board array to check
     * @returns true if value is a possible candidate, false otherwise
     */
    private isPossibleCandidate(row:number, col:number, value:string, board:string[][]):boolean {
        // Check row
        for (let i:number = 0; i < 9; i++) {
            if (board[row][i] === value) {
                return false;
            }
        }
        // Check column
        for (let i:number = 0; i < 9; i++) {
            if (board[i][col] === value) {
                return false;
            }
        }
        // Check box
        let boxRow:number = Math.floor(row / 3);
        let boxCol:number = Math.floor(col / 3);
        for (let i:number = 0; i < 3; i++) {
            for (let j:number = 0; j < 3; j++) {
                if (board[boxRow * 3 + i][boxCol * 3 + j] === value) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Returns if given Sudoku board is unsolvable, uniquely solvable, or has multiple solutions using recursive algorithm
     * @param row - row to start at
     * @param col - column to start at
     * @param board - 2d board array to solve
     * @param solutions - number of solutions found so far
     * @returns 0 if unsolvable, 1 if uniquely solvable, 2 if multiple solutions
     */
    private getSolutionCount(row:number, col:number, board:string[][], solutions:number):number {
        // If at end of board, return 1 plus number of solutions found so far
        if (row === 9) {
            return 1 + solutions;
        }
        // If at end of row, move to next row
        if (col === 9) {
            return this.getSolutionCount(row + 1, 0, board, solutions);
        }
        // If cell is not empty, move to next cell'
        if (board[row][col] !== SudokuEnum.EMPTY_CELL) {
            return this.getSolutionCount(row, col + 1, board, solutions);
        }
        // Try each possible value for cell
        for (let i:number = 1; i <= 9; i++) {
            // If value is valid, place it in cell and move to next cell
            if (this.isPossibleCandidate(row, col, i.toString(), board)) {
                board[row][col] = i.toString();
                solutions = this.getSolutionCount(row, col + 1, board, solutions);
                // If more than 1 solution found, return
                if (solutions > 1) {
                    return solutions;
                }
            }
        }
        // Reset cell to empty and return number of solutions found
        board[row][col] = SudokuEnum.EMPTY_CELL;
        return solutions;
    }

    /**
     * Determines if the input board is a valid Sudoku board
     * @param board - 81 length board string (left to right, top to bottom)
     * @throws {@link CustomError}
     * Thrown if board has invalid length, characters, duplicate values, is already solved, is unsolvable, or has multiple solutions
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
        // Checks board for unsolvable or multiple solutions
        let solutionCount:number = this.getSolutionCount(0, 0, boardArray, 0);
        if (solutionCount === 0) {
            throw new CustomError(CustomErrorEnum.UNSOLVABLE);
        }
        else if (solutionCount > 1) {
            throw new CustomError(CustomErrorEnum.MULTIPLE_SOLUTIONS);
        }
        return true;
    }
}