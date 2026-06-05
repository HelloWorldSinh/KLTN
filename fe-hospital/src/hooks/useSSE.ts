import { useEffect, useRef } from 'react';

interface SseOptions {
  url: string;
  eventListeners: {
    [eventName: string]: (e: MessageEvent) => void;
  };
  enabled?: boolean;
}

/**
 * Custom Hook kết nối Server-Sent Events (SSE).
 *
 * @param options cấu hình url, danh sách listeners và trạng thái bật/tắt
 * @param deps danh sách phụ thuộc để kích hoạt kết nối lại khi thay đổi
 */
export const useSSE = ({ url, eventListeners, enabled = true }: SseOptions, deps: any[] = []) => {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !url) return;

    console.log(`[SSE] Connecting to: ${url}`);
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // Đăng ký các sự kiện lắng nghe từ server
    Object.entries(eventListeners).forEach(([eventName, listener]) => {
      eventSource.addEventListener(eventName, listener as EventListener);
    });

    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
    };

    // Hàm dọn dẹp khi unmount hoặc khi thay đổi dependency
    return () => {
      console.log(`[SSE] Closing connection to: ${url}`);
      Object.entries(eventListeners).forEach(([eventName, listener]) => {
        eventSource.removeEventListener(eventName, listener as EventListener);
      });
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [url, enabled, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
};
