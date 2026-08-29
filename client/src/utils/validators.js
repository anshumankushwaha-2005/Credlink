export function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email || '');
}

export function isValidPhone(phone) {
  return /^\+?\d{10,13}$/.test((phone || '').replace(/[\s-]/g, ''));
}
