import { useState, useEffect } from "react";

export const debounce = (func, delay) => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(), delay);
  };
};

export const useDebounce = (cb, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(cb);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(cb);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [cb, delay]);

  return debouncedValue;
};
