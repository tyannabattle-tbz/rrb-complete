import { useState, useCallback } from "react";

export type BatchOperationType = "tag" | "delete" | "export" | "status_update" | "share";

export interface BatchOperation {
  id: string;
  type: BatchOperationType;
  itemIds: string[];
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: number; // 0-100
  totalItems: number;
  completedItems: number;
  failedItems: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export interface UseBatchOperationsOptions {
  enabled?: boolean;
}

/**
 * Hook for managing batch operations with progress tracking
 */
export function useBatchOperations(options: UseBatchOperationsOptions) {
  const { enabled = true } = options;

  const [operations, setOperations] = useState<BatchOperation[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentOperation, setCurrentOperation] = useState<BatchOperation | null>(null);

  // Select items
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Select all items
  const selectAll = useCallback((itemIds: string[]) => {
    setSelectedItems(new Set(itemIds));
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Create batch operation
  const createBatchOperation = useCallback(
    (type: BatchOperationType, itemIds: string[], metadata?: Record<string, any>) => {
      const operation: BatchOperation = {
        id: `batch-${Date.now()}`,
        type,
        itemIds,
        status: "pending",
        progress: 0,
        totalItems: itemIds.length,
        completedItems: 0,
        failedItems: 0,
        startTime: new Date(),
        metadata,
      };

      setOperations((prev) => [operation, ...prev]);
      setCurrentOperation(operation);

      return operation.id;
    },
    []
  );

  // Update operation progress
  const updateProgress = useCallback(
    (operationId: string, completedItems: number, failedItems: number) => {
      setOperations((prev) =>
        prev.map((op) => {
          if (op.id === operationId) {
            const progress = Math.round(
              ((completedItems + failedItems) / op.totalItems) * 100
            );
            const status =
              completedItems + failedItems === op.totalItems
                ? "completed"
                : "in_progress";

            return {
              ...op,
              progress,
              completedItems,
              failedItems,
              status: status as "in_progress" | "completed",
              endTime: status === "completed" ? new Date() : undefined,
            };
          }
          return op;
        })
      );

      if (currentOperation?.id === operationId) {
        setCurrentOperation((prev) => {
          if (!prev) return null;
          const progress = Math.round(
            ((completedItems + failedItems) / prev.totalItems) * 100
          );
          return {
            ...prev,
            progress,
            completedItems,
            failedItems,
          };
        });
      }
    },
    [currentOperation]
  );

  // Mark operation as failed
  const failOperation = useCallback(
    (operationId: string, error: string) => {
      setOperations((prev) =>
        prev.map((op) =>
          op.id === operationId
            ? {
                ...op,
                status: "failed" as const,
                error,
                endTime: new Date(),
              }
            : op
        )
      );
    },
    []
  );

  // Undo operation
  const undoOperation = useCallback((operationId: string) => {
    setOperations((prev) =>
      prev.map((op) =>
        op.id === operationId
          ? {
              ...op,
              status: "pending" as const,
              progress: 0,
              completedItems: 0,
              failedItems: 0,
              endTime: undefined,
              error: undefined,
            }
          : op
      )
    );
  }, []);

  // Clear completed operations
  const clearCompleted = useCallback(() => {
    setOperations((prev) =>
      prev.filter((op) => op.status !== "completed" && op.status !== "failed")
    );
  }, []);

  // Get operation history
  const getOperationHistory = useCallback(() => {
    return operations.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [operations]);

  // Get operation stats
  const getStats = useCallback(() => {
    const completed = operations.filter((op) => op.status === "completed").length;
    const failed = operations.filter((op) => op.status === "failed").length;
    const inProgress = operations.filter((op) => op.status === "in_progress").length;
    const totalItems = operations.reduce((sum, op) => sum + op.totalItems, 0);

    return {
      total: operations.length,
      completed,
      failed,
      inProgress,
      totalItems,
      successRate:
        operations.length > 0
          ? Math.round((completed / operations.length) * 100)
          : 0,
    };
  }, [operations]);

  return {
    selectedItems,
    currentOperation,
    operations: getOperationHistory(),
    stats: getStats(),
    toggleItemSelection,
    selectAll,
    clearSelection,
    createBatchOperation,
    updateProgress,
    failOperation,
    undoOperation,
    clearCompleted,
  };
}
