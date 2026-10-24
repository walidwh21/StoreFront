export interface Alert {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timeout?: number; // optional auto-dismiss timeout in ms
}