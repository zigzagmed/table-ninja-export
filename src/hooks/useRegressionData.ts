
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RegressionApiService } from '../services/regressionApi';
import { RegressionRequest, RegressionResponse } from '../types/api';
import { regressionData as fallbackData } from '../data/regressionData';

export const useRegressionData = (regressionId?: string) => {
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const queryClient = useQueryClient();

  // Query for fetching regression data
  const {
    data: regressionData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['regression', regressionId],
    queryFn: () => {
      if (regressionId) {
        return RegressionApiService.getRegressionById(regressionId);
      }
      // If no ID provided, return fallback data for demo
      console.log('No regression ID provided, using fallback data');
      setIsUsingFallback(true);
      return Promise.resolve(fallbackData as RegressionResponse);
    },
    enabled: true,
    retry: (failureCount, error) => {
      // If API fails, use fallback data after 2 retries
      if (failureCount >= 2) {
        console.log('API failed, switching to fallback data');
        setIsUsingFallback(true);
        return false;
      }
      return true;
    },
  });

  // Mutation for running new regression
  const runRegressionMutation = useMutation({
    mutationFn: (request: RegressionRequest) => RegressionApiService.runRegression(request),
    onSuccess: (data) => {
      console.log('Regression completed successfully:', data);
      // Invalidate and refetch regression data
      queryClient.invalidateQueries({ queryKey: ['regression'] });
    },
    onError: (error) => {
      console.error('Regression failed:', error);
    },
  });

  // Mutation for deleting regression
  const deleteRegressionMutation = useMutation({
    mutationFn: (id: string) => RegressionApiService.deleteRegression(id),
    onSuccess: () => {
      console.log('Regression deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['regression'] });
    },
  });

  const runRegression = useCallback((request: RegressionRequest) => {
    setIsUsingFallback(false);
    return runRegressionMutation.mutateAsync(request);
  }, [runRegressionMutation]);

  const deleteRegression = useCallback((id: string) => {
    return deleteRegressionMutation.mutateAsync(id);
  }, [deleteRegressionMutation]);

  const refreshData = useCallback(() => {
    setIsUsingFallback(false);
    refetch();
  }, [refetch]);

  return {
    regressionData: regressionData || fallbackData,
    isLoading: isLoading || runRegressionMutation.isPending,
    error,
    isUsingFallback,
    runRegression,
    deleteRegression,
    refreshData,
    isRunningRegression: runRegressionMutation.isPending,
    isDeleting: deleteRegressionMutation.isPending,
  };
};
