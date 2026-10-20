export function validateStrongPassword(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 100) return "Use no more than 100 characters.";
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Add at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Add at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Add at least one special character.";
  return null;
}
