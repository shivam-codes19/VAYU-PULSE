import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatFriendlyGeminiError,
  generateChatReplyWithFailover,
  isTransientGeminiError,
} from './geminiChat';
import { ThinkingLevel } from '@google/genai';

test('isTransientGeminiError identifies 503 high-demand and timeouts as transient', () => {
  assert.equal(
    isTransientGeminiError(
      new Error('{"error":{"code":503,"message":"This model is currently experiencing high demand.","status":"UNAVAILABLE"}}')
    ),
    true
  );
  assert.equal(isTransientGeminiError(new Error('Timeout after 12000ms waiting for gemini-4-hydrogen')), true);
  assert.equal(isTransientGeminiError(new Error('API_KEY_INVALID 400')), false);
});

test('formatFriendlyGeminiError produces clean non-raw messages by error category', () => {
  const highDemand = formatFriendlyGeminiError(
    new Error('{"error":{"code":503,"status":"UNAVAILABLE","message":"high demand"}}')
  );
  assert.equal(highDemand.status, 503);
  assert.ok(!highDemand.message.includes('{'));

  const invalidKey = formatFriendlyGeminiError(new Error('403 PERMISSION_DENIED'));
  assert.equal(invalidKey.status, 403);
  assert.ok(invalidKey.message.includes('GEMINI_API_KEY'));

  const quota = formatFriendlyGeminiError(new Error('429 RESOURCE_EXHAUSTED'));
  assert.equal(quota.status, 429);
});

test('generateChatReplyWithFailover falls over from 503 primary model to fast secondary Gemini model', async () => {
  const calledModels: string[] = [];
  const fakeAi = {
    models: {
      generateContent: async ({ model }: { model: string }) => {
        calledModels.push(model);
        if (model === 'gemini-4-hydrogen') {
          throw new Error('{"error":{"code":503,"status":"UNAVAILABLE","message":"high demand"}}');
        }
        return { text: 'Open windows briefly between 1:30 PM and 3:30 PM.' };
      },
    },
  };

  const result = await generateChatReplyWithFailover(
    fakeAi as never,
    { prompt: 'When to open windows?', systemInstruction: 'Test' },
    [
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, timeoutMs: 2000 },
      { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL, timeoutMs: 2000 },
    ]
  );

  assert.deepEqual(calledModels, ['gemini-4-hydrogen', 'gemini-3.1-flash-lite']);
  assert.equal(result.modelUsed, 'gemini-3.1-flash-lite');
  assert.match(result.text, /1:30 PM/);
});

test('generateChatReplyWithFailover stops immediately on non-transient 403 auth error', async () => {
  const calledModels: string[] = [];
  const fakeAi = {
    models: {
      generateContent: async ({ model }: { model: string }) => {
        calledModels.push(model);
        throw new Error('403 PERMISSION_DENIED');
      },
    },
  };

  await assert.rejects(() =>
    generateChatReplyWithFailover(
      fakeAi as never,
      { prompt: 'Hi', systemInstruction: 'Test' },
      [
        { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, timeoutMs: 2000 },
        { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL, timeoutMs: 2000 },
      ]
    )
  );
  assert.deepEqual(calledModels, ['gemini-4-hydrogen']);
});
