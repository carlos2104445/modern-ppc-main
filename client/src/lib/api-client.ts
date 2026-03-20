import { toast } from "@/hooks/use-toast";

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class NetworkError extends Error {
  constructor(message: string = "Network error. Please check your connection.") {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor(message: string = "Request timed out. Please try again.") {
    super(message);
    this.name = "TimeoutError";
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

class APIClient {
  private baseURL: string;
  private defaultTimeout: number = 30000;

  constructor(baseURL: string = "") {
    this.baseURL = baseURL;
  }

  private async fetchWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new TimeoutError();
      }

      if (!navigator.onLine) {
        throw new NetworkError("You appear to be offline. Please check your internet connection.");
      }

      throw new NetworkError();
    }
  }

  private async handleResponse<T>(response: Response, showErrorToast: boolean = true): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJSON = contentType?.includes("application/json");

    let data: any;
    try {
      data = isJSON ? await response.json() : await response.text();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      const errorMessage =
        data?.error || data?.message || data || `Request failed with status ${response.status}`;

      const apiError = new APIError(errorMessage, response.status, response.statusText, data);

      if (showErrorToast) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }

      throw apiError;
    }

    return data as T;
  }

  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { showErrorToast = true, ...fetchOptions } = options;

    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      method: "GET",
    });

    return this.handleResponse<T>(response, showErrorToast);
  }

  async post<T = any>(endpoint: string, body?: any, options: RequestOptions = {}): Promise<T> {
    const {
      showErrorToast = true,
      showSuccessToast = false,
      successMessage,
      ...fetchOptions
    } = options;

    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await this.handleResponse<T>(response, showErrorToast);

    if (showSuccessToast && successMessage) {
      toast({
        title: "Success",
        description: successMessage,
      });
    }

    return data;
  }

  async put<T = any>(endpoint: string, body?: any, options: RequestOptions = {}): Promise<T> {
    const {
      showErrorToast = true,
      showSuccessToast = false,
      successMessage,
      ...fetchOptions
    } = options;

    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await this.handleResponse<T>(response, showErrorToast);

    if (showSuccessToast && successMessage) {
      toast({
        title: "Success",
        description: successMessage,
      });
    }

    return data;
  }

  async patch<T = any>(endpoint: string, body?: any, options: RequestOptions = {}): Promise<T> {
    const {
      showErrorToast = true,
      showSuccessToast = false,
      successMessage,
      ...fetchOptions
    } = options;

    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await this.handleResponse<T>(response, showErrorToast);

    if (showSuccessToast && successMessage) {
      toast({
        title: "Success",
        description: successMessage,
      });
    }

    return data;
  }

  async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      showErrorToast = true,
      showSuccessToast = false,
      successMessage,
      ...fetchOptions
    } = options;

    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      method: "DELETE",
    });

    const data = await this.handleResponse<T>(response, showErrorToast);

    if (showSuccessToast && successMessage) {
      toast({
        title: "Success",
        description: successMessage,
      });
    }

    return data;
  }
}

export const apiClient = new APIClient("/api");
export default apiClient;
