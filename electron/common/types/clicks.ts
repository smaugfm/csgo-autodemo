export type Coordinates = {
  x: number;
  y: number;
};

export type Rect = {
  width: number;
  height: number;
};

export type ScreenArea = Rect & {
  topLeft: Coordinates;
};

export type ScreenAreaImage = ScreenArea & {
  image: Buffer;
};

export type PixelCheck = {
  pixelCoordinates: Coordinates;
  color: string;
};

export type CalibrationConfig = {
  loadVideo: Coordinates;
  fileBrowserFolderPixelCheckMouseDown: PixelCheck;
  saveVideo: Coordinates;

  playIcon: Coordinates;

  settings: {
    icon: Coordinates;
    okay: Coordinates;
    smoothnessPinStart: Coordinates;
    smoothnessPinTarget: Coordinates;
  };
};

export type NamedCalibrationConfig = {
  name: string;
} & CalibrationConfig;
