import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
}

export function OtpInput({ value, onChange, length = 6, disabled = false, hasError = false }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const focus = (i: number) => refs.current[Math.max(0, Math.min(i, length - 1))]?.focus();

  function handleChange(index: number, char: string) {
    if (!/^\d*$/.test(char)) return;
    const next = [...digits];
    next[index] = char.slice(-1);
    onChange(next.join(''));
    if (char && index < length - 1) focus(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (next[index]) { next[index] = ''; onChange(next.join('')); }
      else { next[index - 1] = ''; onChange(next.join('')); focus(index - 1); }
    } else if (e.key === 'ArrowLeft') focus(index - 1);
    else if (e.key === 'ArrowRight') focus(index + 1);
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    focus(Math.min(pasted.length, length - 1));
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-13 w-11 rounded-xl border text-center text-xl font-bold',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:opacity-50',
            hasError ? 'border-destructive text-destructive' : 'border-input bg-background',
          )}
        />
      ))}
    </div>
  );
}
