
import { RegressionRequest, RegressionResponse, ApiError } from '../types/api';

// Configuration for API endpoints
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

export class RegressionApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'Network Error',
        message: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      }));
      throw new Error(errorData.message);
    }

    return response.json();
  }

  static async runRegression(request: RegressionRequest): Promise<RegressionResponse> {
    console.log('Running regression with request:', request);
    
    return this.makeRequest<RegressionResponse>('/regression/run', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async getRegressionById(id: string): Promise<RegressionResponse> {
    console.log('Fetching regression by ID:', id);
    
    return this.makeRequest<RegressionResponse>(`/regression/${id}`);
  }

  static async listRegressions(): Promise<Array<{ id: string; name: string; created_at: string }>> {
    console.log('Fetching regression list');
    
    return this.makeRequest<Array<{ id: string; name: string; created_at: string }>>('/regression/list');
  }

  static async deleteRegression(id: string): Promise<{ success: boolean }> {
    console.log('Deleting regression:', id);
    
    return this.makeRequest<{ success: boolean }>(`/regression/${id}`, {
      method: 'DELETE',
    });
  }
}
