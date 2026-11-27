import type express from 'express';
import { handleAqi } from '../src/server/createApiApp';

export default function handler(req: express.Request, res: express.Response) {
  handleAqi(req, res);
}
