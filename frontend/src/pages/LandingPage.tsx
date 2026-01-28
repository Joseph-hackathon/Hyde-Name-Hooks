import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Shield, Sparkles, Users, Wallet } from 'lucide-react';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/progress/linear-progress.js';

export default function LandingPage() {
    const nameChips = [
        'uni.eth',
        'base.eth',
        'dao.eth',
        'nba.eth',
        'linea.eth',
        'vitalik.eth'
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
                                <md-filled-button>
                                    <span className="flex items-center gap-2">
                                        Launch App
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </md-filled-button>
                            </Link>
                            <Link to="/verify" className="inline-flex">
                                <md-outlined-button>Verify ENS</md-outlined-button>
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
                        <md-filled-text-field
                            label="ENS name"
                            placeholder="myname.eth"
                            className="w-full"
                        />
                        <div className="flex gap-3 flex-wrap">
                            <md-filled-button className="min-w-[180px]">Claim context</md-filled-button>
                            <md-text-button>Learn more</md-text-button>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
                                <span>Live privacy coverage</span>
                                <span>Updating</span>
                            </div>
                            <md-linear-progress indeterminate className="w-full" />
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-8 border-y border-slate-100 bg-white/70">
                <div className="container mx-auto px-6 flex flex-wrap gap-4 items-center justify-center text-sm font-semibold text-slate-500">
                    {nameChips.map((name) => (
                        <span key={name} className="px-4 py-2 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                            {name}
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
                            <md-filled-button>Launch App</md-filled-button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
