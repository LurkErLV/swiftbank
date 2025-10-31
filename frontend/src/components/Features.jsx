import { motion } from "framer-motion";
import { fadeUp, stagger } from "../utils/anim";

export default function Features() {
  const list = [
    { title: "Instant Transfers", desc: "Send and receive money globally without delays." },
    { title: "Card Control", desc: "Freeze, unfreeze, and manage spending limits in one tap." },
    { title: "Smart Insights", desc: "Track spending patterns and plan budgets effortlessly." },
  ];

  return (
    <section className="py-24 container mx-auto px-6">
      <motion.h2 variants={fadeUp(0)} initial="hidden" whileInView="show" viewport={{once:true}}
        className="text-3xl font-semibold text-center mb-16">Everything your money deserves</motion.h2>

      <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={{once:true}}
        className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">

        {list.map((item, i) => (
          <motion.div key={i} variants={fadeUp(i*0.1)} className="p-8 rounded-xl border border-ui-border bg-ui-card backdrop-blur-md">
            <h3 className="text-xl font-medium mb-3">{item.title}</h3>
            <p className="text-ui-subtle leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
