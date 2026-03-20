import { useState, useCallback, useEffect } from "react";
import apiClient, { APIError, NetworkError, TimeoutError } from "@/lib/api-client";

interface UseAPIOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface UseAPIState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function useAPI<T = any>(options: UseAPIOptions = {}) {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    error: null,
    loading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      setState({
        data: null,
        error: null,
        loading: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const result = await apiCall();
        setState({
          data: result,
          error: null,
          loading: false,
          isSuccess: true,
          isError: false,
        });

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (error: any) {
        const errorObj = error instanceof Error ? error : new Error(String(error));

        setState({
          data: null,
          error: errorObj,
          loading: false,
          isSuccess: false,
          isError: true,
        });

        if (options.onError) {
          options.onError(errorObj);
        }

        throw errorObj;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      loading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useQuery<T = any>(
  endpoint: string,
  options: UseAPIOptions & { enabled?: boolean } = {}
) {
  const { enabled = true, ...apiOptions } = options;
  const api = useAPI<T>(apiOptions);

  const refetch = useCallback(() => {
    return api.execute(() => apiClient.get<T>(endpoint, apiOptions));
  }, [endpoint, apiOptions]);

  useEffect(() => {
    if (enabled) {
      refetch();
    }
  }, [enabled, refetch]);

  return {
    ...api,
    refetch,
  };
}

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseAPIOptions = {}
) {
  const api = useAPI<TData>(options);

  const mutate = useCallback(
    async (variables: TVariables) => {
      return api.execute(() => mutationFn(variables));
    },
    [mutationFn, api]
  );

  return {
    ...api,
    mutate,
  };
}
