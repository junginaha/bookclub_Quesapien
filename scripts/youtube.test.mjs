import { test } from 'node:test';
import assert from 'node:assert/strict';
import { youtubeId } from '../src/lib/youtube.ts';
const id = 'abcdefghijk';
test('watch, short, Shorts and embed links use a validated video ID', () => {
  for (const url of [`https://www.youtube.com/watch?v=${id}&t=30`, `https://youtu.be/${id}?si=share`, `https://youtube.com/shorts/${id}`, `https://m.youtube.com/live/${id}`, `https://www.youtube-nocookie.com/embed/${id}`]) assert.equal(youtubeId(url), id);
});
test('lookalike hosts, credentials and unsafe protocols cannot become embeds', () => {
  for (const url of [`https://youtube.com.evil.example/watch?v=${id}`, `https://evil.example/youtube.com/watch?v=${id}`, `http://youtu.be/${id}`, `javascript:alert(1)`, `https://user:password@youtu.be/${id}`, `https://youtu.be:444/${id}`]) assert.equal(youtubeId(url), null);
});
test('channel, playlist, malformed and extra paths are not videos', () => {
  for (const url of ['not a URL', 'https://youtube.com/@qsapiens', 'https://youtube.com/playlist?list=123', 'https://youtu.be/short', `https://youtube.com/embed/${id}/extra`]) assert.equal(youtubeId(url), null);
});
