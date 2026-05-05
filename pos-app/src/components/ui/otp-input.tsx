import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps { value: string; onChange: (v: string) => void; length?: number; disabled?: boolean; hasError?: boolean; }

export function OtpInput({ value, onChange, length = 6, disabled = false, hasError = false }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);
  const focus = (i: number) => refs.current[Math.max(0, Math.min(i, length - 1))]?.focus();

  function handleChange(i: number, ch: string) {
    if (!/^\d*$/.test(ch)) return;
    const n = [...digits]; n[i] = ch.slice(-1); onChange(n.join(''));
    if (ch && i < length - 1) focus(i + 1);
  }
  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      const n = [...digits];
      if (n[i]) { n[i] = ''; onChange(n.join('')); }
      else { n[i-1] = ''; onChange(n.join('')); focus(i - 1); }
    } else if (e.key === 'ArrowLeft') focus(i - 1);
    else if (e.key === 'ArrowRight') focus(i + 1);
  }
  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(p); focus(Math.min(p.length, length - 1));
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={d}
          disabled={disabled} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste} onFocus={(e) => e.target.select()}
          className={cn('h-12 w-10 rounded-lg border text-center text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
            hasError ? 'border-destructive text-destructive' : 'border-input bg-background')} />
      ))}
    </div>
  );
}
