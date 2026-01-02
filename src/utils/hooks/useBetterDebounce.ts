import { useEffect, useRef, useState } from "react";

export default function useBetterDebounce<T>(initialValue: T, delay: number) {
    const [value, setValue] = useState<T>(initialValue);
    const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Очищаем предыдущий таймаут
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Устанавливаем новый таймаут
        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Очистка при размонтировании
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [JSON.stringify(value), delay]);

    return [debouncedValue, setValue, value, setDebouncedValue] as const;
}