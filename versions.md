@cloud-smith/promise-series

TODOS
- Bug: Unable to setState correctly during a task.
- Add: Rollbacks count and names must match tasks during parsing.
- Update: Refactor promiseSeries into a class.

1/8/2023
- 2.0.1 Fixes type on passing task state to tasks

31/7/2023
- 2.0.0
  - Refactors promise-series into an exported class
  - Breaking changes, updated event-hooks

27/7/2023
- 1.2.5
  - Bug fixes type bug on findTasks and findResults
  - Resolves linting issues on run and rollback

26/7/2023
- 1.2.4 - Refactors shouldRollbackInSeries to shouldRollbackInParallel
- 1.2.3 - Adds findResults to state updates
- 1.2.2 - Updates getTask to findTask
- 1.2.1 - Adds getTask to state updates

25/7/2023
- 1.2.0 - Adds rollbacks

23/7/2023
- 1.1.0
  - Refactors config parser
  - Refactors tasks parser
  - Refactors state to tasks
  - Refactors runPromsieSeries
  - Refactors events to callbacks
  - Refactors logger to log
  - Adds task lifecycle events

21/7/2023
- 1.0.3 - Updates on-task-fail to returns state
- 1.0.2 - Adds config timeout

15/7/2023
- 1.0.1 - Updates the homepage link

- 1.0.0
  - Exports dummyTask
  - Updates the build
  - Updates the readme

- 0.2.2 - removes custom logger
