export type SeriesProps = {
    tasks: SeriesTasksUnparsed;
    config?: SeriesConfig;
    onComplete?: (results: any) => void;
    onError?: (error: string) => void;
    onStateChange?: (state: SeriesState) => void;
};
export type SeriesState = {
    error: string;
    isRunning: boolean;
    isComplete: boolean;
    tasks: SeriesNamedTasks;
    results: Record<string, any>;
    taskCount: number;
    taskIndex: number;
    taskName: string;
};
export type SeriesFunctionPromise = (state: SeriesState) => Promise<unknown>;
export type SeriesFunction = (state: SeriesState) => void;
export type SeriesNamedTasks = Record<string, SeriesFunctionPromise>;
export type SeriesTasks = SeriesFunctionPromise[] | SeriesNamedTasks | SeriesFunction[];
export type SeriesTasksUnparsed = SeriesFunctionPromise[] | SeriesFunction[] | Record<string, SeriesFunctionPromise | SeriesFunction>;
export type SeriesConfig = {
    useLogging?: boolean;
    useLogger?: any;
};
export type SeriesEvents = {
    onStateChange?: (stateUpdate: SeriesState) => void;
    onComplete?: (results: any) => void;
    onError?: (errorMessage: string) => void;
};
