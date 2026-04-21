import { updateParticipantName } from "@/app/actions";

type ParticipantCardProps = {
  label: string;
  shareCode?: string;
  heading?: string;
  helperText?: string;
};

export function ParticipantCard({
  label,
  shareCode,
  heading = "Tu nombre",
  helperText = "Editalo para que el grupo te reconozca mejor.",
}: ParticipantCardProps) {
  return (
    <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
      <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
        {heading}
      </p>
      <h2 className="mt-2 font-display text-3xl text-[color:var(--foreground)]">
        {label}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-[color:var(--muted)]">
        {helperText}
      </p>

      <form action={updateParticipantName} className="mt-5 flex flex-col gap-3 sm:flex-row">
        {shareCode ? (
          <input type="hidden" name="shareCode" value={shareCode} />
        ) : null}
        <input
          type="text"
          name="label"
          required
          maxLength={60}
          defaultValue={label}
          className="min-w-0 flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
          placeholder="Invitado"
        />
        <button
          type="submit"
          className="rounded-2xl bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--background)] transition hover:-translate-y-0.5"
        >
          Guardar nombre
        </button>
      </form>
    </section>
  );
}
