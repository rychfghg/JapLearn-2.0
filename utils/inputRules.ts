// Plain-text rules for sign-up, login and password screens. The server applies the same
// rules (TextInput / EmailInput), so these checks only give instant, friendly feedback.

export const NAME_RULE = 'Use letters only. Emojis, numbers and symbols are not allowed.';
export const PASSWORD_RULE = 'Use letters, numbers and keyboard symbols only. Emojis are not allowed.';
export const EMAIL_RULE = 'Emails can only use letters, numbers and . _ % + - characters.';

// Unicode letter classes need the `u` flag; fall back to a blocklist if an engine lacks it.
const makeRegex = (source: string, flags: string, fallback: RegExp) => {
  try { return new RegExp(source, flags); } catch { return fallback; }
};
// Characters that are never part of a name: emojis (surrogate pairs), pictographs, joiners,
// variation selectors, keycaps, digits and symbols.
const NOT_NAME_FALLBACK = new RegExp('[\\uD800-\\uDFFF\\u200B-\\u200F\\u2028-\\u202F\\u2060-\\u206F\\uFE00-\\uFE0F\\u20E3\\u2190-\\u2BFF\\u3297\\u3299\\u00A9\\u00AE0-9!@#$%^&*()_+=\\[\\]{}<>\\\\/|;:"`~?,]', 'g');
const NOT_NAME = makeRegex("[^\\p{L}\\p{M} .'’\\-・]", 'gu', NOT_NAME_FALLBACK);
const NAME = makeRegex("^[\\p{L}\\p{M}](?:[\\p{L}\\p{M} .'’\\-・]{0,58}[\\p{L}\\p{M}.])?$", 'u', /^(?!.*[\uD800-\uDFFF0-9!@#$%^&*()_+=[\]{}<>\\/|;:"`~?,]).{1,60}$/);

/** Removes anything that cannot be part of a name. `removed` is true when something was dropped. */
export const cleanNameInput = (text: string) => {
  const value = text.replace(NOT_NAME, '').replace(/^\s+/, '').replace(/\s+/g, ' ');
  return { value, removed: value.length < text.replace(/^\s+/, '').replace(/\s+/g, ' ').length };
};
export const isValidName = (value: string) => NAME.test(value.trim().replace(/\s+/g, ' '));

/** Passwords: printable keyboard characters only (no emojis, accents or spaces in this app). */
export const cleanPasswordInput = (text: string) => {
  const value = text.replace(/[^\x21-\x7E]/g, '');
  return { value, removed: value.length < text.length };
};
export const isValidPasswordChars = (value: string) => /^[\x21-\x7E]*$/.test(value);

/** Emails: the same safe characters the server accepts. */
export const cleanEmailInput = (text: string) => {
  const lower = text.toLowerCase();
  const value = lower.replace(/[^a-z0-9._%+\-@]/g, '');
  return { value, removed: value.length < lower.replace(/\s/g, '').length };
};
export const isStrictEmail = (value: string) =>
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}$/.test(value) && !value.includes('..');
