import type express from 'express';
import { handleChat } from '../src/server/createApiApp';

export default async function handler(req: express.Request, res: express.Response) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST /api/chat.' });
    return;
  }
  await handleChat(req, res);
}
