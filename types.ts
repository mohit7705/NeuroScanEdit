export interface ProcessedImage {
  originalData: string; // Base64 string
  mimeType: string;
  url: string; // Blob URL for display
}

export interface GeneratedResult {
  imageUrl: string;
  loading: boolean;
  error?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}