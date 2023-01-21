import { Cell } from "./Cell";
import { CustomError, CustomErrorEnum } from "./CustomError";
import { SudokuEnum, StrategyEnum, getCellsInRow, getCellsInColumn, getCellsInBox, GroupEnum, getNextCellInGroup, TupleEnum, getCellsInGroup, getUnionOfSetNotes, inSubset, getCellsSubset, getCellsInSubset } from "./Sudoku"
import { Group } from "./Group";

/**
 * Includes lower bounds for strategies difficulty ratings
 * @enum
 */
enum DifficultyLowerBounds {
    NAKED_SINGLE = 10,
    HIDDEN_SINGLE = 20,
    NAKED_PAIR = 40,
    NAKED_TRIPLET = 60,
    NAKED_QUADRUPLET = 90,
    NAKED_QUINTUPLET = 140,
    NAKED_SEXTUPLET = 200,
    NAKED_SEPTUPLET = 300,
    NAKED_OCTUPLET = 450
}

/**
 * Includes upper bounds for strategies difficulty ratings
 * @enum
 */
enum DifficultyUpperBounds {
    NAKED_SINGLE = 10,
    HIDDEN_SINGLE = 40,
    NAKED_PAIR = 60,
    NAKED_TRIPLET = 90,
    NAKED_QUADRUPLET = 140,
    NAKED_QUINTUPLET = 140,
    NAKED_SEXTUPLET = 200,
    NAKED_SEPTUPLET = 300,
    NAKED_OCTUPLET = 450
}

/**
 * Constructed using 2d array of cells
 * Returns:
 * Whether or object constitutes specific strategies
 * Cause (cells that "cause" the strategy to be applicable)
 * What candidates can be placed as result of strategy
 * What candidates can be removed from cells notes as result of strategy
 * What strategy type this is (correlates to StrategyEnum)
 */
export class Strategy{
    // Contains representation of board being solved
    private board: Cell[][];
    // Contains cells that "cause" strategy to be applicable
    private cells: Cell[][];
    // Contains values that can be placed because of this Strategy
    private values: Cell[];
    // Contains notes that can be removed because of this Strategy
    private notes: Group[];
    // What specific strategy is used (correlated to StrategyEnum)
    private strategyType: number;
    // Whether or not strategy has been identified and ready to use
    private identified: boolean;
    // Stores number representing its difficulty rating (calculated to be in between the strategies upper/lower bounds)
    private difficulty: number;

    /**
     * Cell object using cells the strategy acts on
     * @constructor
     * @param cells - cells
     */
    constructor(board: Cell[][], cells: Cell[][]) {
        this.board = board;
        this.cells = cells;
        this.identified = false;
        this.values = new Array();
        this.notes = new Array();
    }

    /**
     * Gets cells that "cause" strategy to be applicable
     * @returns cells
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    public getCause():Cell[][] {
        this.verifyIdentified();
        return this.cells;
    }

    /**
     * Gets values that can be placed
     * @returns Cells containing values that can be placed
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    public getValuesToPlace():Cell[] {
        this.verifyIdentified();
        return this.values;
    }

    /**
     * Gets notes that can be removed
     * @returns Cells containing notes that can be removed
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    public getNotesToRemove():Group[] {
        this.verifyIdentified();
        return this.notes;
    }

    /**
     * Verified that a strategy has been identified, otherwise throws an error
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    private verifyIdentified():void {
        if (!this.identified) {
            throw new CustomError(CustomErrorEnum.STRATEGY_NOT_IDENTIFIED);
        }
        return;
    }

    /**
     * Gets strategyType
     * @returns strategyType
     */
    public getStrategyType():number {
        return this.strategyType;
    }

    /**
     * Gets difficulty rating for the strategy represented as an integer
     * @returns difficulty int
     * @throws {@link CustomError}
     * Thrown if strategy hasn't been identified
     */
    public getDifficulty():number {
        this.verifyIdentified();
        return this.difficulty;
    }

