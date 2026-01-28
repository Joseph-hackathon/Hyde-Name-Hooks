import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Shield, Sparkles, Users, Wallet } from 'lucide-react';
import Button from '../components/ui/Button';

export default function LandingPage() {
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
            title: 'Your name',
            body: 'Your ENS name is your Web3 identity. Simple, memorable, unmistakably yours.',
            icon: Globe,
            tint: 'bg-pastel-blue'
        },
        {
            title: 'Consistent everywhere',
            body: 'Use one name across wallets, dapps, and communities with zero friction.',
            icon: Users,
            tint: 'bg-pastel-pink'
        },
        {
            title: 'True ownership',
            body: 'Own your name onchain with no intermediaries and full control.',
            icon: Shield,
            tint: 'bg-pastel-green'
        }
    ];
    const pathways = [
        {
            title: 'ENS App',
            body: 'Register your name and manage records in one place.',
            cta: 'Get started'
        },
        {
            title: 'Hyde Hooks',
            body: 'Unlock selective disclosure for private execution.',
            cta: 'Explore Hyde'
        },
        {
            title: 'Developer Docs',
            body: 'Integrate ENS context into your dapp in minutes.',
            cta: 'Read docs'
        }
    ];

    return (
        <div className="relative bg-background min-h-screen overflow-hidden">
            <section className="relative pt-28 pb-24">
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
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Hyde Name Hooks</p>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-brand-dark">
                            Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED]">New Internet</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                            ENS-powered privacy for Uniswap v4. Prove your tier without exposing your strategy.
                        </p>
                        <div className="flex flex-wrap gap-4 items-center">
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
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-2"><Wallet className="w-4 h-4 text-brand-blue" /> Wallet-ready</span>
                            <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-brand-blue" /> Selective disclosure</span>
                            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-blue" /> MEV protection</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.05, 0.7, 0.1, 1.0] }}
                        className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 space-y-6"
                    >
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-2">Your name</p>
                            <h2 className="text-3xl font-bold text-brand-dark">Claim ENS context</h2>
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
                                className={`absolute ${chip.className} px-4 py-2 rounded-xl text-base font-semibold shadow-sm`}
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

            <section className="py-8 border-y border-slate-100 bg-white/70">
                <div className="container mx-auto px-6 flex flex-wrap gap-4 items-center justify-center text-sm font-semibold text-slate-500">
                    {nameChips.map((chip) => (
                        <span key={chip.label} className="ens-chip hover:shadow-md transition-shadow">
                            {chip.label}
                        </span>
                    ))}
                </div>
            </section>

            <section className="py-20 container mx-auto px-6">
                <div className="grid gap-8 lg:grid-cols-3">
                    {pillars.map((pillar) => {
                        const Icon = pillar.icon;
                        return (
                            <motion.div
                                key={pillar.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className={`rounded-[2rem] p-8 border border-white/60 shadow-soft ${pillar.tint} hover:-translate-y-1 transition-transform`}
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

            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-black text-brand-dark">
                            Your gateway to selective disclosure.
                        </h2>
                        <p className="text-lg text-slate-600">
                            Hyde makes ENS context portable. Keep your identity consistent while trading with privacy across the DeFi stack.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {pathways.map((item) => (
                                <div key={item.title} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="text-xl font-bold text-brand-dark mb-2">{item.title}</h4>
                                    <p className="text-sm text-slate-600 mb-4">{item.body}</p>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-blue">
                                        {item.cta}
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl space-y-6">
                        <h3 className="text-2xl font-bold text-brand-dark">Hyde context signal</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Tier</span>
                                <span className="font-bold text-brand-dark">Trusted</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full">
                                <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-[78%]" />
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-xs text-slate-500">
                                <div className="bg-slate-50 rounded-2xl p-3">ENS 1.2y</div>
                                <div className="bg-slate-50 rounded-2xl p-3">DAO 3</div>
                                <div className="bg-slate-50 rounded-2xl p-3">DeFi 12</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Sparkles className="w-4 h-4 text-brand-blue" />
                            Privacy preserved, eligibility proven.
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 container mx-auto px-6">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-[2rem] border border-slate-100 p-8 bg-white shadow-soft hover:shadow-md transition-shadow">
                        <p className="text-4xl font-black text-brand-dark">638k+</p>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mt-2">Owners</p>
                    </div>
                    <div className="rounded-[2rem] border border-slate-100 p-8 bg-white shadow-soft hover:shadow-md transition-shadow">
                        <p className="text-4xl font-black text-brand-dark">1.3m+</p>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mt-2">Names</p>
                    </div>
                    <div className="rounded-[2rem] border border-slate-100 p-8 bg-white shadow-soft hover:shadow-md transition-shadow">
                        <p className="text-4xl font-black text-brand-dark">600+</p>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mt-2">Integrations</p>
                    </div>
                </div>
            </section>

            <section className="pb-24 container mx-auto px-6">
                <div className="bg-gradient-to-br from-pastel-blue via-pastel-pink to-pastel-green p-1 rounded-[2.5rem]">
                    <div className="bg-white rounded-[2.4rem] px-10 py-12 text-center space-y-4">
                        <h3 className="text-3xl md:text-4xl font-black text-brand-dark">
                            Ready to trade with privacy?
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
