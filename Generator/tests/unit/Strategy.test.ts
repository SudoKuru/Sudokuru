import {Strategy} from '../../Strategy';
import { Cell } from '../../Cell';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { getError } from '../testResources';
import { Group } from '../../Group';
import { SudokuEnum } from '../../Sudoku';

describe("create naked single", () => {
    it('should throw strategy not identified error', async () => {
        let cells:Cell[][] = new Array();
        let strategy:Strategy = new Strategy(cells, cells);
        const error = await getError(async () => strategy.getValuesToPlace());
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.STRATEGY_NOT_IDENTIFIED);
    });
    it('should not be a naked single', () => {
        let cells:Cell[][] = new Array();
        let cell:Cell = new Cell(0, 0);
        cells.push([cell]);
        let strategy:Strategy = new Strategy(cells, cells);
        expect(strategy.isNakedSingle).toBeFalsy;
    });
    it('should be a naked single', () => {
        let cells:Cell[][] = new Array();
        let cell:Cell = new Cell(0, 0);
        for (let i:number = 1; i < 9; i++) {
            cell.removeNote(i.toString());
        }
        cells.push([cell]);
        let strategy:Strategy = new Strategy(cells, cells);
        expect(strategy.isNakedSingle()).toBeTruthy;
        expect(strategy.getValuesToPlace()[0].getValue()).toBe("9");
    });
});

describe("create hidden single", () => {
    it('should not be a hidden single', () => {
        let cells:Cell[][] = new Array();
        cells.push(new Array());
        for (let i:number = 0; i < 9; i++) {
            cells[0].push(new Cell(0, 0));
        }
        cells[0][0].removeNote("3");
        cells[0][4].removeNote("3");
        cells[0][2].removeNote("5");
        for (let i:number = 0; i < 7; i++) {
            cells[0][i].removeNote("7");
        }
        for (let i:number = 1; i < 8; i++) {
            cells[0][i].removeNote("6");
        }
        let strategy:Strategy = new Strategy(cells, cells);
        expect(strategy.isHiddenSingle()).toBeFalsy;
    });
    it ('should be a hidden single', () => {
        let cells:Cell[][] = new Array();
        cells.push(new Array());
        for (let i:number = 0; i < 9; i++) {
            cells[0].push(new Cell(0, 0));
        }
        for (let i:number = 0; i < 8; i++) {
            cells[0][i].removeNote("9");
        }
        let strategy:Strategy = new Strategy(cells, cells);
        expect(strategy.isHiddenSingle()).toBeTruthy;
        expect(strategy.getValuesToPlace()[0].getValue()).toBe("9");
    });
});

describe("create naked pair", () => {
    it("should not be a naked pair", () => {
        let cells:Cell[][] = new Array();
        cells.push(new Array());
        cells[0].push(new Cell(0, 0));
        cells[0].push(new Cell(0, 1));
        let notes:Group = new Group(true);
        notes.remove(1);
        notes.remove(2);
        cells[0][0].removeNotes(notes);
        notes.remove(3);
        cells[0][1].removeNotes(notes);
        let strategy:Strategy = new Strategy(cells, cells);
        expect(strategy.isNakedPair()).toBeFalsy;
    });
    it("should be a naked pair", () => {
        // Create board
        let board:Cell[][] = new Array();
        for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
            board.push(new Array());
            for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
                board[row].push(new Cell(row, column));
            }
        }

        // Create pair
        let cells:Cell[][] = new Array();
        cells.push(new Array());
        cells[0].push(board[0][0]);
        cells[0].push(board[0][7]);

        // Remove all but naked pair from pair
        let notes:Group = new Group(true);
        notes.remove(1);
        notes.remove(2);
        cells[0][0].removeNotes(notes);
        cells[0][1].removeNotes(notes);

        // Test that is naked pair and can remove notes from every cell in row except naked pair themself
        let strategy:Strategy = new Strategy(board, cells);
        expect(strategy.isNakedPair()).toBeTruthy;
        expect(strategy.getNotesToRemove().length).toBe(7);
    });
});