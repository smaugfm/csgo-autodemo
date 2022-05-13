import { NamedCalibrationConfig } from './clicks';
import { NodemailerConfig } from './email';
import { Promisified, UnpackArray } from './misc';

export type RsgoBatchStore = {
  calibrationConfigs: {
    selectedIndex: number;
    list: NamedCalibrationConfig[];
  };
  emailConfig: NodemailerConfig;
  emailEnabled: boolean;
  lastUsedTargetFolder: string;
};

export type RsgoBatchStats = {
  stabilizationHistory: {
    stabElapsedMs: number;
    smoothnessSliderDragElapsedMs: number;
    smoothnessSliderDragTries: number;
    wholeElapsedMs: number;
    videoDurationS: number;
  }[];
};

export type RendererStore = {
  read: <K extends keyof RsgoBatchStore>(
    key: K,
  ) => Promise<Partial<RsgoBatchStore>[K]>;
  write: <K extends keyof RsgoBatchStore>(
    key: K,
    value: RsgoBatchStore[K],
  ) => Promise<void>;
  reset: () => Promise<void>;
};

export type MainStore = RendererStore & {
  stats: Promisified<RsgoBatchStats> & {
    addStab(
      data: UnpackArray<RsgoBatchStats['stabilizationHistory']>,
    ): Promise<void>;
  };
};
