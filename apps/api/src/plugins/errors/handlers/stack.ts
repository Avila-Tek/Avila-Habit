import { Exception } from './exception';

const normalizedRoot = (() => {
  const cwd = process.cwd().replace(/\\/g, '/');
  const suffix = '/apps/api';
  return cwd.toLowerCase().endsWith(suffix)
    ? cwd.slice(0, -suffix.length)
    : cwd;
})();
const normalizedRootLower = normalizedRoot.toLowerCase();

export function generateCleanStackTrace(error: Exception | Error): string[] {
  const stack = error.stack?.split('\n');
  if (!stack) return [];

  return stack.map((line, index) => {
    const trimmed = line.trim();
    if (index === 0) return trimmed;

    const withoutAt = trimmed.startsWith('at ') ? trimmed.slice(3) : trimmed;
    if (!normalizedRoot) return withoutAt;

    const normalizedLine = withoutAt.replace(/\\/g, '/');
    const rootIndex = normalizedLine.toLowerCase().indexOf(normalizedRootLower);
    if (rootIndex === -1) return withoutAt;

    return (
      normalizedLine.slice(0, rootIndex) +
      normalizedLine.slice(rootIndex + normalizedRoot.length)
    );
  });
}
