interface SectionProps {
  title: string
  children: React.ReactNode
}

/** Labelled section wrapper with a small-caps heading. */
export function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        {title}
      </h2>
      {children}
    </section>
  )
}
