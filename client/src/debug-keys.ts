export function initKeyErrorDebugger() {
  if (typeof window === 'undefined') return;
  const originalError = console.error;
  let errorCount = 0;
  console.error = function(...args: any[]) {
    const msg = String(args[0] || '');
    if (msg.includes('same key')) {
      errorCount++;
      console.log(`\n🔴 KEY ERROR #${errorCount}`);
      console.log('Message:', msg);
      console.trace();
    }
    originalError.apply(console, args);
  };
}
