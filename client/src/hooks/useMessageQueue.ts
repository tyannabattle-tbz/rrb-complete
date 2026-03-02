import { useCallback, useRef, useState, useEffect } from "react";

export interface QueuedMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export interface UseMessageQueueOptions {
  maxQueueSize?: number;
  maxRetries?: number;
  onMessageSent?: (message: QueuedMessage) => void;
  onMessageFailed?: (message: QueuedMessage, error: string) => void;
  onQueueChanged?: (queue: QueuedMessage[]) => void;
}

export function useMessageQueue(options: UseMessageQueueOptions = {}) {
  const {
    maxQueueSize = 100,
    maxRetries = 3,
    onMessageSent,
    onMessageFailed,
    onQueueChanged,
  } = options;

  const queueRef = useRef<QueuedMessage[]>([]);
  const [queue, setQueue] = useState<QueuedMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add message to queue
  const enqueue = useCallback((message: any, type: string = "message") => {
    const queuedMessage: QueuedMessage = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      data: message,
      timestamp: Date.now(),
      retries: 0,
      maxRetries,
    };

    if (queueRef.current.length >= maxQueueSize) {
      console.warn("[MessageQueue] Queue is full, removing oldest message");
      queueRef.current.shift();
    }

    queueRef.current.push(queuedMessage);
    setQueue([...queueRef.current]);
    onQueueChanged?.(queueRef.current);

    console.log(`[MessageQueue] Message enqueued: ${queuedMessage.id}`, queuedMessage);
    return queuedMessage.id;
  }, [maxQueueSize, maxRetries, onQueueChanged]);

  // Remove message from queue
  const dequeue = useCallback((messageId: string) => {
    const index = queueRef.current.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      const [removed] = queueRef.current.splice(index, 1);
      setQueue([...queueRef.current]);
      onQueueChanged?.(queueRef.current);
      console.log(`[MessageQueue] Message dequeued: ${messageId}`);
      return removed;
    }
    return null;
  }, [onQueueChanged]);

  // Mark message as sent
  const markAsSent = useCallback((messageId: string) => {
    const message = dequeue(messageId);
    if (message) {
      onMessageSent?.(message);
    }
  }, [dequeue, onMessageSent]);

  // Mark message as failed
  const markAsFailed = useCallback((messageId: string, error: string) => {
    const message = queueRef.current.find((m) => m.id === messageId);
    if (message) {
      message.retries += 1;
      if (message.retries >= message.maxRetries) {
        dequeue(messageId);
        onMessageFailed?.(message, error);
        console.error(`[MessageQueue] Message failed after ${message.retries} retries: ${messageId}`, error);
      } else {
        setQueue([...queueRef.current]);
        console.warn(`[MessageQueue] Message retry ${message.retries}/${message.maxRetries}: ${messageId}`);
      }
    }
  }, [dequeue, onMessageFailed]);

  // Get queue size
  const getQueueSize = useCallback(() => {
    return queueRef.current.length;
  }, []);

  // Get queue
  const getQueue = useCallback(() => {
    return [...queueRef.current];
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    setQueue([]);
    onQueueChanged?.([]);
    console.log("[MessageQueue] Queue cleared");
  }, [onQueueChanged]);

  // Process queue with callback
  const processQueue = useCallback(
    async (sender: (message: QueuedMessage) => Promise<void>) => {
      if (isProcessing || queueRef.current.length === 0) {
        return;
      }

      setIsProcessing(true);
      const messagesToProcess = [...queueRef.current];

      for (const message of messagesToProcess) {
        try {
          await sender(message);
          markAsSent(message.id);
        } catch (error) {
          markAsFailed(message.id, String(error));
        }
      }

      setIsProcessing(false);
    },
    [isProcessing, markAsSent, markAsFailed]
  );

  // Auto-process queue when it changes
  const startAutoProcessing = useCallback(
    (sender: (message: QueuedMessage) => Promise<void>, interval: number = 5000) => {
      const processInterval = setInterval(() => {
        processQueue(sender);
      }, interval);

      return () => clearInterval(processInterval);
    },
    [processQueue]
  );

  return {
    enqueue,
    dequeue,
    markAsSent,
    markAsFailed,
    getQueueSize,
    getQueue,
    clearQueue,
    processQueue,
    startAutoProcessing,
    queue,
    isProcessing,
  };
}
