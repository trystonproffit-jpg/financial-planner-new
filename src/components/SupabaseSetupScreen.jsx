function SupabaseSetupScreen() {
  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="hero-panel w-full">
          <span className="eyebrow">Setup required</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Connect Supabase to enable Ledgr login and saved data.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Ledgr uses a Supabase project for authentication and saved user data. Add your project URL and anon
            key to a local environment file, then run the SQL schema included in the repo.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="panel">
              <h2 className="panel-title">1. Add environment variables</h2>
              <pre className="code-block">{`VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key`}</pre>
            </div>

            <div className="panel">
              <h2 className="panel-title">2. Run the database schema</h2>
              <p className="panel-subtitle">
                Use the SQL in <code>supabase/schema.sql</code> to create the Ledgr profile table and row-level security
                policies.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SupabaseSetupScreen;
