export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    phase: number;
    mock?: boolean;
    [key: string]: unknown;
  };
}