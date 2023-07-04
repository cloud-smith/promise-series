export type PromiseSeriesTask = () => Promise<unknown>;

export type PromiseSeriesSettings = {
  logging?: boolean;
  logger?: (data: any) => void;
}