    /**
     * Given a tuple like pair returns the difficulty lower bound for that naked set like naked pair
     * @param tuple - tuple e.g. naked single, pair, ...
     * @returns lower bound for naked single of given tuple
     */
    private getNakedSetDifficultyLowerBound(tuple: TupleEnum):DifficultyLowerBounds {
        if (tuple === TupleEnum.SINGLE) {
            return DifficultyLowerBounds.NAKED_SINGLE;
        }
        else if (tuple === TupleEnum.PAIR) {
            return DifficultyLowerBounds.NAKED_PAIR;
        }
        else if (tuple === TupleEnum.TRIPLET) {
            return DifficultyLowerBounds.NAKED_TRIPLET;
        }
        else if (tuple === TupleEnum.QUADRUPLET) {
            return DifficultyLowerBounds.NAKED_QUADRUPLET;
        }
        else if (tuple === TupleEnum.QUINTUPLET) {
            return DifficultyLowerBounds.NAKED_QUINTUPLET;
        }
        else if (tuple === TupleEnum.SEXTUPLET) {
            return DifficultyLowerBounds.NAKED_SEXTUPLET;
        }
        else if (tuple === TupleEnum.SEPTUPLET) {
            return DifficultyLowerBounds.NAKED_SEPTUPLET;
        }
        else if (tuple === TupleEnum.OCTUPLET) {
            return DifficultyLowerBounds.NAKED_OCTUPLET;
        }
    }

    /**
     * Given a tuple like pair returns the difficulty upper bound for that naked set like naked pair
     * @param tuple - tuple e.g. naked single, pair, ...
     * @returns upper bound for naked single of given tuple
     */
    private getNakedSetDifficultyUpperBound(tuple: TupleEnum):DifficultyUpperBounds {
        if (tuple === TupleEnum.SINGLE) {
            return DifficultyUpperBounds.NAKED_SINGLE;
        }
        else if (tuple === TupleEnum.PAIR) {
            return DifficultyUpperBounds.NAKED_PAIR;
        }
        else if (tuple === TupleEnum.TRIPLET) {
            return DifficultyUpperBounds.NAKED_TRIPLET;
        }
        else if (tuple === TupleEnum.QUADRUPLET) {
            return DifficultyUpperBounds.NAKED_QUADRUPLET;
        }
        else if (tuple === TupleEnum.QUINTUPLET) {
            return DifficultyUpperBounds.NAKED_QUINTUPLET;
        }
        else if (tuple === TupleEnum.SEXTUPLET) {
            return DifficultyUpperBounds.NAKED_SEXTUPLET;
        }
        else if (tuple === TupleEnum.SEPTUPLET) {
            return DifficultyUpperBounds.NAKED_SEPTUPLET;
        }
        else if (tuple === TupleEnum.OCTUPLET) {
            return DifficultyUpperBounds.NAKED_OCTUPLET;
        }
    }

