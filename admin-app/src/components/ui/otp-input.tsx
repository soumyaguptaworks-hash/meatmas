import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  hasError = false,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  function focusIndex(i: number) {
    inputRefs.current[Math.max(0, Math.min(i, length - 1))]?.focus();
  }

  function handleChange(index: number, char: string) {
    if (!/^\d*$/.test(char)) return; // digits only
    const next = digits.slice();
    next[index] = char.slice(-1); // take last char if somehow multiple
    onChange(next.join(''));
    if (char && index < length - 1) focusIndex(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // clear current cell
        const next = digits.slice();
        next[index] = '';
        onChange(next.join(''));
      } else {
        // move back and clear previous
        const next = digits.slice();
        next[index - 1] = '';
        onChange(next.join(''));
        focusIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      focusIndex(index - 1);
    } else if (e.key === 'ArrowRight') {
      focusIndex(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted.padEnd(length, '').slice(0, length).replace(/ /g, ''));
    onChange(pasted); // just the real digits, no padding
    focusIndex(Math.min(pasted.length, length - 1));
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
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
            'h-12 w-10 rounded-md border text-center text-lg font-bold',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors',
            hasError
              ? 'border-destructive text-destructive focus-visible:ring-destructive'
              : 'border-input bg-background',
          )}
        />
      ))}
    </div>
  );
}
