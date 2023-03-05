// @ts-ignore
import {Board} from './bundle.js';
// @ts-ignore
import {StrategyEnum} from './bundle.js';

import * as events from 'events';
import * as fs from 'fs';
import * as readline from 'readline';

const filepath = process.argv[2];

/**
 * Returns the user specified start index if there was one provided, otherwise returns 1
 * @returns puzzle index to start generating (1 indexed, inclusive)
 */
function getStart():number {
    if (process.argv[3] === undefined) {
        return 1;
    }
    return Number(process.argv[3]);
}

/**
 * Returns the user specified end index if there was one provided, otherwise returns one billion
 * @returns index of last puzzle to generate (1 indexed, inclusive)
 */
function getEnd():number {
    if (process.argv[4] === undefined) {
        return 1_000_000_000;
    }
    return Number(process.argv[4]);
}

/**
 * Returns the user specified batch size if there was one provided, otherwise returns one thousand
 * @returns batch size which determines how many puzzles per array (one array per line)
 */
function getBatchSize():number {
    if (process.argv[5] === undefined) {
        return 1_000;
    }
    return Number(process.argv[5]);
}

const start:number = getStart();
const end:number = getEnd();
const batchSize:number = getBatchSize();

/**
 * Given a boolean array corresponding to strategies adds those strategy strings to array and returns it
 * @param strategies - boolean array indicating which strategies to include
 * @returns array of strategy strings
 */
function getStrategyStringArray(strategies: boolean[]):string[] {
    let strategyStrings:string[] = new Array();
    for (let i:number = (StrategyEnum.INVALID + 1); i < StrategyEnum.COUNT; i++) {
        if (strategies[i]) {
            strategyStrings.push(StrategyEnum[i]);
        }
    }
    return strategyStrings;
}

async function main(): Promise<void> {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(filepath),
            crlfDelay: Infinity
        });

        let writer = fs.createWriteStream('puzzles.txt', {'flags': 'a'});
        let version = (require('./package.json')).version;
        writer.write("/*\n");
        writer.write("This file was generated using version " + version + " of the Sudokuru CLI available at https://www.npmjs.com/package/sudokuru");
        writer.write("\n*/\n");

        let index:number = 1;
        let batchIndex:number = 0;
        let unsolved:number = 0;
        rl.on('line', (line) => {
            if (index >= start && index <= end) {
                try {
                    let board:Board = new Board(line);
                    if (batchIndex === 0) {
                    if (index !== start) {
                        writer.write("\n");
                    }
                    writer.write("[");
                    }
                    else if (index !== start) {
                        writer.write(",");
                    }
                    writer.write("{");
                    writer.write(`\"puzzle\":\"${line}\",`);
                    writer.write(`\"puzzleSolution\":\"${board.getSolutionString()}\",`);
                    let strategies:boolean[] = board.getStrategies();
                    strategies[StrategyEnum.AMEND_NOTES] = false;
                    strategies[StrategyEnum.SIMPLIFY_NOTES] = false;
                    writer.write("\"strategies\":" + JSON.stringify(getStrategyStringArray(strategies)) + ",");
                    writer.write(("\"difficulty\":" + board.getDifficulty()).toString() + ",");
                    let drillStrategies:boolean[] = board.getDrills();
                    drillStrategies[StrategyEnum.AMEND_NOTES] = false;
                    drillStrategies[StrategyEnum.SIMPLIFY_NOTES] = false;
                    writer.write("\"drillStrategies\":" + JSON.stringify(getStrategyStringArray(drillStrategies)));
                    writer.write("}");
                    batchIndex++;
                    if (batchIndex === batchSize) {
                        writer.write("]");
                        batchIndex = 0;
                    }
                } catch(error) {
                    unsolved++;
                }
            }
            index++;
        });

        // @ts-ignore
        await events.once(rl, 'close');
        if (batchIndex !== batchSize && batchIndex !== 0) {
            writer.write("]");
        }
        console.log("Was unable to solve " + unsolved + " puzzles");
    } catch (err) {
        console.log(err);
    }
}

main();