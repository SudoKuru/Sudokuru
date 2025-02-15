## Checklist for completing pull request:
- [ ] Verify that package version is incremented following [BreakVer](https://www.taoensso.com/break-versioning) rules. You can do this with the command ```npm version [major|minor|patch]```
- [ ] Verify that CHANGELOG.md has been updated following [Common Changelog](https://common-changelog.org/) format
- [ ] Verify that any unit tests for new functionality are created and functional.
- [ ] If needed, update the Readme

## Checklist for adding new strategies:
- [ ] Verify that strategy has been added to PREREQS.md
- [ ] Verify that strategy is added to Sudoku.ts StrategyEnum
- [ ] Verify that strategy has been added to Board.ts getPrereqs()
- [ ] Verify that strategy has been added to Hint.ts constructor
- [ ] Verify that isStrategyName function has been added to Strategy.ts
- [ ] Verify that strategy has been added to isStrategySet and/or getStrategyTuple functions if applicable
- [ ] Verify that isStrategyName function is called from Strategy.ts isStrategy()
- [ ] Verify that strategy has been added to DifficultyLowerBounds and DifficultyUpperBounds enums
- [ ] Verify that strategy has been added to getSetDifficultyUpper/LowerBounds if applicable
- [ ] Verify that isStrategyName function sets Strategy.difficulty
- [ ] Verify that strategy has been added to Drill.ts strategies array if applicable
- [ ] Verify that strategy has been added to Lessons.ts strategies array and getSteps()
- [ ] Verify that strategy label/input has been added to demo.html
- [ ] Verify that strategy has been added to algorithm in getStrategyOrder() in script.ts
- [ ] Verify that strategy has been pushed to algorithm in app.get('solver/nextStep') in app.ts
- [ ] Verify that identified is set to true when strategy found in isStrategyName in Strategy.ts
- [ ] Verify that strategy has been solved in Strategy.test.ts
- [ ] Verify that hint example has been added to hint Object Properties in README.md
- [ ] Verify that strategy is supported by backend as evident by being in activeGame numWrongCellsPlayedPerStrategy in README.md