import type express from 'express';
import { handleHealth } from '../src/server/createApiApp';

export default function handler(req: express.Request, res: express.Response) {
  handleHealth(req, res);
}
