// A tiny tagged template for writing HTML in plain JavaScript.
//
//   html`<p>${userText}</p>`   escapes userText
//   html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`   nests and joins arrays
//   html`<div>${raw(renderedMarkdown)}</div>`   trusts already-rendered HTML
//
// Anything produced by html`` or raw() is "safe" and won't be escaped twice.

class SafeHTML {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

export const raw = (value) => new SafeHTML(String(value ?? ''));

export const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

function serialize(value) {
  if (value == null || value === false) return '';
  if (value instanceof SafeHTML) return value.value;
  if (Array.isArray(value)) return value.map(serialize).join('');
  return escape(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, i) => {
    out += serialize(value) + strings[i + 1];
  });
  return new SafeHTML(out);
}
