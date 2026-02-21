import { z } from 'zod';

export const CONTACT_CATEGORIES = [
  { value: 'bug', label: '不具合報告' },
  { value: 'feature', label: '機能リクエスト' },
  { value: 'question', label: '質問' },
  { value: 'other', label: 'その他' },
] as const;

const categoryValues = CONTACT_CATEGORIES.map((c) => c.value);

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'お名前を入力してください')
    .max(100, 'お名前は100文字以内で入力してください'),
  email: z
    .string()
    .transform((v) => (v === '' ? undefined : v))
    .pipe(z.string().email('メールアドレスの形式が正しくありません').optional()),
  category: z.enum(categoryValues as unknown as [string, ...string[]], {
    message: 'カテゴリを選択してください',
  }),
  message: z
    .string()
    .min(1, 'お問い合わせ内容を入力してください')
    .max(2000, 'お問い合わせ内容は2000文字以内で入力してください'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
