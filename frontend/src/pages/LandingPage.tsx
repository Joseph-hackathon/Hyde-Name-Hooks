import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Shield, Sparkles, Users, Wallet } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../components/ui/Button';

export default function LandingPage() {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            gsap.from('.gsap-hero-line', {
                y: 24,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out',
                stagger: 0.12,
                immediateRender: false,
                clearProps: 'transform,opacity',
            });

            gsap.utils.toArray<HTMLElement>('.gsap-card:not(.gsap-card-item)').forEach((card) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%',
                    },
                    y: 26,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    immediateRender: false,
                    clearProps: 'transform,opacity',
                });
            });

            const cardItems = gsap.utils.toArray<HTMLElement>('.gsap-card-item');
            const yOffsets = gsap.utils.wrap([-18, -10, -4, 6, 14]);
            const delays = gsap.utils.wrap([0, 0.04, 0.08, 0.12]);
            cardItems.forEach((card, index) => {
                gsap.set(card, { y: yOffsets(index) });
                gsap.fromTo(
                    card,
                    { autoAlpha: 0, y: yOffsets(index) + 16 },
                    {
                        autoAlpha: 1,
                        y: yOffsets(index),
                        duration: 0.75,
                        ease: 'power3.out',
                        delay: delays(index),
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                        },
                        immediateRender: false,
                        clearProps: 'transform,opacity',
                    }
                );
            });

            gsap.utils.toArray<HTMLElement>('.gsap-float').forEach((chip) => {
                gsap.to(chip, {
                    x: gsap.utils.random(-10, 10),
                    y: gsap.utils.random(-14, 14),
                    duration: gsap.utils.random(4, 7),
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1,
                });
            });
        }, rootRef);

        return () => {
            gsap.killTweensOf('.gsap-float');
            ctx.revert();
        };
    }, []);

    const nameChips = [
        {
            label: 'uni.eth',
            bg: '#f8bfd9',
            text: '#e11d7b',
            className: 'top-6 right-12'
        },
        {
            label: 'base.eth',
            bg: '#fff3c6',
            text: '#6b513f',
            className: 'top-20 right-48'
        },
        {
            label: 'linea.eth',
            bg: '#d7efe1',
            text: '#166b3b',
            className: 'top-44 right-20'
        },
        {
            label: 'dao.eth',
            bg: '#dff5e8',
            text: '#0f8f4b',
            className: 'top-64 right-32'
        },
        {
            label: 'nba.eth',
            bg: '#dbe9ff',
            text: '#2563eb',
            className: 'top-72 right-6'
        },
        {
            label: 'vitalik.eth',
            bg: '#f1d4ff',
            text: '#a855f7',
            className: 'top-[22rem] right-44'
        }
    ];
    const pillars = [
        {
            title: 'Selective Disclosure',
            body: 'Hide raw scores and prove only the required tier to protect privacy.',
            icon: Shield,
            tint: 'bg-pastel-blue'
        },
        {
            title: 'Tier-Gated Execution',
            body: 'Use ENS context to classify Standard/Trusted/Elite and unlock pool access.',
            icon: Users,
            tint: 'bg-pastel-pink'
        },
        {
            title: 'MEV-Protected Hook',
            body: 'Apply pre-trade checks and cooldowns via a Uniswap v4 Hook to reduce sandwich risk.',
            icon: Globe,
            tint: 'bg-pastel-green'
        }
    ];
    const pathways = [
        {
            title: 'ENS Context',
            body: 'Verify your ENS name and claim your tier to unlock privacy-enhanced execution.',
            cta: 'Get started',
            to: '/verify'
        },
        {
            title: 'Hyde Swap',
            body: 'Trade with selective disclosure and tier-gated protection on Uniswap v4.',
            cta: 'Explore Hyde',
            to: '/app'
        }
    ];

    return (
        <div ref={rootRef} className="ens-page">
            <div className="pointer-events-none absolute inset-0 ens-grid" />
            <div className="pointer-events-none absolute inset-0 ens-noise" />
            <section className="relative pt-20 pb-16">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-transparent" />
                <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-indigo-100 blur-3xl opacity-60" />
                <div className="absolute top-40 left-0 h-64 w-64 rounded-full bg-blue-100 blur-3xl opacity-60" />
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-10 top-44 h-24 w-44 rounded-sm border border-blue-200/60 bg-blue-50/70 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.25)_1px,transparent_0)] [background-size:6px_6px]" />
                        <motion.div
                            className="absolute -left-4 top-6 h-6 w-6 rounded-sm bg-white shadow-sm"
                            animate={{ x: [0, 180, 0] }}
                            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                        />
                    </div>
                    <div className="absolute left-28 top-72 h-16 w-56 rounded-sm border border-indigo-200/70 bg-indigo-50/70">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.3)_1px,transparent_0)] [background-size:6px_6px]" />
                        <motion.div
                            className="absolute -left-4 top-5 h-6 w-6 rounded-sm bg-white shadow-sm"
                            animate={{ x: [0, 230, 0] }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: 1.2 }}
                        />
                    </div>
                    <div className="absolute right-44 top-64 h-36 w-36 rounded-sm border border-fuchsia-200/60 bg-fuchsia-50/70">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(236,72,153,0.28)_1px,transparent_0)] [background-size:6px_6px]" />
                        <motion.div
                            className="absolute -left-4 top-10 h-6 w-6 rounded-sm bg-white shadow-sm"
                            animate={{ y: [0, 110, 0] }}
                            transition={{ duration: 15, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                        />
                    </div>
                </div>
                <div className="relative container mx-auto px-6 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.05, 0.7, 0.1, 1.0] }}
                        className="space-y-8"
                    >
                        <p className="gsap-hero-line text-xs uppercase tracking-[0.35em] text-slate-400">Hyde Name Hooks</p>
                        <h1 className="gsap-hero-line text-5xl md:text-7xl font-black tracking-tight text-brand-dark">
                            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED]">private DeFi story</span>
                        </h1>
                        <p className="gsap-hero-line text-lg text-slate-600 max-w-xl leading-relaxed">
                            ENS-powered privacy for Uniswap v4. Prove your tier without exposing your strategy.
                        </p>
                        <div className="gsap-hero-line flex flex-wrap gap-4 items-center">
                            <Link to="/app" className="inline-flex">
                                <Button size="lg">
                                    Launch App
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link to="/verify" className="inline-flex">
                                <Button variant="outline" size="lg">Verify ENS</Button>
                            </Link>
                        </div>
                        <div className="gsap-hero-line flex flex-wrap gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-2"><Wallet className="w-4 h-4 text-brand-blue" /> Wallet-ready</span>
                            <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-brand-blue" /> Selective disclosure</span>
                            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-blue" /> MEV protection</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.05, 0.7, 0.1, 1.0] }}
                        className="gsap-card ens-glass rounded-[2.5rem] shadow-xl border border-slate-100 p-8 space-y-6"
                    >
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-2">Your name</p>
                            <h2 className="text-3xl font-bold text-brand-dark">Claim your tier</h2>
                        </div>
                        <input
                            type="text"
                            placeholder="myname.eth"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-base font-semibold text-brand-dark outline-none focus:border-brand-blue focus:bg-white transition-colors"
                        />
                        <div className="flex gap-3 flex-wrap">
                            <Button className="min-w-[180px]">Claim context</Button>
                            <Button variant="ghost">Learn more</Button>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
                                <span>Live privacy coverage</span>
                                <span>Updating</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-2 w-2/3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse rounded-full" />
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="absolute right-8 top-10 hidden lg:block">
                    <div className="relative h-[520px] w-[260px]">
                        {nameChips.map((chip, index) => (
                            <motion.div
                                key={chip.label}
                                className={`gsap-float absolute ${chip.className} px-4 py-2 rounded-xl text-base font-semibold shadow-sm`}
                                style={{ backgroundColor: chip.bg, color: chip.text }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: [0, -8, 0] }}
                                transition={{ duration: 6 + index * 0.6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.15 }}
                            >
                                {chip.label}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative py-12 container mx-auto px-6">
                <div className="gsap-card ens-glass rounded-[2.5rem] border border-slate-100 shadow-soft p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Flow</p>
                        <h2 className="text-2xl md:text-3xl font-black text-brand-dark mt-2">How it works</h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                            <span>Onchain</span>
                            <span className="text-slate-300">+</span>
                            <span>Offchain</span>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-4">
                        {[
                            {
                                step: '01',
                                title: 'Verify',
                                body: 'Connect wallet and prove ENS ownership for a stable identity layer.',
                                accent: 'bg-blue-50 text-blue-600'
                            },
                            {
                                step: '02',
                                title: 'Score',
                                body: 'Compute activity, holdings, and reputation into a portable score.',
                                accent: 'bg-indigo-50 text-indigo-600'
                            },
                            {
                                step: '03',
                                title: 'Register',
                                body: 'Write only the tier to the registry—scores stay private.',
                                accent: 'bg-fuchsia-50 text-fuchsia-600'
                            },
                            {
                                step: '04',
                                title: 'Swap',
                                body: 'Uniswap v4 Hook enforces cooldown and tier gating at execution.',
                                accent: 'bg-emerald-50 text-emerald-600'
                            }
                        ].map((item) => (
                            <div key={item.step} className="gsap-card gsap-card-item bg-white/70 rounded-3xl border border-slate-100 p-6">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${item.accent}`}>
                                    Step {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark mt-4 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                        <span className="h-px flex-1 bg-slate-200" />
                        <span>Selective Disclosure</span>
                        <span className="h-px flex-1 bg-slate-200" />
                    </div>
                </div>
            </section>

            <section className="relative py-10 container mx-auto px-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="gsap-card gsap-card-item ens-glass rounded-3xl p-6 border border-slate-100">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Use Case</p>
                        <h3 className="text-xl font-bold text-brand-dark mt-3">Private swaps</h3>
                        <p className="text-sm text-slate-600 mt-2">
                            Traders unlock better routes without exposing full on-chain identity or strategy.
                        </p>
                    </div>
                    <div className="gsap-card gsap-card-item ens-glass rounded-3xl p-6 border border-slate-100">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Use Case</p>
                        <h3 className="text-xl font-bold text-brand-dark mt-3">LP protection</h3>
                        <p className="text-sm text-slate-600 mt-2">
                            Hooks enforce cooldowns and tier checks to reduce toxic flow and MEV pressure.
                        </p>
                    </div>
                    <div className="gsap-card gsap-card-item ens-glass rounded-3xl p-6 border border-slate-100">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Use Case</p>
                        <h3 className="text-xl font-bold text-brand-dark mt-3">Proof-ready access</h3>
                        <p className="text-sm text-slate-600 mt-2">
                            Eligibility proofs can be shared without exposing raw scores or wallet history.
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative py-14 container mx-auto px-6">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
                    <div className="space-y-5">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Project</p>
                        <h2 className="text-4xl md:text-5xl font-black text-brand-dark">
                            Identity + privacy
                        </h2>
                        <p className="text-lg text-slate-600">
                            We use ENS as a trust anchor, compute a context score from real on-chain activity, and gate
                            Uniswap v4 swaps through hooks. The result: privacy-preserving tiers for traders and safer
                            orderflow for LPs.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="gsap-card gsap-card-item ens-glass rounded-3xl p-5 border border-slate-100">
                                <div className="flex items-center gap-3 text-sm font-semibold text-brand-dark">
                                    <Shield className="w-4 h-4 text-brand-blue" />
                                    Privacy by default
                                </div>
                                <p className="text-xs text-slate-600 mt-2">
                                    Only tier proofs go onchain. Raw scores and inputs stay private.
                                </p>
                            </div>
                            <div className="gsap-card gsap-card-item ens-glass rounded-3xl p-5 border border-slate-100">
                                <div className="flex items-center gap-3 text-sm font-semibold text-brand-dark">
                                    <Globe className="w-4 h-4 text-brand-blue" />
                                    Cross-chain ready
                                </div>
                                <p className="text-xs text-slate-600 mt-2">
                                    Supports Sepolia, Base Sepolia, and Unichain Sepolia registries.
                                </p>
                            </div>
                            <div className="gsap-card gsap-card-item ens-glass rounded-3xl p-5 border border-slate-100">
                                <div className="flex items-center gap-3 text-sm font-semibold text-brand-dark">
                                    <Users className="w-4 h-4 text-brand-blue" />
                                    Tiered access
                                </div>
                                <p className="text-xs text-slate-600 mt-2">
                                    Standard, Trusted, and Elite tiers unlock liquidity experiences.
                                </p>
                            </div>
                            <div className="gsap-card gsap-card-item ens-glass rounded-3xl p-5 border border-slate-100">
                                <div className="flex items-center gap-3 text-sm font-semibold text-brand-dark">
                                    <Sparkles className="w-4 h-4 text-brand-blue" />
                                    MEV-aware execution
                                </div>
                                <p className="text-xs text-slate-600 mt-2">
                                    Hooks enforce cooldowns and context checks at swap time.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="gsap-card gsap-card-item ens-glass rounded-[2.5rem] p-8 border border-slate-100 shadow-xl space-y-5">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Architecture</p>
                            <h3 className="text-2xl font-bold text-brand-dark mt-2">Signal flow</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-sm text-slate-600">
                                <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 font-semibold flex items-center justify-center">1</div>
                                <div>
                                    <strong className="text-brand-dark">ENS Lookup</strong>
                                    <div className="text-xs mt-1">Resolve name, verify ownership, and normalize inputs.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-600">
                                <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 font-semibold flex items-center justify-center">2</div>
                                <div>
                                    <strong className="text-brand-dark">Scoring Engine</strong>
                                    <div className="text-xs mt-1">Compute on-chain activity, balances, and reputation.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-600">
                                <div className="h-8 w-8 rounded-full bg-fuchsia-50 text-fuchsia-600 font-semibold flex items-center justify-center">3</div>
                                <div>
                                    <strong className="text-brand-dark">Tier Registry</strong>
                                    <div className="text-xs mt-1">Write only the tier to onchain registry.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-600">
                                <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 font-semibold flex items-center justify-center">4</div>
                                <div>
                                    <strong className="text-brand-dark">Hook Execution</strong>
                                    <div className="text-xs mt-1">Uniswap v4 Hook gates swaps and enforces cooldown.</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Wallet className="w-4 h-4 text-brand-blue" />
                            Portable identity with verifiable privacy.
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative py-14 container mx-auto px-6">
                <div className="absolute -left-6 top-8 h-20 w-40 rounded-sm border border-blue-200/60 bg-blue-50/70 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.25)_1px,transparent_0)] [background-size:6px_6px]" />
                    <motion.div
                        className="absolute -left-4 top-5 h-5 w-5 rounded-sm bg-white shadow-sm"
                        animate={{ x: [0, 150, 0] }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'linear', delay: 0.8 }}
                    />
                </div>
                <div className="relative z-10 grid gap-8 lg:grid-cols-3">
                    {pillars.map((pillar) => {
                        const Icon = pillar.icon;
                        return (
                            <motion.div
                                key={pillar.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className={`gsap-card gsap-card-item rounded-[2rem] p-8 border border-white/60 shadow-soft ${pillar.tint} hover:-translate-y-1 transition-transform`}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center mb-6">
                                    <Icon className="w-6 h-6 text-brand-blue" />
                                </div>
                                <h3 className="text-2xl font-bold text-brand-dark mb-3">{pillar.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{pillar.body}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            <section className="relative py-16 bg-slate-50 overflow-hidden">
                <div className="absolute right-10 top-10 h-28 w-28 rounded-sm border border-fuchsia-200/60 bg-fuchsia-50/70">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(236,72,153,0.22)_1px,transparent_0)] [background-size:6px_6px]" />
                    <motion.div
                        className="absolute -left-4 top-6 h-5 w-5 rounded-sm bg-white shadow-sm"
                        animate={{ y: [0, 70, 0] }}
                        transition={{ duration: 14, repeat: Infinity, ease: 'linear', delay: 0.4 }}
                    />
                </div>
                <div className="absolute left-8 bottom-10 h-16 w-44 rounded-sm border border-indigo-200/60 bg-indigo-50/70">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.25)_1px,transparent_0)] [background-size:6px_6px]" />
                    <motion.div
                        className="absolute -left-4 top-4 h-5 w-5 rounded-sm bg-white shadow-sm"
                        animate={{ x: [0, 170, 0] }}
                        transition={{ duration: 17, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
                <div className="container mx-auto px-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-black text-brand-dark">
                            Proof without exposure.
                        </h2>
                        <p className="text-lg text-slate-600">
                            Hyde links ENS identity to tiered execution, so you can trade with privacy while keeping eligibility verifiable.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {pathways.map((item) => (
                                <Link
                                    key={item.title}
                                    to={item.to}
                                    className="gsap-card gsap-card-item ens-glass rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                                >
                                    <h4 className="text-xl font-bold text-brand-dark mb-2">{item.title}</h4>
                                    <p className="text-sm text-slate-600 mb-4">{item.body}</p>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-blue">
                                        {item.cta}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="gsap-card gsap-card-item ens-glass rounded-[2.5rem] p-8 border border-slate-100 shadow-xl space-y-6">
                        <h3 className="text-2xl font-bold text-brand-dark">Hyde signal</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Tier</span>
                                <span className="font-bold text-brand-dark">Trusted</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full">
                                <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-[78%]" />
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs text-slate-500">
                                <div className="bg-slate-50 rounded-2xl p-3">ENS age</div>
                                <div className="bg-slate-50 rounded-2xl p-3">DAO activity</div>
                                <div className="bg-slate-50 rounded-2xl p-3">DeFi usage</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Sparkles className="w-4 h-4 text-brand-blue" />
                            Privacy preserved, eligibility proven.
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative py-20 container mx-auto px-6">
                <div className="absolute right-0 top-0 h-24 w-48 rounded-sm border border-blue-200/60 bg-blue-50/70 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.2)_1px,transparent_0)] [background-size:6px_6px]" />
                    <motion.div
                        className="absolute -left-4 top-5 h-5 w-5 rounded-sm bg-white shadow-sm"
                        animate={{ x: [0, 160, 0] }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'linear', delay: 0.6 }}
                    />
                </div>
                <div className="relative z-10 grid gap-6 md:grid-cols-3">
                    <div className="gsap-card gsap-card-item rounded-[2rem] border border-slate-100 p-8 bg-white shadow-soft hover:shadow-md transition-shadow">
                        <p className="text-4xl font-black text-brand-dark">638k+</p>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mt-2">Owners</p>
                    </div>
                    <div className="gsap-card gsap-card-item rounded-[2rem] border border-slate-100 p-8 bg-white shadow-soft hover:shadow-md transition-shadow">
                        <p className="text-4xl font-black text-brand-dark">1.3m+</p>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mt-2">Names</p>
                    </div>
                    <div className="gsap-card gsap-card-item rounded-[2rem] border border-slate-100 p-8 bg-white shadow-soft hover:shadow-md transition-shadow">
                        <p className="text-4xl font-black text-brand-dark">600+</p>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mt-2">Integrations</p>
                    </div>
                </div>
            </section>

            <section className="relative pb-24 container mx-auto px-6">
                <div className="absolute left-8 -top-6 h-16 w-36 rounded-sm border border-fuchsia-200/60 bg-fuchsia-50/70 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(236,72,153,0.2)_1px,transparent_0)] [background-size:6px_6px]" />
                    <motion.div
                        className="absolute -left-3 top-3 h-4 w-4 rounded-sm bg-white shadow-sm"
                        animate={{ x: [0, 120, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear', delay: 0.9 }}
                    />
                </div>
                <div className="relative z-10 bg-gradient-to-br from-pastel-blue via-pastel-pink to-pastel-green p-1 rounded-[2.5rem]">
                    <div className="bg-white rounded-[2.4rem] px-10 py-12 text-center space-y-4">
                        <h3 className="text-3xl md:text-4xl font-black text-brand-dark">
                            Ready to trade privately?
                        </h3>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Connect your ENS name and unlock selective disclosure execution on Uniswap v4.
                        </p>
                        <Link to="/app" className="inline-flex">
                            <Button size="lg">Launch App</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
