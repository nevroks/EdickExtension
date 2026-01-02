import { useEffect, useState } from "react";

export default function useBetterDebounce<T>(initialValue: T, delay: number) {
    const [value, setValue] = useState<T>(initialValue);
    const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [JSON.stringify(value), delay]);

    return [debouncedValue, setDebouncedValue, value, setValue] as const;
}