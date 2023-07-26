export interface SeriesProps extends SeriesConfigUpdate {
    tasks: SeriesTasksUnparsed;
    rollbacks?: SeriesTasksUnparsed;
}
export type SeriesConfig = {
    useLogging: boolean;
    timeout: number;
    shouldRollbackInSeries: boolean;
    useLogger: (data: any) => void;
    onStateChange: (state: SeriesStateUpdate) => void;
    onStarting: (state: SeriesStateUpdate) => void;
    onTaskStart: (state: SeriesStateUpdate) => void;
    onTaskComplete: (state: SeriesStateUpdate) => void;
    onTaskFailed: (state: SeriesStateUpdate) => void;
    onFinished: (state: SeriesStateUpdate) => void;
};
export type SeriesConfigUpdate = {
    useLogging?: boolean;
    timeout?: number;
    shouldRollbackInSeries?: boolean;
    useLogger?: (data: any) => void;
    onStateChange?: (state: SeriesStateUpdate) => void;
    onStarting?: (state: SeriesStateUpdate) => void;
    onTaskStart?: (state: SeriesStateUpdate) => void;
    onTaskComplete?: (state: SeriesStateUpdate) => void;
    onTaskFailed?: (state: SeriesStateUpdate) => void;
    onFinished?: (state: SeriesStateUpdate) => void;
};
export type SeriesState = {
    isRunning: boolean;
    isComplete: boolean;
    taskIndex: number;
    taskName: string;
    taskLabel: string;
    get: () => SeriesStateUpdate;
    set: (update: SeriesStateProps) => void;
};
export type SeriesStateUpdate = {
    isRunning: boolean;
    isComplete: boolean;
    taskIndex: number;
    taskName: string;
    taskLabel: string;
    tasks: SeriesTask[];
    getTask: (key: string | number) => {} | SeriesTask;
};
export type SeriesStateProps = {
    isRunning?: boolean;
    isComplete?: boolean;
    taskIndex?: number;
    taskName?: string;
    taskLabel?: string;
};
export type SeriesTasks = {
    stack: SeriesTask[];
    total: number;
    push: (task: SeriesFunctionPromise, taskName?: string) => void;
    set: (update: SeriesTasksUpdate) => void;
};
export type SeriesTask = {
    number: number;
    name: string;
    task: SeriesFunctionPromise;
    results: any;
    error?: string;
};
export type SeriesTasksUpdate = {
    total?: number;
};
export type SeriesRollbacks = {
    stack: SeriesTask[];
    total: number;
    push: (task: SeriesFunctionPromise, taskName?: string) => void;
    set: (update: SeriesTasksUpdate) => void;
};
export type SeriesFunctionPromise = (state: SeriesStateUpdate) => Promise<unknown>;
export type SeriesFunction = (state: SeriesStateUpdate) => void;
export type SeriesMixedArray = SeriesFunctionPromise[] | SeriesFunction[];
export type SeriesMixedNamed = SeriesNamedTasks | SeriesNamedFunctions;
export type SeriesNamedFunctions = Record<string, SeriesFunction>;
export type SeriesNamedTasks = Record<string, SeriesFunctionPromise>;
export type SeriesTasksUnparsed = SeriesFunctionPromise[] | SeriesFunction[] | Record<string, SeriesFunctionPromise | SeriesFunction>;
