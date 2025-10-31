export default function Pricing() {
  const tiers = [
    { name: "Standard", price: "$0/mo", perks: ["Online payments", "Instant transfers"] },
    { name: "Premium", price: "$5/mo", perks: ["ATM withdraws","Priority support"] },
  ];

  return (
    <section className="py-24 container mx-auto px-6 text-center">
      <h2 className="text-3xl font-semibold mb-10">Simple pricing</h2>
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        {tiers.map((t,i)=>(
          <div key={i} className="p-8 rounded-xl border border-ui-border bg-ui-card backdrop-blur-md w-64">
            <h3 className="text-xl font-medium">{t.name}</h3>
            <div className="text-3xl font-semibold mt-4 mb-6">{t.price}</div>
            <ul className="text-ui-subtle space-y-1 mb-6">
              {t.perks.map((p,idx)=><li key={idx}>{p}</li>)}
            </ul>
            <a href="/login?tab=register" className="block px-4 py-2 rounded-xl bg-accent font-medium">Get started</a>
          </div>
        ))}
      </div>
    </section>
  );
}
