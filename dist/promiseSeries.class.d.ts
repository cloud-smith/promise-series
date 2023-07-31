import * as Types from './promiseSeries.types';
export declare class PromiseSeries {
    props: Types.SeriesProps;
    hooks: Types.SeriesHooks;
    defaults: Types.SeriesConfig;
    constructor(props: Types.SeriesProps);
    state: Types.SeriesState;
    timers: Types.SeriesTimers;
    events: Types.SeriesEvents;
    parsers: Types.SeriesParsers;
    utils: Types.SeriesUtils;
    log: (data: any) => void;
    run: () => Promise<Types.SeriesTaskWrapper[]>;
    rollback: () => Promise<Types.SeriesTaskWrapper[]>;
    promise: Types.SeriesPromise;
}
export declare const promiseSeries: (props: Types.SeriesProps) => Promise<Types.SeriesTaskWrapper[]>;
