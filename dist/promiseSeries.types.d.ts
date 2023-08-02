import { PromiseProto } from '@cloud-smith/promise-until';
export interface SeriesProps extends SeriesConfig {
    tasks?: SeriesSupportedTasks;
    rollbacks?: SeriesSupportedTasks;
}
export type SeriesDefaults = {
    config: SeriesConfig;
    state: SeriesStateData;
};
export interface SeriesConfig extends SeriesHooks {
    timeout?: number;
    forceRollbacks?: boolean;
    forceParallelRollbacks?: boolean;
    useLogging?: boolean;
}
export type SeriesState = {
    data: SeriesStateData;
    get: () => SeriesStateData;
    set: (update: Partial<SeriesStateData>) => void;
    push: (task: SeriesTaskWrapper, collection: SeriesCollections) => void;
};
export type SeriesStateData = {
    config: SeriesConfig;
    isRunning: boolean;
    isComplete: boolean;
    isTasksSuccessful: boolean;
    isRollbacksSuccessful: boolean;
    tasks: SeriesTaskWrapper[];
    rollbacks: SeriesTaskWrapper[];
    current: SeriesCurrent;
    errors: SeriesStateErrors;
};
export type SeriesStateUpdate = {
    config: SeriesConfig;
    isRunning: boolean;
    isComplete: boolean;
    isTasksSuccessful: boolean;
    isRollbacksSuccessful: boolean;
    tasks: SeriesTaskWrapper[];
    rollbacks: SeriesTaskWrapper[];
    current: SeriesCurrent;
    errors: SeriesStateErrors;
};
export type SeriesStateErrors = {
    tasks: SeriesTaskWrapper[];
    rollbacks: SeriesTaskWrapper[];
};
export type SeriesCurrent = {
    taskLabel?: string;
    task?: SeriesTaskWrapper;
    rollback?: SeriesTaskWrapper;
};
export type SeriesHooks = {
    useLogger?: (data: any) => void;
    onStateChange?: (state: SeriesStateReport) => void;
    onStart?: (state: SeriesStateReport) => void;
    onTaskStart?: (state: SeriesStateReport) => void;
    onTaskComplete?: (task: SeriesStateReport) => void;
    onTaskError?: (task: SeriesStateReport) => void;
    onRollbackStart?: (state: SeriesStateReport) => void;
    onRollbackComplete?: (task: SeriesStateReport) => void;
    onRollbackError?: (task: SeriesStateReport) => void;
    onFinish?: (state: SeriesReport) => void;
};
export type SeriesEvents = {
    onStateChange: () => void;
    onStart: (state: SeriesStateData) => void;
    onTaskStart: (state: SeriesStateData) => void;
    onTaskComplete: (task: SeriesTaskWrapper) => void;
    onTaskError: (task: SeriesTaskWrapper) => void;
    onRollbackStart: (state: SeriesStateData) => void;
    onRollbackComplete: (task: SeriesTaskWrapper) => void;
    onRollbackError: (task: SeriesTaskWrapper) => void;
    onFinish: (state: SeriesStateData) => void;
};
export type SeriesTaskWrapper = {
    number: number;
    name: string;
    action: SeriesTaskPromise;
    results: any;
    error: any;
};
export type SeriesTimers = {
    timeouts: Record<string, ReturnType<typeof setTimeout>>;
    intervals: Record<string, ReturnType<typeof setInterval>>;
    createTimeout: (timerName: string, timeoutValue: number, callback: () => void) => void;
    clearTimeout: (timerName: string) => void;
    createInterval: (intervalName: string, intervalValue: number, callback: () => void) => void;
    clearInterval: (intervalName: string) => void;
};
export type SeriesSupportedTasks = SeriesSupportedTasksArray | SeriesSupportedTasksObject;
export type SeriesCollections = 'tasks' | 'rollbacks';
export type SeriesSupportedTasksArray = SeriesTaskPromise[] | SeriesTaskFunction[];
export type SeriesSupportedTasksObject = Record<string, SeriesTaskPromise | SeriesTaskFunction>;
export type SeriesTaskFunction = (state: SeriesStateReport) => unknown;
export type SeriesTaskPromise = (state: SeriesStateReport) => PromiseProto;
export type SeriesRecord = Record<string, any>;
export type SeriesParsers = {
    parseConfig: (props: SeriesProps) => void;
    parseTasks: () => void;
    parseRollbacks: () => void;
};
export interface SeriesUtils extends SeriesStateUtils {
    getCollectionType: (collection?: SeriesSupportedTasks) => {
        isArray: boolean;
        isNamedArray: boolean;
    };
    createTaskPromise: (task: SeriesTaskFunction) => SeriesTaskPromise;
    createTaskWrapper: (collectionName: SeriesCollections, action: SeriesTaskPromise, taskName?: string) => SeriesTaskWrapper;
    createRollbackWrapper: (action: SeriesTaskPromise, taskName?: string) => SeriesTaskWrapper;
    createTaskLabel: (collectionName: SeriesCollections, taskIndex: number, taskName: string) => string;
    createRollbackLabel: (taskIndex: number, taskName: string) => string;
    createReport: () => SeriesReport;
    createStateReport: () => SeriesStateReport;
}
export type SeriesStateUtils = {
    findTask: (key: number | string) => SeriesTaskWrapper | undefined;
    findRollback: (key: number | string) => SeriesTaskWrapper | undefined;
};
export interface SeriesReport extends SeriesStateUtils {
    isTasksSuccessful: boolean;
    isRollbacksSuccessful: boolean;
    errors: SeriesStateErrors;
    tasks: SeriesTaskWrapper[];
    rollbacks: SeriesTaskWrapper[];
}
export interface SeriesStateReport extends SeriesReport {
    config: SeriesConfig;
    current: SeriesCurrent;
}
export type SeriesRunner = () => Promise<SeriesTaskWrapper[]>;
export type SeriesPromise = () => Promise<SeriesReport>;
