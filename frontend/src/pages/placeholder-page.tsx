type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
        This module is ready for its planned implementation phase.
      </div>
    </section>
  );
}
