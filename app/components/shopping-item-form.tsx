'use client';

import { useEffect, useRef, useState } from "react";

type ProductSuggestion = {
  id: string;
  name: string;
  normalizedName: string;
  updatedAt: string;
};

type ShoppingItemFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  shareCode: string;
};

const DEBOUNCE_MS = 250;

export function ShoppingItemForm({
  action,
  shareCode,
}: ShoppingItemFormProps) {
  const [name, setName] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const inputId = "shopping-item-name";
  const suggestionsId = "shopping-item-suggestions";

  useEffect(() => {
    const query = name.trim();

    if (query.length < 2) {
      abortRef.current?.abort();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const controller = new AbortController();
      abortRef.current?.abort();
      abortRef.current = controller;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoading(true);

      fetch(
        `/api/lists/${encodeURIComponent(shareCode)}/product-suggestions?q=${encodeURIComponent(query)}`,
        { signal: controller.signal },
      )
        .then(async (response) => {
          if (!response.ok) {
            return { suggestions: [] as ProductSuggestion[] };
          }

          return (await response.json()) as {
            suggestions?: ProductSuggestion[];
          };
        })
        .then((data) => {
          if (requestIdRef.current !== requestId) {
            return;
          }

          setSuggestions(data.suggestions ?? []);
          setActiveIndex(data.suggestions?.length ? 0 : -1);
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }

          if (requestIdRef.current === requestId) {
            setSuggestions([]);
          }
        })
        .finally(() => {
          if (requestIdRef.current === requestId) {
            setIsLoading(false);
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [name, shareCode]);

  function handlePickSuggestion(value: string) {
    setName(value);
    setSuggestions([]);
    setActiveIndex(-1);
  }

  function handleSubmit() {
    setSuggestions([]);
    setIsLoading(false);
    setActiveIndex(-1);
    requestIdRef.current += 1;
    abortRef.current?.abort();
    setName("");
  }

  const query = name.trim();
  const visibleSuggestions = query.length >= 2 ? suggestions : [];
  const showLoading = query.length >= 2 && isLoading;

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!visibleSuggestions.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        current < 0 ? 0 : (current + 1) % visibleSuggestions.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0
          ? visibleSuggestions.length - 1
          : (current - 1) % visibleSuggestions.length,
      );
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      handlePickSuggestion(visibleSuggestions[activeIndex]?.name ?? name);
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          name="name"
          id={inputId}
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
          placeholder="Leche, arroz, jabon, cafe..."
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={suggestionsId}
          aria-activedescendant={
            activeIndex >= 0 ? `${suggestionsId}-${activeIndex}` : undefined
          }
        />
        <button
          type="submit"
          className="rounded-2xl bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--background)] transition hover:-translate-y-0.5"
        >
          Agregar
        </button>
      </div>

      <div className="space-y-2">
        {visibleSuggestions.length > 0 ? (
          <div
            id={suggestionsId}
            role="listbox"
            aria-label="Sugerencias de productos"
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-2"
          >
            <p className="px-2 py-1 text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Sugerencias
            </p>
            <div className="space-y-2">
              {visibleSuggestions.map((suggestion, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={suggestion.id}
                    id={`${suggestionsId}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handlePickSuggestion(suggestion.name)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-[color:var(--accent)] bg-[color:var(--surface)]"
                        : "border-transparent hover:border-[color:var(--border)] hover:bg-[color:var(--surface)]"
                    }`}
                  >
                    <span className="text-sm font-medium text-[color:var(--foreground)]">
                      {suggestion.name}
                    </span>
                    <span className="text-xs text-[color:var(--muted)]">
                      Usar
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <p className="text-xs leading-5 text-[color:var(--muted)]">
          Podes escribir libremente; las sugerencias son opcionales y nunca
          bloquean el alta.
          {showLoading ? " Buscando coincidencias..." : ""}
        </p>
      </div>
    </form>
  );
}
