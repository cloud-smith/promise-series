import { PromiseSeries, SeriesProps } from './';

export const promiseSeries = (props: SeriesProps) =>
  new PromiseSeries(props)
    .promise();
