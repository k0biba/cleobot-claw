import express, { type Request, type Response } from "express";
import { EventEmitter } from "node:events";
import type { Server } from "node:http";

export interface RecordingCompletedEvent {
  recordingLocation: string;
  recordingAccessToken: string;
}

export class CallbackServer extends EventEmitter {
  private app = express();
  private server: Server | null = null;
  private port: number;

  constructor(port: number) {
    super();
    this.port = port;
    this.app.use(express.json());
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Graph Notification Endpoint
    this.app.post("/api/callback", (req: Request, res: Response) => {
      // Subscription validation
      const validationToken = req.query["validationToken"] as string | undefined;
      if (validationToken) {
        res.type("text/plain").status(200).send(validationToken);
        return;
      }

      const body = req.body;

      try {
        if (body?.value && Array.isArray(body.value)) {
          for (const notification of body.value) {
            this.handleNotification(notification);
          }
        } else {
          // Single notification object
          this.handleNotification(body);
        }
      } catch (err) {
        console.error("[callback] Error processing notification:", err);
      }

      res.status(200).json({});
    });

    // Internal stop endpoint
    this.app.post("/api/stop", (_req: Request, res: Response) => {
      this.emit("stopRequested");
      // Response will be sent after pipeline completes
      this.once("pipelineComplete", (result: { success: boolean; outputDir?: string; error?: string }) => {
        res.status(200).json(result);
      });
    });
  }

  private handleNotification(notification: Record<string, unknown>): void {
    const resourceData = notification["resourceData"] as Record<string, unknown> | undefined;
    if (!resourceData) return;

    // Check for recording completed
    const resultInfo = resourceData["resultInfo"] as Record<string, unknown> | undefined;
    const status = resourceData["status"] as string | undefined;

    if (status === "completed" || resultInfo?.["code"] === 200) {
      const recordingLocation = resourceData["recordingLocation"] as string | undefined;
      const recordingAccessToken = resourceData["recordingAccessToken"] as string | undefined;

      if (recordingLocation && recordingAccessToken) {
        this.emit("recordingCompleted", {
          recordingLocation,
          recordingAccessToken,
        } satisfies RecordingCompletedEvent);
        return;
      }
    }

    // Check for call established
    const callState = (resourceData["state"] as string)?.toLowerCase();
    if (callState === "established") {
      this.emit("callEstablished");
      return;
    }

    // Check for call ended / deleted
    const changeType = notification["changeType"] as string | undefined;
    if (changeType === "deleted" || callState === "terminated") {
      this.emit("callEnded");
      return;
    }
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          console.error(`[callback] Server listening on port ${this.port}`);
          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}
