import { CONTACT_API_URL } from './contactConfig';
import type { ContactFormData } from './contactSchema';

export type ContactSuccessResponse = {
  success: true;
};

export type ContactErrorCode =
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'TURNSTILE_FAILED'
  | 'UNKNOWN_ORIGIN';

export type ContactErrorResponse = {
  success: false;
  error: ContactErrorCode;
};

export type ContactResponse = ContactSuccessResponse | ContactErrorResponse;

const ERROR_MESSAGES: Record<ContactErrorCode, string> = {
  VALIDATION_ERROR: '入力内容に不備があります。内容を確認して再度お試しください。',
  RATE_LIMITED: '送信回数の上限に達しました。しばらく時間をおいてからお試しください。',
  TURNSTILE_FAILED: 'セキュリティ検証に失敗しました。ページを再読み込みしてお試しください。',
  UNKNOWN_ORIGIN: '不正なリクエスト元です。正しいURLからアクセスしてください。',
};

export const getErrorMessage = (code: ContactErrorCode): string => {
  return ERROR_MESSAGES[code];
};

export const submitContact = async (
  data: ContactFormData & { turnstileToken: string },
): Promise<ContactResponse> => {
  const response = await fetch(CONTACT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = (await response.json()) as ContactResponse;
  return json;
};