    /**
     * Checks if strategy is a naked set of given tuple and if so adds values to be placed and notes to remove
     * @param tuple - e.g. could be single or pair for naked single or naked pair respectively
     * @returns true if strategy is a naked tuple
     */
    public isNakedSet(tuple: TupleEnum):boolean {
        // Checks if tuple exists by getting all cells (with note size <= tuple) in each group and trying to build tuple
        // Checks every subset (combination) of cells in each group (row/column/box)
        let subsets:Group[] = Group.getSubset(tuple);
        // Used to prevent adding cells to notes to remove multiple times when evaluating box after finding row/column set
        let usedRow:number = -1;
        let usedColumn:number = -1;
        for (let group:GroupEnum = 0; group < GroupEnum.COUNT; group++) {
            for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
                // Contains cells in the same row, column, or box
                let cells: Cell[] = getCellsInGroup(this.cells, group, i);
                // Tries to build a naked set of size tuple for each possible size tuple subset of candidates
                // Is naked set iff union of all cells has notes size equal to tuple
                for (let j:number = 0; j < subsets.length; j++) {
                    // Stores indexes of the cells that make up the naked set
                    let inNakedSet:Group = getCellsSubset(cells, subsets[j], group);
                    // Stores the cellls that make up the naked set
                    let nakedSet:Cell[] = getCellsInSubset(cells, inNakedSet);
                    // If naked set is correct size (i.e. every element in subset was in cells)
                    if (nakedSet.length === tuple) {
                        // Calculates all notes in naked set
                        let nakedSetCandidates:Group = getUnionOfSetNotes(nakedSet);
                        // Is naked set if it has correct number of notes
                        if (nakedSetCandidates.getSize() === tuple) {
                            // If it is a naked single places value
                            if (tuple === TupleEnum.SINGLE) {
                                let row:number = nakedSet[0].getRow();
                                let column:number = nakedSet[0].getColumn();
                                let single:string = undefined;
                                for (let singleCandidate:number = 0; singleCandidate < SudokuEnum.ROW_LENGTH; singleCandidate++) {
                                    if (nakedSetCandidates.contains(singleCandidate)) {
                                        single = (singleCandidate+1).toString();
                                    }
                                }
                                this.values.push(new Cell(row, column, single));
                                this.strategyType = StrategyEnum.NAKED_SINGLE;
                                this.identified = true;
                                this.difficulty = DifficultyLowerBounds.NAKED_SINGLE;
                                return true;
                            }
                            // Adds notes to remove if there are any to remove
                            for (let k:number = 0; k < cells.length; k++) {
                                // If cell isn't part of naked set itself and it contains some of the same values as naked set remove them
                                // Skip if row or column is 'used' i.e. removed due to shared row or column already and checking for others in shared box
                                if (!inNakedSet.contains(k) && (cells[k].getNotes().intersection(nakedSetCandidates)).getSize() > 0) {
                                    let notes:Group = new Group(false, cells[k].getRow(), cells[k].getColumn());
                                    notes.insert(nakedSetCandidates);
                                    this.notes.push(notes);
                                }
                            }
                            // If notes can be removed as result of naked set then it is a valid strategy
                            if (this.notes.length > 0) {
                                this.strategyType = StrategyEnum[StrategyEnum[tuple]];
                                this.identified = true;
                                // Calculate difficulty based on how far apart the naked set cells are
                                let distanceRatio:number;
                                if (group === GroupEnum.ROW) {
                                    distanceRatio = nakedSet[nakedSet.length - 1].getRow() - nakedSet[0].getRow();
                                    distanceRatio /= SudokuEnum.COLUMN_LENGTH - 1;
                                }
                                else if (group === GroupEnum.COLUMN) {
                                    distanceRatio = nakedSet[nakedSet.length - 1].getColumn() - nakedSet[0].getColumn();
                                    distanceRatio /= SudokuEnum.ROW_LENGTH - 1;
                                }
                                else {
                                    let minRow:number = SudokuEnum.COLUMN_LENGTH, minColumn:number = SudokuEnum.ROW_LENGTH;
                                    let maxRow:number = 0, maxColumn:number = 0;
                                    for (let k:number = 0; k < nakedSet.length; k++) {
                                        minRow = Math.min(minRow, nakedSet[k].getRow());
                                        minColumn = Math.min(minColumn, nakedSet[k].getColumn());
                                        maxRow = Math.max(maxRow, nakedSet[k].getRow());
                                        maxColumn = Math.max(maxColumn, nakedSet[k].getColumn());
                                    }
                                    distanceRatio = (maxRow - minRow) + (maxColumn - minColumn);
                                    distanceRatio /= (SudokuEnum.BOX_LENGTH - 1) * 2;
                                }
                                this.difficulty = this.getNakedSetDifficultyLowerBound(tuple);
                                this.difficulty += Math.ceil(distanceRatio * (this.getNakedSetDifficultyUpperBound(tuple) - this.getNakedSetDifficultyLowerBound(tuple)));
                                // If naked set shares a row or column it might also share a box so skip to check that
                                if (group !== GroupEnum.BOX) {
                                    // Set used row or column to avoiding adding same cells notes twice
                                    if (group === GroupEnum.ROW) {
                                        usedRow = this.notes[0].getRow();
                                    }
                                    else {
                                        usedColumn = this.notes[0].getColumn();
                                    }
                                    // Check if naked set shares a box
                                    let boxes:Group = new Group(false);
                                    let box:number;
                                    for (let k:number = 0; k < nakedSet.length; k++) {
                                        box = nakedSet[k].getBox();
                                        boxes.insert(box);
                                    }
                                    if (boxes.getSize() === 1) {
                                        // Since the naked set also all share the same box add to notes any notes you can remove from cells in the shared box
                                        let boxCells: Cell[] = getCellsInGroup(this.cells, GroupEnum.BOX, box);
                                        for (let k:number = 0; k < boxCells.length; k++) {
                                            if (boxCells[k].getRow() !== usedRow && boxCells[k].getColumn() !== usedColumn) {
                                                if ((boxCells[k].getNotes().intersection(nakedSetCandidates)).getSize() > 0) {
                                                    let notes:Group = new Group(false, boxCells[k].getRow(), boxCells[k].getColumn());
                                                    notes.insert(nakedSetCandidates);
                                                    this.notes.push(notes);
                                                }
                                            }
                                        }
                                    }
                                }
                                return this.identified;
                            }
                        }
                    }
                }
            }
        }
        return this.identified;
    }

    /**
     * Checks if strategy is a naked single and if so adds values that can be placed
     * @returns true if strategy is a naked single
     */
    public isNakedSingle():boolean {
        return this.isNakedSet(TupleEnum.SINGLE);
    }

    /**
     * Checks if strategy is a hidden set of given tuple and if so adds notes to remove
     * @param tuple - e.g. could be single or pair for hidden single or hidden pair respectively
     * @returns true if strategy is a hidden tuple
     */
    public isHiddenSet(tuple: TupleEnum):boolean {
        // Checks if tuple exists by getting all cells in each group and trying to build hidden tuple
        // Checks every subset (combination) of cells in each group (row/column/box)
        let subsets:Group[] = Group.getSubset(tuple);
        for (let group:GroupEnum = 0; group < GroupEnum.COUNT; group++) {
            for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
                // Contains cells in the same row, column, or box
                let cells: Cell[] = getCellsInGroup(this.cells, group, i);
                // Tries to build a hidden set of size tuple for each possible size tuple subset of candidates
                // Is hidden single iff the number of candidates that don't exist outside of the hidden tuple
                // is equal to the tuple (e.g. hidden pair if there are two numbers only in the pair in the row)
                for (let j:number = 0; j < subsets.length; j++) {
                    // Stores indexes of the cells that make up the hidden set
                    let inHiddenSet:Group = getCellsSubset(cells, subsets[j], group);
                    // Stores the cells that make up the hidden set
                    let hiddenSet:Cell[] = getCellsInSubset(cells, inHiddenSet);
                    // If hidden set is correct size (i.e. every element in subset was in cells)
                    if (hiddenSet.length === tuple) {
                        // Stores all of the cells in the hidden sets group (except the hidden set itself and non empty cells)
                        let notHiddenSet:Cell[] = new Array();
                        for (let k:number = 0; k < cells.length; k++) {
                            if (!inHiddenSet.contains(k) && cells[k].isEmpty()) {
                                notHiddenSet.push(cells[k]);
                            }
                        }
                        // Calculates notes that aren't in the hidden set
                        let notHiddenSetCandidates:Group = getUnionOfSetNotes(notHiddenSet);
                        // Calculates notes that are in the hidden set
                        let hiddenSetCandidates:Group = getUnionOfSetNotes(hiddenSet);
                        // Is hidden set if correct number of candidates don't exist outside of the hidden set
                        if ((hiddenSetCandidates.getSize() - (hiddenSetCandidates.intersection(notHiddenSetCandidates)).getSize()) === tuple) {
                            // Remove candidates that aren't part of the hidden set from the hidden sets notes
                            for (let k:number = 0; k < tuple; k++) {
                                if ((hiddenSet[k].getNotes().intersection(notHiddenSetCandidates)).getSize() > 0) {
                                    let notes:Group = new Group(false, hiddenSet[k].getRow(), hiddenSet[k].getColumn());
                                    notes.insert(notHiddenSetCandidates);
                                    this.notes.push(notes);
                                    this.identified = true;
                                }
                            }
                            // If notes were found you can remove as part of the hidden single then strategy identified
                            if (this.identified) {
                                // Calculate ratio of number of notes to possible number (more notes to obscure hidden set = higher difficulty)
                                let noteCount:number = 0;
                                for (let k:number = 0; k < tuple; k++) {
                                    noteCount += (hiddenSet[k].getNotes()).getSize();
                                }
                                let noteRatio:number = noteCount / (SudokuEnum.ROW_LENGTH * SudokuEnum.ROW_LENGTH);
                                if (tuple === TupleEnum.SINGLE) {
                                    this.strategyType = StrategyEnum.HIDDEN_SINGLE;
                                    this.difficulty = DifficultyLowerBounds.HIDDEN_SINGLE;
                                    this.difficulty += Math.ceil(noteRatio * (DifficultyUpperBounds.HIDDEN_SINGLE - DifficultyLowerBounds.HIDDEN_SINGLE));
                                }
                                return this.identified;
                            }
                        }
                    }
                }
            }
        }
        return this.identified;
    }

    /**
     * Checks if strategy is a hidden single and if so adds values that can be placed
     * @returns true if strategy is a hidden single
     */
    public isHiddenSingle():boolean {
        return this.isHiddenSet(TupleEnum.SINGLE);
    }

    /**
     * Checks if strategy is a naked pair and if so adds notes that can be removed
     * @returns true if strategy is a naked pair
     */
    public isNakedPair():boolean {
        return this.isNakedSet(TupleEnum.PAIR);
    }

    /**
     * Checks if strategy is a naked triplet and if so adds notes that can be removed
     * @returns true if strategy is a naked triplet
     */
    public isNakedTriplet():boolean {
        return this.isNakedSet(TupleEnum.TRIPLET);
    }

    /**
     * Checks if strategy is a naked quadruplet and if so adds notes that can be removed
     * @returns true if strategy is a naked quadruplet
     */
    public isNakedQuadruplet():boolean {
        return this.isNakedSet(TupleEnum.QUADRUPLET);
    }

    /**
     * Checks if strategy is a naked quintuplet and if so adds notes that can be removed
     * @returns true if strategy is a naked quintuplet
     */
    public isNakedQuintuplet():boolean {
        return this.isNakedSet(TupleEnum.QUINTUPLET);
    }

    /**
     * Checks if strategy is a naked sextuplet and if so adds notes that can be removed
     * @returns true if strategy is a naked sextuplet
     */
    public isNakedSextuplet():boolean {
        return this.isNakedSet(TupleEnum.SEXTUPLET);
    }

    /**
     * Checks if strategy is a naked septuplet and if so adds notes that can be removed
     * @returns true if strategy is a naked septuplet
     */
    public isNakedSeptuplet():boolean {
        return this.isNakedSet(TupleEnum.SEPTUPLET);
    }

    /**
     * Checks if strategy is a naked octuplet and if so adds notes that can be removed
     * @returns true if strategy is a naked octuplet
     */
    public isNakedOctuplet():boolean {
        return this.isNakedSet(TupleEnum.OCTUPLET);
    }

    /**
     * Creates a Strategy object centered around the nth row in the given board
     * @param cells - cells in a board
     * @param n - row creating strategy around
     * @returns strategy using given row
     */
    public static getRowStrategy(board: Cell[][], cells: Cell[][], n: number):Strategy {
        let row: Cell[][] = getCellsInRow(cells, n);
        return new Strategy(board, row);
    }

    /**
     * Creates a Strategy object centered around the nth column in the given board
     * @param cells - cells in a board
     * @param n - column creating strategy around
     * @returns strategy using given column
     */
    public static getColumnStrategy(board: Cell[][], cells: Cell[][], n: number):Strategy {
        let column: Cell[][] = getCellsInColumn(cells, n);
        return new Strategy(board, column);
    }

    /**
     * Creates a Strategy object centered around the nth box in the given board
     * @param cells - cells in a board
     * @param n - box creating strategy around
     * @returns strategy using given box
     */
    public static getBoxStrategy(board: Cell[][], cells: Cell[][], n: number):Strategy {
        let box: Cell[][] = getCellsInBox(cells, n);
        return new Strategy(board, box);
    }

    /**
     * Returns algorithm which includes all of the strategies in order of least to most complex
     * @returns default algorithm
     */
    public static getDefaultAlgorithm():StrategyEnum[] {
        let algorithm:StrategyEnum[] = new Array();
        // Adds strategies in order of least to most complex
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            algorithm.push(strategy);
        }
        return algorithm;
    }
}