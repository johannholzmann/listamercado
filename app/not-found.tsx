import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-20">
      <section className="max-w-lg rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-8 text-center shadow-[var(--shadow)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted)]">
          Lista no encontrada
        </p>
        <h1 className="mt-4 font-display text-4xl text-[color:var(--foreground)]">
          Ese enlace no apunta a una lista activa.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
          Puede ser un enlace viejo o un codigo incompleto. Desde aca podes crear
          una lista nueva y volver a compartirla.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
        >
          Ir al inicio
        </Link>
      </section>
    </main>
  );
}
