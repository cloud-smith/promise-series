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
export type SeriesTask = (state: SeriesState) => Promise<unknown>;
export type SeriesNamedTasks = Record<string, SeriesTask>;
export type SeriesTasks = SeriesTask[] | SeriesNamedTasks;
export type SeriesConfig = {
    logging?: boolean;
    logger?: (data: any) => void;
    onStateChange?: (state: SeriesState) => void;
};
