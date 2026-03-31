"use client";

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useCallback, useEffect, useRef } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7037";

type EventHandlers = Record<string, (...args: unknown[]) => void>;

export function useSignalR(handlers: EventHandlers) {
  const connectionRef = useRef<HubConnection | null>(null);
  const handlersRef = useRef<EventHandlers>(handlers);

  // Mantém handlers atualizados sem reconectar
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const start = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (connectionRef.current?.state === HubConnectionState.Connected) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/chat`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    // Registra handlers dinamicamente
    Object.keys(handlersRef.current).forEach((event) => {
      connection.on(event, (...args) => {
        handlersRef.current[event]?.(...args);
      });
    });

    try {
      await connection.start();
      connectionRef.current = connection;
    } catch (err) {
      console.error("SignalR connection failed:", err);
    }
  }, []);

  const stop = useCallback(async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop();
      connectionRef.current = null;
    }
  }, []);

  useEffect(() => {
    start();
    return () => {
      stop();
    };
  }, [start, stop]);

  return { start, stop };
}