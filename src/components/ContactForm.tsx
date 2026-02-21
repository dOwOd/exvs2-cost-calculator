/**
 * お問い合わせフォームコンポーネント
 *
 * ENABLE_CONTACT が false の場合は「準備中」メッセージを表示。
 * Turnstile によるボット対策、zod によるクライアントバリデーション付き。
 */

import { useState, useEffect, useRef } from 'preact/hooks';
import { ENABLE_CONTACT, TURNSTILE_SITE_KEY, ENABLE_TURNSTILE } from '../lib/contactConfig';
import { contactSchema, CONTACT_CATEGORIES } from '../lib/contactSchema';
import type { ContactFormData } from '../lib/contactSchema';
import { submitContact, getErrorMessage } from '../lib/contactApi';
import type { ContactErrorCode } from '../lib/contactApi';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

type FieldErrors = Partial<Record<keyof ContactFormData, string>>;

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    category: '' as ContactFormData['category'],
    message: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ENABLE_CONTACT || !ENABLE_TURNSTILE || !TURNSTILE_SITE_KEY) return;

    const scriptId = 'turnstile-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      if (turnstileContainerRef.current && window.turnstile) {
        turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => setTurnstileToken(token),
          'error-callback': () => setTurnstileToken(''),
          'expired-callback': () => setTurnstileToken(''),
        });
      }
    };
    document.head.appendChild(script);
  }, []);

  const updateField = <K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ContactFormData;
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    if (ENABLE_TURNSTILE && !turnstileToken) {
      setSubmitError('セキュリティ検証を完了してください。');
      setSubmitState('error');
      return;
    }

    setSubmitState('submitting');
    setSubmitError('');

    try {
      const response = await submitContact({ ...result.data, turnstileToken });
      if (response.success) {
        setSubmitState('success');
      } else {
        setSubmitError(getErrorMessage(response.error as ContactErrorCode));
        setSubmitState('error');
      }
    } catch {
      setSubmitError('送信に失敗しました。ネットワーク接続を確認して再度お試しください。');
      setSubmitState('error');
    }
  };

  if (!ENABLE_CONTACT) {
    return (
      <div
        class="text-center py-12 text-slate-600 dark:text-slate-400"
        data-testid="contact-disabled"
      >
        <p class="text-lg">問い合わせ機能は現在準備中です。</p>
        <p class="mt-2">今しばらくお待ちください。</p>
      </div>
    );
  }

  if (submitState === 'success') {
    return (
      <div class="text-center py-12" data-testid="contact-success">
        <div class="text-green-600 dark:text-green-400 text-lg font-semibold mb-2">
          お問い合わせを送信しました
        </div>
        <p class="text-slate-600 dark:text-slate-400">
          ご連絡ありがとうございます。内容を確認次第、対応いたします。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-6" data-testid="contact-form" noValidate>
      {/* お名前 */}
      <div>
        <label
          for="contact-name"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          お名前 <span class="text-red-500">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={formData.name}
          onInput={(e) => updateField('name', (e.target as HTMLInputElement).value)}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={100}
        />
        {fieldErrors.name && (
          <p id="contact-name-error" class="mt-1 text-sm text-red-500" role="alert">
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* メールアドレス */}
      <div>
        <label
          for="contact-email"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          メールアドレス（任意）
        </label>
        <input
          id="contact-email"
          type="email"
          value={formData.email}
          onInput={(e) => updateField('email', (e.target as HTMLInputElement).value)}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.email && (
          <p id="contact-email-error" class="mt-1 text-sm text-red-500" role="alert">
            {fieldErrors.email}
          </p>
        )}
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
          返信が必要な場合はご入力ください
        </p>
      </div>

      {/* カテゴリ */}
      <div>
        <label
          for="contact-category"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          カテゴリ <span class="text-red-500">*</span>
        </label>
        <select
          id="contact-category"
          value={formData.category}
          onChange={(e) =>
            updateField(
              'category',
              (e.target as HTMLSelectElement).value as ContactFormData['category'],
            )
          }
          aria-invalid={!!fieldErrors.category}
          aria-describedby={fieldErrors.category ? 'contact-category-error' : undefined}
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {CONTACT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {fieldErrors.category && (
          <p id="contact-category-error" class="mt-1 text-sm text-red-500" role="alert">
            {fieldErrors.category}
          </p>
        )}
      </div>

      {/* お問い合わせ内容 */}
      <div>
        <label
          for="contact-message"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          お問い合わせ内容 <span class="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          value={formData.message}
          onInput={(e) => updateField('message', (e.target as HTMLTextAreaElement).value)}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[160px]"
          maxLength={2000}
          rows={6}
        />
        <div class="flex justify-between mt-1">
          {fieldErrors.message ? (
            <p id="contact-message-error" class="text-sm text-red-500" role="alert">
              {fieldErrors.message}
            </p>
          ) : (
            <span />
          )}
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {formData.message.length}/2000
          </span>
        </div>
      </div>

      {/* Turnstile */}
      {ENABLE_TURNSTILE && TURNSTILE_SITE_KEY && (
        <div ref={turnstileContainerRef} data-testid="turnstile-container" />
      )}

      {/* エラーメッセージ */}
      {submitState === 'error' && submitError && (
        <div
          class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm"
          role="alert"
          data-testid="submit-error"
        >
          {submitError}
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={submitState === 'submitting'}
        class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center justify-center gap-2"
        data-testid="submit-button"
      >
        {submitState === 'submitting' ? (
          <>
            <svg
              class="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            送信中...
          </>
        ) : (
          '送信する'
        )}
      </button>
    </form>
  );
};
