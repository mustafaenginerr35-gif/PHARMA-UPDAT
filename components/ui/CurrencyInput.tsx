import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { formatNumberWithCommas, parseFormattedNumber } from '@/src/lib/formatters';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  className?: string;
  name?: string;
}

export const CurrencyInput = ({ 
  value, 
  defaultValue, 
  onChange, 
  className, 
  name,
  ...props 
}: CurrencyInputProps) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    const initial = value !== undefined ? value : (defaultValue !== undefined ? defaultValue : '');
    return initial !== '' ? formatNumberWithCommas(initial.toString()) : '';
  });

  useEffect(() => {
    if (value !== undefined) {
      const formatted = formatNumberWithCommas(value);
      if (parseFormattedNumber(formatted) !== parseFormattedNumber(displayValue)) {
        setDisplayValue(formatted);
      }
    }
  }, [value, displayValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatNumberWithCommas(rawValue);
    setDisplayValue(formattedValue);
    
    if (onChange) {
      onChange(parseFormattedNumber(formattedValue));
    }
  };

  return (
    <>
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={className}
        autoComplete="off"
      />
      {/* Hidden input to ensure form submissions get the raw number if needed */}
      <input type="hidden" name={name} value={parseFormattedNumber(displayValue)} />
    </>
  );
};
