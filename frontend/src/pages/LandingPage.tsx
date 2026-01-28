import React from 'react';
import { Link } from 'react-router-dom';
import { motion, animate } from 'framer-motion';
import { Search, Shield, Zap, Lock } from 'lucide-react';

// CountUp Animation Component
const CountUp = ({ to, duration = 2 }: { to: number, duration?: number }) => {
    const nodeRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(0, to, {
            duration,
            onUpdate(value) {
                node.textContent = Math.round(value).toLocaleString();
            },
            ease: "easeOut"
        });

        return () => controls.stop();
    }, [to, duration]);

    return <div ref={nodeRef} className="text-6xl md:text-7xl font-black text-brand-dark mb-2 font-display" />;
};

// Floating Sticker Component
const FloatingSticker = ({ text, color, className, delay = 0 }: { text: string, color: string, className?: string, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
            opacity: 1,
            scale: 1,
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0]
        }}
        transition={{
            opacity: { duration: 0.5, delay },
            scale: { duration: 0.5, delay, ease: [0.2, 0.0, 0.0, 1.0] },
            y: { duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 7 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className={`absolute px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm border border-black/5 z-20 ${className}`}
        style={{ backgroundColor: color }}
    >
        {text}
    </motion.div>
);

// Feature Section Component
const FeatureSection = ({ title, bg, children, align = "left" }: { title: string, bg: string, children: React.ReactNode, align?: "left" | "right" }) => (
    <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.05, 0.7, 0.1, 1.0] }}
        className={`py-24 rounded-[3rem] mx-4 mb-8 overflow-hidden relative ${bg}`}
    >
        <div className="container mx-auto px-12 md:px-24">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-brand-dark mb-12 max-w-xl">
                {title}
            </h2>
            <div className={`flex flex-col md:flex-row gap-12 items-center ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
                {children}
            </div>
        </div>
    </motion.section>
);

export default function LandingPage() {
    return (
        <div className="relative bg-background min-h-screen overflow-hidden">

            {/* Decorative Floating Stickers */}
            <FloatingSticker text="alice.eth" color="#E0F2FE" className="top-32 left-[10%]" delay={0.2} />
            <FloatingSticker text="vitalik.eth" color="#FCE7F3" className="top-40 right-[15%]" delay={0.4} />
            <FloatingSticker text="zkproof.eth" color="#D1FAE5" className="top-[60%] left-[5%]" delay={0.6} />
            <FloatingSticker text="privacy.eth" color="#FEF3C7" className="top-[70%] right-[10%]" delay={0.8} />

            {/* Hero Section */}
            <section className="relative z-10 container mx-auto px-6 pt-32 pb-24 text-center">

                {/* Hero Content */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.05, 0.7, 0.1, 1.0] }}
                    className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-[1.1]"
                >
                    Welcome to the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#4F46E5]">
                        New Privacy
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.05, 0.7, 0.1, 1.0] }}
                    className="text-lg md:text-xl text-slate-500 mb-12 font-medium max-w-2xl mx-auto"
                >
                    Selective disclosure execution for Uniswap v4. <br />
                    <strong className="text-brand-dark">Hide the trade. Anchor the name.</strong>
                </motion.p>

                {/* Hero Search */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.05, 0.7, 0.1, 1.0] }}
                    className="max-w-2xl mx-auto mb-12"
                >
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="alice.eth"
                            className="w-full px-8 py-6 text-xl font-bold border-2 border-slate-200 rounded-2xl focus:border-brand-blue focus:outline-none transition-all shadow-sm group-hover:shadow-md bg-white/80 backdrop-blur-sm"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand-blue/30 flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Claim Context
                        </button>
                    </div>
                </motion.div>

            </section>

            {/* Feature 1: Blue - Selective Disclosure */}
            <FeatureSection title="Privacy Without Anonymity" bg="bg-pastel-blue">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1.0] }}
                    className="flex-1"
                >
                    <Shield className="w-16 h-16 text-brand-blue mb-6" />
                    <p className="text-lg leading-relaxed text-slate-700">
                        Your ENS name proves eligibility — not your entire history. <strong>Selective disclosure</strong> means you reveal only what's necessary: your tier, not your score. Your right to trade, not your strategy.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.05, 0.7, 0.1, 1.0] }}
                    className="flex-1 bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-blue-100"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                            <span className="font-bold text-brand-dark">Prove tier ≥ Trusted</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                            <span className="font-bold text-brand-dark">Hide transaction intent</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                            <span className="font-bold text-brand-dark">Preserve verifiability</span>
                        </div>
                    </div>
                </motion.div>
            </FeatureSection>

            {/* Feature 2: Pink - Context Registry */}
            <FeatureSection title="ENS Context-Gated Execution" bg="bg-pastel-pink" align="right">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1.0] }}
                    className="flex-1"
                >
                    <Zap className="w-16 h-16 text-pink-600 mb-6" />
                    <p className="text-lg leading-relaxed text-slate-700">
                        Your ENS name isn't just identity — it's <strong>context</strong>. Hyde reads onchain signals: transaction history, DAO participation, token holdings. You don't reveal them. You just prove: "I'm eligible."
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.05, 0.7, 0.1, 1.0] }}
                    className="flex-1 bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-pink-100"
                >
                    <div className="text-5xl font-black text-brand-dark mb-3">3 Tiers</div>
                    <div className="space-y-2 text-slate-600">
                        <div>🥉 <strong>Standard</strong> — Basic access</div>
                        <div>🥈 <strong>Trusted</strong> — Privacy-enhanced execution</div>
                        <div>🥇 <strong>Elite</strong> — Premium pool access</div>
                    </div>
                </motion.div>
            </FeatureSection>

            {/* Feature 3: Green - Hook Layer */}
            <FeatureSection title="Uniswap v4 Hook, Not a New DEX" bg="bg-pastel-green">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1.0] }}
                    className="flex-1"
                >
                    <Lock className="w-16 h-16 text-green-600 mb-6" />
                    <p className="text-lg leading-relaxed text-slate-700">
                        Hyde doesn't replace Uniswap. It <strong>protects it</strong>. By running as a v4 Hook, Hyde enforces tier checks, cooldowns, and anti-bot constraints — before every swap. No bootstrapping. No new liquidity. Just better execution.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.05, 0.7, 0.1, 1.0] }}
                    className="flex-1 bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-green-100"
                >
                    <div className="font-mono text-sm text-slate-600 space-y-2">
                        <div>→ beforeSwap() enforces tier</div>
                        <div>→ Context registry validates</div>
                        <div>→ Swap executes with privacy</div>
                        <div className="pt-4 text-green-700 font-bold">✓ Seamless Uniswap integration</div>
                    </div>
                </motion.div>
            </FeatureSection>

            {/* Footer Stats */}
            <section className="py-32 container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.05, 0.7, 0.1, 1.0] }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl font-black text-brand-dark mb-4">
                        Privacy That Scales
                    </h2>
                    <p className="text-xl text-slate-600">
                        Selective disclosure for the entire Uniswap ecosystem
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-slate-200 pt-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <CountUp to={662304} />
                        <div className="text-xl font-bold text-slate-400">ENS Names Eligible</div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <CountUp to={100} />
                        <div className="text-xl font-bold text-slate-400">Privacy-Enhanced Pools</div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="text-6xl md:text-7xl font-black text-brand-dark mb-2 font-display">0%</div>
                        <div className="text-xl font-bold text-slate-400">Sandwich Attacks</div>
                    </motion.div>
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-24 text-center"
                >
                    <div className="bg-gradient-to-br from-pastel-blue via-pastel-pink to-pastel-green p-1 rounded-3xl inline-block">
                        <div className="bg-white rounded-[1.4rem] px-12 py-8">
                            <h3 className="text-3xl font-black text-brand-dark mb-4">
                                Ready to trade with privacy?
                            </h3>
                            <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                                Connect your ENS name and unlock selective disclosure execution on Uniswap v4.
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <a href="#" className="text-sm font-bold text-slate-600 hover:text-brand-blue transition-colors">
                                    About
                                </a>
                                <a href="#" className="text-sm font-bold text-slate-600 hover:text-brand-blue transition-colors">
                                    Blog
                                </a>
                                <a href="#" className="text-sm font-bold text-slate-600 hover:text-brand-blue transition-colors">
                                    Docs
                                </a>
                            </div>
                            <div className="mt-6">
                                <Link to="/app" className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-dark transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-blue/30 inline-block">
                                    Launch App
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

        </div>
    );
}
