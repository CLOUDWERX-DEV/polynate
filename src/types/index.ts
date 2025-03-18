export interface ImageGenParams {
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
  model?: string;
  nologo?: boolean;
  private?: boolean;
  enhance?: boolean;
  safe?: boolean;
}

export interface TextGenParams {
  prompt: string;
  model?: string;
  seed?: number;
  system?: string;
  private?: boolean;
  json?: boolean;
}

export interface AudioGenParams {
  prompt: string;
  model?: string;
  voice?: string;
}

export interface VisionParams {
  imageUrl: string;
  prompt: string;
  model?: string;
}
