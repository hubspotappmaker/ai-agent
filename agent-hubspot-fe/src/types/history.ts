export interface Activity {
  createdAt: string;
  updatedAt: string;
  id: string;
  note: string;
  action: string;
  type: string;
  maxToken: number;
  engineName: string;
  modelName: string;
  status: string;
  errorMessage: string | null;
  executionTimeMs: number | null;
  userId: string;
  provider: any;
  providerId: string | null;
  portalId: string;
}

export interface HistoryResponse {
  status: boolean;
  data: {
    activities: Activity[];
    total: number;
  };
  msg: string;
}

export interface HistoryParams {
  portalId: string;
  limit?: number;
  offset?: number;
}
