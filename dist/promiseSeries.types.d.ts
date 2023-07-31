export interface SeriesProps extends SeriesConfig {
    tasks?: SeriesSupportedTasks;
    rollbacks?: SeriesSupportedTasks;
}
export interface SeriesConfig extends SeriesHooks {
    timeout?: number;
    faultTolerantRollbacks?: boolean;
    useLogging?: boolean;
}
export type SeriesState = {
    data: SeriesStateData;
    get: () => SeriesStateData;
    set: (update: Record<string, any>) => void;
    push: (task: SeriesTaskWrapper, collection: SeriesCollections) => void;
};
export type SeriesStateData = {
    config: SeriesConfig;
    isRunning: boolean;
    isComplete: boolean;
    isTasksComplete: boolean;
    isRollbacksComplete: boolean;
    tasks: SeriesTaskWrapper[];
    rollbacks: SeriesTaskWrapper[];
    current: {
        taskLabel?: string;
        task?: SeriesTaskWrapper;
        rollback?: SeriesTaskWrapper;
    };
    errors: {
        tasks: null | Error;
        rollbacks: null | Error;
    };
};
export type SeriesHooks = {
    useLogger?: (data: any) => void;
    onStateChange?: (state: SeriesHookProps) => void;
    onStart?: (state: SeriesHookProps) => void;
    onTaskStart?: (state: SeriesHookProps) => void;
    onTaskComplete?: (task: SeriesTaskWrapper) => void;
    onTaskError?: (task: SeriesTaskWrapper) => void;
    onRollbackStart?: (state: SeriesHookProps) => void;
    onRollbackComplete?: (task: SeriesHookProps) => void;
    onRollbackError?: (task: SeriesTaskWrapper) => void;
    onFinish?: (state: SeriesHookProps) => void;
};
export interface SeriesHookProps extends SeriesStateData, SeriesStateUtils {
}
export type SeriesEvents = {
    onStateChange: (state: SeriesStateData) => void;
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
export type SeriesTaskFunction = (state: SeriesHookProps) => unknown;
export type SeriesTaskPromise = (state: SeriesHookProps) => Promise<unknown>;
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
    createTaskWrapper: (action: SeriesTaskPromise, taskName?: string) => SeriesTaskWrapper;
    createRollbackWrapper: (action: SeriesTaskPromise, taskName?: string) => SeriesTaskWrapper;
    createTaskLabel: (taskIndex: number, taskName: string) => string;
    createRollbackLabel: (taskIndex: number, taskName: string) => string;
    getHookProps: () => SeriesHookProps;
}
export type SeriesStateUtils = {
    findTask: (key: number | string) => SeriesTaskWrapper | object;
    findRollback: (key: number | string) => SeriesTaskWrapper | object;
};
export type SeriesRunner = () => Promise<SeriesTaskWrapper[]>;
export type SeriesPromise = () => Promise<SeriesTaskWrapper[]>;
