import { updateParticipantName } from "@/app/actions";

type ParticipantCardProps = {
  label: string;
  shareCode?: string;
  heading?: string;
  helperText?: string;
  compact?: boolean;
  id?: string;
};

export function ParticipantCard({
  label,
  shareCode,
  heading = "Tu nombre",
  helperText = "Editalo para que el grupo te reconozca mejor.",
  compact = false,
  id,
}: ParticipantCardProps) {
  const cardClasses = compact
    ? "rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow)]"
    : "rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]";
  const titleClasses = compact
    ? "mt-2 font-display text-2xl text-[color:var(--foreground)]"
    : "mt-2 font-display text-3xl text-[color:var(--foreground)]";
  const helperClasses = compact
    ? "mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]"
    : "mt-3 max-w-md text-sm leading-6 text-[color:var(--muted)]";
  const formClasses = compact
    ? "mt-4 flex flex-col gap-3"
    : "mt-5 flex flex-col gap-3 sm:flex-row";
  const inputClasses = compact
    ? "min-w-0 flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
    : "min-w-0 flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]";
  const buttonClasses = compact
    ? "rounded-2xl bg-[color:var(--foreground)] px-4 py-2.5 text-sm font-semibold text-[color:var(--background)] transition hover:-translate-y-0.5"
    : "rounded-2xl bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--background)] transition hover:-translate-y-0.5";

  return (
    <section id={id} className={cardClasses}>
      <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
        {heading}
      </p>
      <h2 className={titleClasses}>
        {label}
      </h2>
      <p className={helperClasses}>
        {helperText}
      </p>

      <form action={updateParticipantName} className={formClasses}>
        {shareCode ? (
          <input type="hidden" name="shareCode" value={shareCode} />
        ) : null}
        <input
          type="text"
          name="label"
          required
          maxLength={60}
          defaultValue={label}
          className={inputClasses}
          placeholder="Invitado"
        />
        <button
          type="submit"
          className={buttonClasses}
        >
          Guardar nombre
        </button>
      </form>
    </section>
  );
}
