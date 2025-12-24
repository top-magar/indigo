"use client";

import { useState, useCallback, type ChangeEvent } from "react";

interface UseCharacterLimitOptions {
  maxLength: number;
  initialValue?: string;
}

interface UseCharacterLimitReturn {
  value: string;
  setValue: (value: string) => void;
  characterCount: number;
  maxLength: number;
  isAtLimit: boolean;
  isNearLimit: boolean;
  remainingCharacters: number;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function useCharacterLimit({
  maxLength,
  initialValue = "",
}: UseCharacterLimitOptions): UseCharacterLimitReturn {
  const [value, setValue] = useState(initialValue.slice(0, maxLength));

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= maxLength) {
        setValue(newValue);
      }
    },
    [maxLength]
  );

  const characterCount = value.length;
  const remainingCharacters = maxLength - characterCount;
  const isAtLimit = characterCount >= maxLength;
  const isNearLimit = remainingCharacters <= Math.ceil(maxLength * 0.1); // 10% threshold

  return {
    value,
    setValue: (newValue: string) => setValue(newValue.slice(0, maxLength)),
    characterCount,
    maxLength,
    isAtLimit,
    isNearLimit,
    remainingCharacters,
    handleChange,
  };
}
