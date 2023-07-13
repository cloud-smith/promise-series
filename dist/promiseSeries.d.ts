import { SeriesConfig, SeriesTasks, SeriesNamedTasks } from './promiseSeries.types';
export declare const promiseSeries: (seriesConfig?: SeriesConfig) => {
    run: (tasks: SeriesTasks) => Promise<unknown>;
    error: string;
    isRunning: boolean;
    isComplete: boolean;
    tasks: SeriesNamedTasks;
    results: Record<string, any>;
    taskCount: number;
    taskIndex: number;
    taskName: string;
};
