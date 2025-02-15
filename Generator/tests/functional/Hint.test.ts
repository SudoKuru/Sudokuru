import { getHint } from "../../../lib/Hint";
import { TestBoards } from "../testResources";
import { getBoardArray } from "../../Sudoku";
import { Solver } from "../../Solver";
import { SudokuStrategy } from "../../../lib/Api";

describe("get hints", () => {
    it('get hint works with or without some optional parameters', () => {
        const board:string[][] = getBoardArray(TestBoards.SINGLE_OBVIOUS_SINGLE);
        const solver:Solver = new Solver(board);
        let notes:string[][] = solver.getNotes();
        let hint:JSON = getHint(board, notes, undefined, getBoardArray(TestBoards.SINGLE_OBVIOUS_SINGLE_SOLUTION));
        expect(hint["strategy"]).toBe("AMEND_NOTES");
        solver.nextStep();
        notes = solver.getNotes();
        hint = getHint(board, notes);
        expect(hint["strategy"]).toBe("OBVIOUS_SINGLE");
    });
    
    it('get hint uses provided strategies in given order precedence', () => {
        const board:string[][] = getBoardArray(TestBoards.ONLY_OBVIOUS_SINGLES);
        const solver:Solver = new Solver(board);
        const notes:string[][] = solver.getNotes();
        notes[2] = ["6"];
        const strategies:SudokuStrategy[] = ["OBVIOUS_SINGLE", "AMEND_NOTES"];
        let hint:JSON = getHint(board, notes, strategies);
        expect(hint["strategy"]).toBe("OBVIOUS_SINGLE");
        // Versus the following if using default strategy order precedence which has amend notes > obvious single
        hint = getHint(board, notes);
        expect(hint["strategy"]).toBe("AMEND_NOTES");
    });

    // TODO: test that it uses the given solution if it is given
});
