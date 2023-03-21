import { Cell } from "./Cell";
import { Group } from "./Group";
import { GroupEnum, SudokuEnum } from "./Sudoku";

/**
 * Constructed using 2d array of Cells
 * Maintains metadata about arary of Cells
 */
export class CellBoard{
    // 2d Cell "board" array
    private cells: Cell[][];
    // 2d array of Groups storing which values have been placed in each group
    // e.g. valuesPlaced[0][2] is third row
    private valuesPlaced: Group[][];
    // 2d array of Groups storing which indexes in each group have had values placed in them
    private indexesPlaced: Group[][];
    // 3d array containg cells from each group
    // e.g. cellGroups[0][3][4] = [row][4th row][5th cell] = 5th cell in 4th row
    private cellGroups: Cell[][][];

    constructor(cells: Cell[][]) {
        this.cells = cells;
        this.valuesPlaced = new Array();
        this.indexesPlaced = new Array();
        for (let i:number = 0; i < GroupEnum.COUNT; i++) {
            this.valuesPlaced.push(new Array());
            this.indexesPlaced.push(new Array());
            for (let j:number = 0; j < SudokuEnum.ROW_LENGTH; j++) {
                this.valuesPlaced[i].push(new Group(false));
                this.indexesPlaced[i].push(new Group(false));
            }
        }
        this.cellGroups = new Array();
        for (let i:number = 0; i < GroupEnum.COUNT; i++) {
            this.cellGroups.push(new Array());
            for (let j:number = 0; j < SudokuEnum.ROW_LENGTH; j++) {
                this.cellGroups[i].push(new Array());
                for (let k:number = 0; k < SudokuEnum.ROW_LENGTH; k++) {
                    this.cellGroups[i][j].push(this.getCell(i, j, k));
                }
            }
        }
    }

    /**
     * Sets given value for given cell and updates metadata
     * @param row - row Cell is in
     * @param column - column Cell is in
     * @param value - value being placed in Cell
     */
    public setValue(row: number, column: number, value: string):void {
        this.cells[row][column].setValue(value);
        let box:number = Cell.calculateBox(row, column);
        this.valuesPlaced[GroupEnum.ROW][row].insert(value);
        this.valuesPlaced[GroupEnum.COLUMN][column].insert(value);
        this.valuesPlaced[GroupEnum.BOX][box].insert(value);
        this.indexesPlaced[GroupEnum.ROW][row].insert(column);
        this.indexesPlaced[GroupEnum.COLUMN][column].insert(row);
        let index:number = 0;
        let boxRowStart:number = Cell.getBoxRowStart(box);
        let boxColumnStart:number = Cell.getBoxColumnStart(box);
        for (let r:number = boxRowStart; r < (boxRowStart + SudokuEnum.BOX_LENGTH); r++) {
            for (let c:number = boxColumnStart; c < (boxColumnStart + SudokuEnum.BOX_LENGTH); c++) {
                if (r === row && c === column) {
                    this.indexesPlaced[GroupEnum.BOX][box].insert(index);
                }
                index++;
            }
        }
        return;
    }

    /**
     * Removes given notes from given cell
     * @param row - row Cell is in
     * @param column - column Cell is in
     * @param notes - notes being removed from Cell
     */
    public removeNotes(row: number, column: number, notes: Group):void {
        this.cells[row][column].removeNotes(notes);
        return;
    }

    /**
     * Gets values placed in given group e.g. Group representing 3rd row
     * @param group - Group type e.g. row
     * @param index - index e.g. 2 = 3rd
     * @returns Group object containing values placed in given row
     */
    public getValuesPlaced(group: GroupEnum, index: number):Group {
        return this.valuesPlaced[group][index];
    }

    /**
     * Gets indexes in which values have been placed in given group
     * @param group - Group type e.g. row
     * @param index - index e.g. 2 = 3rd
     * @returns Group object containing indexes with values placed in them in given group
     */
    public getIndexesPlaced(group: GroupEnum, index: number):Group {
        return this.indexesPlaced[group][index];
    }

    /**
     * Given a group and indexes returns the corresponding cell
     * @param group - group e.g. row
     * @param groupIndex - group index e.g. 5th row
     * @param index - index e.g. 7th cell in 5th row
     * @returns Cell with given group and indexes
     */
    public getCell(group: GroupEnum, groupIndex: number, index: number):Cell {
        if (group === GroupEnum.ROW) {
            return this.cells[groupIndex][index];
        }
        else if (group === GroupEnum.COLUMN) {
            return this.cells[index][groupIndex];
        }
        else if (group === GroupEnum.BOX) {
            let boxRowStart:number = Cell.getBoxRowStart(groupIndex);
            let boxColumnStart:number = Cell.getBoxColumnStart(groupIndex);
            let row:number = boxRowStart + Math.floor(index / 3);
            let column:number = boxColumnStart + (index % 3);
            return this.cells[row][column];
        }
    }

    /**
     * Given group and its index returns all of the empty cells in it
     * @param group - group e.g. row
     * @param index - index e.g. 7th row
     * @returns array containing all empty cells in given group
     */
    public getEmptyCellsInGroup(group: GroupEnum, index: number):Cell[] {
        let cells:Cell[] = new Array();
        for (let i:number = 0; i < SudokuEnum.ROW_LENGTH; i++) {
            if (this.cellGroups[group][index][i].isEmpty()) {
                cells.push(this.cellGroups[group][index][i]);
            }
        }
        return cells;
    }

    /**
     * Given group and its index returns all of the cells in it
     * @param group - group e.g. row
     * @param index - index e.g. 7th row
     * @returns array containing all cells in given group
     */
    public getCellsInGroup(group: GroupEnum, index: number):Cell[] {
        return this.cellGroups[group][index];
    }
}