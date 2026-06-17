import type {
  PublishingBook,
  PublishingChapter,
  PublishingLayout,
  PublishingExport,
  BookStatus,
  PageSize,
} from './types';

const BASE = '/api/publishing';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API 오류가 발생했습니다');
  }
  return res.json();
}

// ── Books ──────────────────────────────────────────────────
export const booksApi = {
  list: () => request<PublishingBook[]>('/books'),

  create: (data: Partial<PublishingBook>) =>
    request<PublishingBook>('/books', { method: 'POST', body: JSON.stringify(data) }),

  get: (bookId: string) =>
    request<PublishingBook>(`/books/${bookId}`),

  update: (bookId: string, data: Partial<PublishingBook>) =>
    request<PublishingBook>(`/books/${bookId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (bookId: string) =>
    request<void>(`/books/${bookId}`, { method: 'DELETE' }),

  updateStatus: (bookId: string, status: BookStatus) =>
    booksApi.update(bookId, { status }),
};

// ── Manuscript ─────────────────────────────────────────────
export const manuscriptApi = {
  upload: async (bookId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/books/${bookId}/manuscript`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || '업로드 실패');
    }
    return res.json();
  },

  getChapters: (bookId: string) =>
    request<PublishingChapter[]>(`/books/${bookId}/chapters`),
};

// ── Layout ─────────────────────────────────────────────────
export const layoutApi = {
  get: (bookId: string) =>
    request<PublishingLayout>(`/books/${bookId}/layout`),

  save: (bookId: string, data: Partial<PublishingLayout>) =>
    request<PublishingLayout>(`/books/${bookId}/layout`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ── Colophon ───────────────────────────────────────────────
export const colophonApi = {
  preview: (bookId: string) =>
    request<{ html: string }>(`/books/${bookId}/colophon`),
};

// ── TOC ────────────────────────────────────────────────────
export const tocApi = {
  generate: (bookId: string) =>
    request<{ toc: PublishingChapter[] }>(`/books/${bookId}/toc`, { method: 'POST' }),
};

// ── Exports ────────────────────────────────────────────────
export const exportApi = {
  generatePdf: (bookId: string) =>
    request<PublishingExport>(`/books/${bookId}/generate-pdf`, { method: 'POST' }),

  generateEpub: (bookId: string) =>
    request<PublishingExport>(`/books/${bookId}/generate-epub`, { method: 'POST' }),

  listExports: (bookId: string) =>
    request<PublishingExport[]>(`/books/${bookId}/exports`),
};

// ── AI Tools ───────────────────────────────────────────────
export const aiApi = {
  spellCheck: (bookId: string) =>
    request<{ suggestions: Array<{ text: string; issue: string; suggestion: string }> }>(
      `/books/${bookId}/ai-tools`,
      { method: 'POST', body: JSON.stringify({ action: 'spell_check' }) }
    ),

  generateSummary: (bookId: string) =>
    request<{ summary: string }>(`/books/${bookId}/ai-tools`, {
      method: 'POST',
      body: JSON.stringify({ action: 'summary' }),
    }),

  generateDescription: (bookId: string) =>
    request<{ description: string; promo: string; keywords: string[] }>(
      `/books/${bookId}/ai-tools`,
      { method: 'POST', body: JSON.stringify({ action: 'description' }) }
    ),

  unifyStyle: (bookId: string) =>
    request<{ suggestions: string[] }>(`/books/${bookId}/ai-tools`, {
      method: 'POST',
      body: JSON.stringify({ action: 'style_unify' }),
    }),
};
