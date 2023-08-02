import * as Types from './promiseSeries.types';
export declare class PromiseSeries {
    props: Types.SeriesProps;
    hooks: Types.SeriesHooks;
    defaults: Types.SeriesDefaults;
    constructor(props: Types.SeriesProps);
    state: Types.SeriesState;
    timers: Types.SeriesTimers;
    events: Types.SeriesEvents;
    parsers: Types.SeriesParsers;
    utils: Types.SeriesUtils;
    log: (data: any) => void;
    run: () => Promise<Types.SeriesReport>;
    rollback: () => Promise<Types.SeriesReport>;
    promise: Types.SeriesPromise;
}
