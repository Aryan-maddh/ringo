'use client';

import { RINGO } from './tokens';

interface FieldProps {
  label: string;
  value?: string;
  hint?: string;
  type?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Field({ label, value, hint, type = 'text', placeholder, onChange }: FieldProps) {
  const inputProps = onChange
    ? { value: value ?? '', onChange }
    : { defaultValue: value };
  return (
    <div>
      <label style={{ fontSize: 12, color: RINGO.ink2, fontWeight: 600, marginBottom: 6, display: 'block' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...inputProps}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10,
          border: `1px solid ${RINGO.border}`, fontFamily: RINGO.font.ui,
          fontSize: 14, color: RINGO.ink, outline: 'none', background: '#fff',
          boxSizing: 'border-box',
        }}
      />
      {hint && <div style={{ fontSize: 11.5, color: RINGO.ink3, marginTop: 6 }}>{hint}</div>}
    </div>
  );
}
