#!/usr/bin/env node
// apply-patch.js
// Run from your bible-commentary repo root:
//   node apply-patch.js
// Then: git add index.html && git commit -m "sort quotes by chapter:verse" && git push

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// ── Patch 1: wrap quotes array with sortQuotesByRef() ──────────────────────
const OLD_FOREACH = '    (d.quotes || []).forEach(q => {';
const NEW_FOREACH = '    sortQuotesByRef(d.quotes || []).forEach(q => {';

if (!content.includes(OLD_FOREACH)) {
  // Already patched or something changed
  if (content.includes(NEW_FOREACH)) {
    console.log('✅ Patch 1 already applied — quotes forEach is already sorted.');
  } else {
    console.error('❌ Patch 1 target not found. Check index.html manually.');
    process.exit(1);
  }
} else {
  content = content.replace(OLD_FOREACH, NEW_FOREACH);
  console.log('✅ Patch 1 applied — quotes now call sortQuotesByRef()');
}

// ── Patch 2: insert sortQuotesByRef function before esc() ──────────────────
const OLD_ESC = `function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }`;
const NEW_BLOCK = `function sortQuotesByRef(quotes) {
  return [...quotes].sort((a, b) => {
    const parse = ref => {
      const part = (ref || '').trim().split(' ').pop();
      const [ch, v] = part.split(':').map(Number);
      return (ch || 0) * 1000 + (v || 0);
    };
    return parse(a.ref) - parse(b.ref);
  });
}

function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }`;

if (!content.includes(OLD_ESC)) {
  if (content.includes('function sortQuotesByRef')) {
    console.log('✅ Patch 2 already applied — sortQuotesByRef function exists.');
  } else {
    console.error('❌ Patch 2 target not found. Check index.html manually.');
    process.exit(1);
  }
} else {
  content = content.replace(OLD_ESC, NEW_BLOCK);
  console.log('✅ Patch 2 applied — sortQuotesByRef function added.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n🎉 index.html patched successfully.\n');
console.log('Next steps:');
console.log('  git add index.html');
console.log('  git commit -m "sort quotes by chapter:verse"');
console.log('  git push');
