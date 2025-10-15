import type { LocalModel, CloudModel } from './data';
import { sampleLocalModels, sampleCloudModels } from './data';

export function fetchLocalModels(): Promise<LocalModel[]> {
  return Promise.resolve(sampleLocalModels);
}

export function fetchCloudModels(): Promise<CloudModel[]> {
  return Promise.resolve(sampleCloudModels);
}
