export const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ?? "junginaha@gmail.com,kimjungin@quesapience.com"
).split(",").map((e) => e.trim());

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
