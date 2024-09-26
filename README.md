![Sudokuru Logo](https://sudokuru.s3.amazonaws.com/goldLogoText.png)
# Sudoku Puzzle Generator
[![NPM version](https://img.shields.io/npm/v/sudokuru.svg?style=flat)](https://npmjs.org/package/sudokuru)
[![NPM downloads](https://img.shields.io/npm/dm/sudokuru.svg?style=flat)](https://npmjs.org/package/sudokuru)
![NPM License](https://img.shields.io/npm/l/sudokuru)
[![Pipeline](https://github.com/SudoKuru/Sudokuru/actions/workflows/pipeline.yml/badge.svg)](https://github.com/SudoKuru/Sudokuru/actions/workflows/pipeline.yml)
[![Coveralls Coverage](https://coveralls.io/repos/github/SudoKuru/Sudokuru/badge.svg?branch=main)](https://coveralls.io/github/SudoKuru/Sudokuru?branch=main)
[![Codecov Coverage](https://codecov.io/gh/SudoKuru/Sudokuru/graph/badge.svg?token=SISS85TX20)](https://codecov.io/gh/SudoKuru/Sudokuru)


> Generate data about Sudoku puzzles and upload it via POST requests

# Table of Contents

*   [Installation](#installation)
*   [Usage](#usage)
    *   [JavaScript](#javascript)
        *   [Hint File](#hint-file)
            *   [getHint()](#gethint)
        *   [PuzzleData File](#puzzledata-file)
            *   [getPuzzleData()](#getpuzzledata)
*   [hint Object Properties](#hint-object-properties)
    *   [Example 1: Amend Notes](#example-1-amend-notes)
        *   [strategy](#strategy)
        *   [cause](#cause)
        *   [groups](#groups)
        *   [placements](#placements)
        *   [removals](#removals)
        *   [info](#info)
        *   [action](#action)
    *   [Example 2: Simplify Notes](#example-2-simplify-notes)
        *   [strategy](#strategy-1)
        *   [cause](#cause-1)
        *   [groups](#groups-1)
        *   [placements](#placements-1)
        *   [removals](#removals-1)
        *   [info](#info-1)
        *   [action](#action-1)
    *   [Example 3: Naked Single](#example-3-naked-single)
        *   [strategy](#strategy-2)
        *   [cause](#cause-2)
        *   [groups](#groups-2)
        *   [placements](#placements-2)
        *   [removals](#removals-2)
        *   [info](#info-2)
        *   [action](#action-2)
    *   [Example 4: Naked Pair](#example-4-naked-pair)
        *   [strategy](#strategy-3)
        *   [cause](#cause-3)
        *   [groups](#groups-3)
        *   [placements](#placements-3)
        *   [removals](#removals-3)
        *   [info](#info-3)
        *   [action](#action-3)
    *   [Example 5: Other Naked Sets](#example-5-other-naked-sets)
        *   [strategy](#strategy-4)
        *   [strategy](#strategy-5)
    *   [Example 6: Hidden Single](#example-6-hidden-single)
        *   [strategy](#strategy-6)
        *   [cause](#cause-4)
        *   [groups](#groups-4)
        *   [placements](#placements-4)
        *   [removals](#removals-4)
        *   [info](#info-4)
        *   [action](#action-4)
    *   [Example 7: Hidden Pair](#example-7-hidden-pair)
        *   [strategy](#strategy-7)
        *   [cause](#cause-5)
        *   [groups](#groups-5)
        *   [placements](#placements-5)
        *   [removals](#removals-5)
        *   [info](#info-5)
        *   [action](#action-5)
    *   [Example 8: Other Hidden Sets](#example-8-other-hidden-sets)
        *   [strategy](#strategy-8)
        *   [strategy](#strategy-9)
    *   [Example 9: Pointing Pair](#example-9-pointing-pair)
        *   [strategy](#strategy-10)
        *   [cause](#cause-6)
        *   [groups](#groups-6)
        *   [placements](#placements-6)
        *   [removals](#removals-6)
        *   [info](#info-6)
        *   [action](#action-6)
*   [PuzzleData Object Properties](#puzzledata-object-properties)
    *   [solution](#solution)
    *   [difficulty](#difficulty)
*   [Developer Tools](#developer-tools)

# Installation

```shell
npm install sudokuru
```

# Usage

## JavaScript

### Hint File

#### getHint()
1. Setup: 
    ```typescript
    import {getHint} from 'sudokuru';
    ```
2. Description: Returns a hint based on the puzzle and notes provided
3. Syntax
    ```typescript
    getHint(board, notes, strategies, solution);
    ```
4. Parameters:
    - board: 2d board array (9 arrays, one for each row, each with 9 strings representing values or "0" if empty)
    - notes: 2d notes array (81 arrays, one for each cell containing each note that is left in it)
    - strategies: optional parameter specifying which strategies are allowed to be used in the hint given in order of precedence (allowed values are the strings in the StrategyEnum in Sudoku.ts)
    - solution: optional parameter specifying boards solution so that amend notes hints can correct users mistakes
5. Return Value: [hint](#hint-object-properties)

### PuzzleData File
1. Setup: 
    ```typescript
    import {getPuzzleData} from 'sudokuru';
    ```
2. Description: Returns data about a given puzzle
3. Syntax
    ```typescript
    getPuzzleData(board);
    ```
4. Parameters:
    - board: puzzle board string (81 characters, one for each cell containing each value or "0" if empty, left to right top to bottom)
5. Return Value: [puzzleData](#puzzledata-object-properties)

# hint Object Properties
## Example 1: Amend Notes
![Example 1](https://sudokuru.s3.amazonaws.com/hintExample1-V2.png)
### strategy
```json
"AMEND_NOTES"
```
Name of strategy used by the hint. Amend notes works removing all notes from a cell then adding back in just the ones that don't conflict with placed values in the same row, column, and box as the cell. In the picture the cell with the red border was previously empty and amend notes was able to add in the 2 and 8 only as the others conflicted with the highlighted cells.
### cause
```json
[[7,4],[7,5],[7,6],[7,8],[4,2],[8,0],[8,1]]
```
Coordinates of cells that "cause" strategy to be applicable. This is a 2d array so cause[0] is [7, 4] referring to the cell with the 9 highlighted in blue in the next to last row (rows and columns are zero-indexed). cause[0][0] refers to it being in the 8th row and cause[0][1] refers to it being in the 5th column. Similarly the last cell cause[6] is the highlighted 3 that it shares a box with.
### groups
```json
[[0,7],[1,2],[2,6]]
```
Group type and index of groups that "cause strategy". This is a 2d array so group[0] is [0, 7] referring to the next to next to last row with green borders. group[0][0] refers to the group type (0 = row, 1 = column, 2 = box) and group[0][1] refers to it being the 8th row. Similarly the last group group[2] is the bottom left box whose cells also have green borders.
### placements
```json
[]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This does not apply to this strategy.
### removals
```json
[[7,2,1,3,4,5,6,7,9]]
```
Notes that can be removed from cells along with their row and columns. The first two values represent the row and column respectively so removals[0][0] and removals[0][1] refer to the 3rd cell in the 8th row. The rest of the numbers in the subarray are the notes to be removed which is every number but 2 and 8. Amend notes is unique in that every note that shouldn't be removed should be added back in (2 and 8 in this example). In this example the cell had no notes in it before amend notes.
### info
```json
"Amend notes are when you reset a cell's notes to contain every nonconflicting number"
```
Info about the strategy being used by the hint.
### action
```json
"When you see an amend notes you can remove all notes then add all nonconflicting numbers to its notes"
```
Describes the action that the hint is suggesting.
## Example 2: Simplify Notes
![Example 2](https://sudokuru.s3.amazonaws.com/hintExample2-V2.png)
### strategy
```json
"SIMPLIFY_NOTES"
```
Name of strategy used by the hint. Simplify notes works by using a cell with a placed value (the blue highlighted 8) to remove a note of the same value from a cell sharing a group (the red 8 note in a cell in the same column).
### cause
```json
[[7,0]]
```
Coordinates of cells that "cause" strategy to be applicable. This is a 2d array so cause[0] is [7, 0] referring to the cell with the 8 highlighted in blue in the next to last row (rows and columns are zero-indexed). cause[0][0] refers to it being in the 8th row and cause[0][1] refers to it being in the 1st column.
### groups
```json
[[1,0]]
```
Group type and index of groups that "cause strategy". This is a 2d array so group[0] is [1, 0] referring to the first column with green borders. group[0][0] refers to the group type (0 = row, 1 = column, 2 = box) and group[0][1] refers to it being the 1st column.
### placements
```json
[]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This does not apply to this strategy.
### removals
```json
[[1,0,8]]
```
Notes that can be removed from cells along with their row and columns. The first two values represent the row and column respectively so removals[0][0] and removals[0][1] refer to the 1st cell in the 2nd row. The rest of the numbers in the subarray are the notes to be removed which is just 8.
### info
```json
"You can simplify notes using values already placed in cells at the start of the game"
```
Info about the strategy being used by the hint.
### action
```json
"When there is a value already placed in a cell than it can be removed from all other cells notes in its row, column, and box"
```
Describes the action that the hint is suggesting.
## Example 3: Naked Single
![Example 3](https://sudokuru.s3.amazonaws.com/hintExample3-V1.png)
### strategy
```json
"NAKED_SINGLE"
```
Name of strategy used by the hint. Naked single works by placing a value in a cell where it is the only remaining possibility. In the example the green highlighted 2 is the last remaining possibility in the blue highlighted cell.
### cause
```json
[[7,2]]
```
Coordinates of cells that "cause" strategy to be applicable. This is a 2d array so cause[0] is [7, 2] referring to the 3rd cell in the next to last row (rows and columns are zero-indexed). cause[0][0] refers to it being in the 8th row and cause[0][1] refers to it being in the 3rd column.
### groups
```json
[]
```
Group type and index of groups that "cause strategy". This does not apply to this strategy.
### placements
```json
[[7,2,2]]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This is a 2d array so placements[0] refers to the first value that needs to be placed. The first value in the subarray refers to the cells row, the next value is the column, and the final value is the value to be placed ("2" in this case).
### removals
```json
[]
```
Notes that can be removed from cells along with their row and columns. This does not apply to this strategy.
### info
```json
"Naked singles are when you only have one number left as a possibility in a cell"
```
Info about the strategy being used by the hint.
### action
```json
"When you see a naked single you can fill it in with its last remaining possibility"
```
Describes the action that the hint is suggesting.
## Example 4: Naked Pair
![Example 4](https://sudokuru.s3.amazonaws.com/hintExample4-V1.png)
### strategy
```json
"NAKED_PAIR"
```
Name of strategy used by the hint. Naked pair works using two cells that share a group and only have the same two notes left as possibilities to eliminate those notes from other cells in the group. In the example 7 and 8 are the last remaining possibilities in the blue highlighted cells which are used to remove all the other 7 and 8s in the column shown highlighted in red.
### cause
```json
[[1,8],[6,8]]
```
Coordinates of cells that "cause" strategy to be applicable. This is a 2d array so cause[0] is [1, 8] referring to the 9th cell in the second row (rows and columns are zero-indexed). cause[0][0] refers to it being in the 2nd row and cause[0][1] refers to it being in the 9th column.
### groups
```json
[[1,8]]
```
Group type and index of groups that "cause strategy". This is a 2d array so group[0] is [1, 8] referring to the last column with green borders. group[0][0] refers to the group type (0 = row, 1 = column, 2 = box) and group[0][1] refers to it being the 9th column.
### placements
```json
[]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This does not apply to this strategy.
### removals
```json
[[3,8,7,8],[4,8,7,8]]
```
Notes that can be removed from cells along with their row and columns. The first two values in each subarray represent the row and column respectively so removals[0][0] and removals[0][1] refer to the 9th cell in the 4th row. The rest of the numbers in the subarray are the notes to be removed which is 7 and 8 (although only 8 is there to begin with and is highlighted in red).
### info
```json
"Naked pairs are when you only have the same two numbers left as a possibility in two cells in the same row, column, or box"
```
Info about the strategy being used by the hint.
### action
```json
"When you see a naked pair you can remove them from the notes of every other cell in the row, column, or box that they share"
```
Describes the action that the hint is suggesting.
## Example 5: Other Naked Sets
### strategy
```json
"NAKED_TRIPLET"
```
### strategy
```json
"NAKED_QUADRUPLET"
```
Name of strategy used by the hint. Naked triplets through octuplets are scaled up versions of naked pairs except instead of using two cells and notes they share 3-8. Note: while cells in say a naked quadruplet must share the same 4 notes the 4 cells don't have to individually have all 4 notes they just can't have any other notes.
## Example 6: Hidden Single
![Example 6](https://sudokuru.s3.amazonaws.com/hintExample5-V1.png)
### strategy
```json
"HIDDEN_SINGLE"
```
Name of strategy used by the hint. Hidden single works by having only one cell in a group that still has a number as a possibility in which case all other notes can be removed from it. This is shown by the 8 naked single which in the only 8 note in the box with the green border. Therefore, the other notes highlighted in red can be removed.
### cause
```json
[[3,8],[4,8],[5,6],[5,8]]
```
Coordinates of cells that "cause" strategy to be applicable. This is a 2d array so cause[0] is [3, 8] referring to the 9th cell in the 4th row (rows and columns are zero-indexed). cause[0][0] refers to it being in the 4th row and cause[0][1] refers to it being in the 9th column.
### groups
```json
[[2,5]]
```
Group type and index of groups that "cause strategy". This is a 2d array so group[0] is [2, 5] referring to the 6th box with green borders (boxes are zero-indexed starting with the top left and going left to right top to bottom). group[0][0] refers to the group type (0 = row, 1 = column, 2 = box) and group[0][1] refers to it being the 6th box.
### placements
```json
[]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This does not apply to this strategy.
### removals
```json
[[3,6,1,2,3,9]]
```
Notes that can be removed from cells along with their row and columns. The first two values in each subarray represent the row and column respectively so removals[0][0] and removals[0][1] refer to the 7th cell in the 4th row. The rest of the numbers in the subarray are the notes to be removed which is 1, 2, 3, and 9 (although only 1 and 3 are present and are highlighted in red).
### info
```json
"Hidden singles are when you only have one cell left still containing a specific value in a row, column, or box"
```
Info about the strategy being used by the hint.
### action
```json
"When you see a hidden single you can remove all notes other than the single from the cell"
```
Describes the action that the hint is suggesting.
## Example 7: Hidden Pair
![Example 7](https://sudokuru.s3.amazonaws.com/hintExample6-V1.png)
### strategy
```json
"HIDDEN_PAIR"
```
Name of strategy used by the hint. Hidden pair works by having only two cells in a group that still have two specific numbers as possibilities in which case all other notes can be removed from the pair of cells. This is shown by the naked pair in the top right in which they have the only 2 and 3's in the box with the green border. Therefore, the other notes highlighted in red can be removed.
### cause
```json
[[0,7],[1,7],[1,8]]
```
Coordinates of cells that "cause" strategy to be applicable. This is a 2d array so cause[0] is [0, 7] referring to the 8th cell in the 1st row (rows and columns are zero-indexed). cause[0][0] refers to it being in the 1st row and cause[0][1] refers to it being in the 8th column.
### groups
```json
[[2,2]]
```
Group type and index of groups that "cause strategy". This is a 2d array so group[0] is [2, 2] referring to the 3rd box with green borders (boxes are zero-indexed starting with the top left and going left to right top to bottom). group[0][0] refers to the group type (0 = row, 1 = column, 2 = box) and group[0][1] refers to it being the 3rd box.
### placements
```json
[]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This does not apply to this strategy.
### removals
```json
[[0,6,1,7,8],[2,6,1,7,8]]
```
Notes that can be removed from cells along with their row and columns. The first two values in each subarray represent the row and column respectively so removals[0][0] and removals[0][1] refer to the 7th cell in the 1st row. The rest of the numbers in the subarray are the notes to be removed which is 1, 7, and 8 (although only 1 and 8 are present and are highlighted in red in the cell in the first row).
### info
```json
"Hidden pairs are when you only have two cells left still containing two specific values in a shared row, column, or box"
```
Info about the strategy being used by the hint.
### action
```json
"When you see a hidden pair you can remove all notes other than the pair from the cells"
```
Describes the action that the hint is suggesting.
## Example 8: Other Hidden Sets
### strategy
```json
"HIDDEN_TRIPLET"
```
### strategy
```json
"HIDDEN_QUADRUPLET"
```
Name of strategy used by the hint. Hidden triplets through octuplets are scaled up versions of hidden pairs except instead of using two cells and notes they share 3-8. Note: while cells in say a hidden quadruplet must share the same 4 notes the 4 cells don't have to individually have all 4 notes they just have to be the only cells in the group that have those notes.
## Example 9: Pointing Pair
![Example 8](https://sudokuru.s3.amazonaws.com/hintExample7-V1.png)
### strategy
```json
"POINTING_PAIR"
```
Name of strategy used by the hint. Pointing pair works by having only two cells in a box that still have a specific numbers as a possibility and also share a row or column in which case all other notes can be removed from any other cells in the shared row or column except for the pointing pair themself. This is shown by the pointing pair in the top right in which they have the only 6's in the box are in the two cells highlighted in blue on the same row. Therefore, the other notes highlighted in red can be removed.
### cause
```json
[[0,6],[0,8]]
```
Coordinates of cells that "cause" strategy to be applicable.
### groups
```json
[[0,0],[2,2]]
```
Group type and index of groups that "cause strategy".
### placements
```json
[]
```
Row, column, and values for cells that have had values placed in them as result of strategy. This does not apply to this strategy.
### removals
```json
[[0,1,6],[0,2,6]]
```
Notes that can be removed from cells along with their row and columns. The first two values in each subarray represent the row and column respectively.
### info
```json
"Pointing pairs are when you only have two cells in a row or column left still containing a specific value and the cells also share a box"
```
Info about the strategy being used by the hint.
### action
```json
"When you see a pointing pair you can remove all other instances of the shared note from the box (except for those in the pair themself)"
```
Describes the action that the hint is suggesting.
# PuzzleData Object Properties
## solution
81 character string representing the solution to the puzzle (left to right top to bottom)
## difficulty
Number representing the difficulty of the puzzle (higher is harder)
## givensCount
Number representing the number of givens i.e. pre-filled cells in the puzzle
## puzzleStrategies
Boolean array representing which strategies were used to solve the puzzle in following order (subset of StrategyEnum):
- 0: NAKED_SINGLE,
- 1: HIDDEN_SINGLE,
- 2: NAKED_PAIR,
- 3: HIDDEN_PAIR,
- 4: POINTING_PAIR,
- 5: NAKED_TRIPLET,
- 6: HIDDEN_TRIPLET,
- 7: POINTING_TRIPLET,
- 8: NAKED_QUADRUPLET,
- 9: HIDDEN_QUADRUPLET,
## drills
- 1D number array representing last time strategy can be reasonably used as drill or -1 if it can't be used as a drill
- Each index is defined as the puzzle when it has a certain number of cells filled in (so index 30 has 30 cells filled in including givens).
- Reasonably is defined as to mean removing strategies if they overlap with their prereqs (i.e. if a naked pair is made up of two naked singles the pair will be excluded) and not counting a strategy if multiple instances of it are present so their is only one correct answer.
- The same number index to strategy mapping as puzzleStrategies is used.

# Developer Tools

Clone Repository
```shell
git clone https://github.com/SudoKuru/Sudokuru.git
```

```shell
bun install # or npm install
```

[Install pre-commit hooks](https://pre-commit.com/#install)

Run the below command to setup pre-commit hooks:

```shell
pre-commit install
```

Pre-commit hooks can be run manually with below command, but
will always run before git commit and git push if setup correctly.

```shell
npm run pre-commit
```

```bun......................................................................Passed```

Should appear in the git output logs after a commit.


```shell
# Install Developer Dependencies
bun install
```

Run Tests

Coverage reports are automatically generated can can be viewed in `jest-coverage` folder
```shell
npm run test
```
Run Tests without coverage (faster)
```shell
bun test
```

Build dist Folder
```shell
bun build
```

Create Local TypeDoc Documentation
```shell
bun update-docs
```

The following can also be done after installing the npm package by navigating to node_modules/sudokuru

Run Demo Server on http://localhost:3100/
```shell
bun start
```
```shell
# Can open interactive Solver Demo in browser while Demo Server is running (Generator/Demo/demo.html)
```
Official TypeDoc Documentation is Hosted Here: https://sudokuru.github.io/Sudokuru/

