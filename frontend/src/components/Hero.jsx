import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../utils/anim'

export default function Hero(){
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brandStart/30 to-brandEnd/20 blur-3xl -z-10"></div>
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={{once:true}}>
          <motion.h1 variants={fadeUp(0)} className="text-5xl font-extrabold">
            Modern banking,<br/>reimagined.
          </motion.h1>
          <motion.p variants={fadeUp(0.1)} className="mt-4 text-white/75 max-w-md">
            SwiftBank gives you financial freedom with seamless transfers, modern security and a beautiful experience.
          </motion.p>
          <motion.div variants={fadeUp(0.2)} className="mt-8 flex gap-3">
            <a href="/login?tab=register" className="px-5 py-3 rounded-xl  bg-ui-surface font-semibold ">Get started</a>
            <a href="#features" className="px-5 py-3 rounded-xl border border-white/20 hover:border-white/40">Learn more</a>
          </motion.div>
        </motion.div>
        <motion.div variants={fadeUp(0.2)} initial="hidden" whileInView="show" viewport={{once:true}}>
          <img src="/images/swiftbank-card.png" className="rounded-3xl  mx-auto" />
        </motion.div>
      </div>
    </section>
  )
}
