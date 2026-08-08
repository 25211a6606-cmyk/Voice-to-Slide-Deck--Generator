import axios from 'axios';
import { Context } from 'hono';
import { env } from '../config/env.js';

/**
 * Proxies POST requests to the AI Backend service.
 * Supports both JSON payloads and multipart/form-data (audio uploads).
 */
export async function proxyToAiBackend(c: Context, targetEndpoint: string) {
  try {
    const aiUrl = `${env.AI_BACKEND_URL.replace(/\/$/, '')}${targetEndpoint}`;
    const contentType = c.req.header('content-type') || '';

    let requestBody: any;
    let headers: Record<string, string> = {};

    if (contentType.includes('multipart/form-data')) {
      // Forward raw incoming body stream for file uploads
      const arrayBuffer = await c.req.arrayBuffer();
      requestBody = Buffer.from(arrayBuffer);
      headers['content-type'] = contentType;
    } else {
      // Forward JSON or urlencoded payload
      try {
        requestBody = await c.req.json();
        headers['content-type'] = 'application/json';
      } catch {
        const text = await c.req.text();
        requestBody = text;
        headers['content-type'] = contentType || 'text/plain';
      }
    }

    // Forward request to AI backend using axios
    const response = await axios({
      method: 'POST',
      url: aiUrl,
      data: requestBody,
      headers,
      validateStatus: () => true, // Pass through any status code
    });

    return c.json(response.data, response.status as any);
  } catch (error: any) {
    console.error(`AI Proxy Error [${targetEndpoint}]:`, error.message);
    return c.json(
      {
        success: false,
        message: `Failed to proxy request to AI backend: ${error.message}`,
      },
      502
    );
  }
}
