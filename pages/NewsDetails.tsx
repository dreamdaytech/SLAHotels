
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ChevronLeft, Facebook, Twitter, Linkedin, Share2, Tag, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  fullContent: string;
  category: string;
  author: string;
  date: string;
  image: string;
  status: string;
}

const NewsDetails: React.FC = () => {
  const { id } = useParams();
  const { news, loading: appLoading } = useAppContext();

  const article = useMemo(() => news.find(n => n.id === id), [news, id]);
  const recentNews = useMemo(() => news.filter(n => n.id !== id).slice(0, 3), [news, id]);

  if (appLoading && !article) return (
    <div className="pt-40 pb-40 text-center text-slate-400">
      <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <p className="text-xl font-bold tracking-tighter text-slate-900">Synchronizing News Network...</p>
    </div>
  );

  if (!article) {
    return (
      <div className="pt-40 pb-40 text-center text-slate-400">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Tag size={32} className="opacity-20" />
        </div>
        <p className="text-xl font-bold">Article not found.</p>
        <Link to="/news" className="text-emerald-600 underline mt-4 inline-block">Return to News</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 pb-20">
          <div className="max-w-4xl">
            <Link to="/news" className="inline-flex items-center text-white/80 font-bold text-xs uppercase tracking-[0.3em] mb-12 hover:text-emerald-400 transition-colors group">
              <ChevronLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to News
            </Link>
            <div className="mb-6">
              <span className="bg-amber-500 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                {article.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
              {article.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Meta Information Bar */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3 text-emerald-700">
                <User size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Author</p>
                <p className="text-sm font-bold text-slate-800">{article.author}</p>
              </div>
            </div>
            <div className="flex items-center border-l border-slate-200 pl-8 hidden sm:flex">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-600">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Published</p>
                <p className="text-sm font-bold text-slate-800">{article.date}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Share Article:</span>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1877F2] hover:border-[#1877F2] transition-all">
              <Facebook size={18} />
            </button>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-all">
              <Twitter size={18} />
            </button>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#0A66C2] hover:border-[#0A66C2] transition-all">
              <Linkedin size={18} />
            </button>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <section className="py-24 container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* Main Article Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-lg prose-slate max-w-none">
              {/* If no full content, use excerpt as fallback for demo */}
              <div className="text-2xl text-slate-600 font-light leading-relaxed mb-12 italic border-l-4 border-emerald-500 pl-8">
                {article.excerpt}
              </div>

              <div className="text-lg text-slate-700 leading-relaxed space-y-6 whitespace-pre-wrap">
                {article.fullContent || (
                  <p className="italic text-slate-400">Full content for this article is currently being synchronized. Please check back shortly for the complete official update.</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex items-center gap-4">
              <Tag size={18} className="text-slate-300" />
              <div className="flex flex-wrap gap-2">
                {['Hospitality', 'Sierra Leone', 'Industry Standards', article.category].map(tag => (
                  <span key={tag} className="text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            {/* Recent News Widget */}
            <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-8 uppercase tracking-tighter">Recent Updates</h3>
              <div className="space-y-8">
                {recentNews.map((news) => (
                  <Link key={news.id} to={`/news/${news.id}`} className="flex gap-4 group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={news.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                        {news.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">{news.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/news" className="mt-10 flex items-center justify-center w-full py-4 bg-white border border-slate-200 text-slate-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-sm">
                View All News <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>

            {/* Newsletter CTA */}
            <div className="bg-emerald-900 text-white rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 tracking-tighter">Stay Informed</h3>
                <p className="text-emerald-100/70 text-sm mb-8 leading-relaxed">
                  Join 1,200+ hospitality professionals receiving our weekly industry briefing.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Work email address"
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-emerald-300 outline-none focus:ring-4 focus:ring-amber-500/20 transition-all"
                  />
                  <button className="w-full bg-amber-500 text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-400 transition-all shadow-xl">
                    Subscribe Now
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Share2 size={200} />
              </div>
            </div>

            {/* Help/Support */}
            <div className="bg-amber-50 rounded-[3rem] p-10 border border-amber-100">
              <h3 className="text-lg font-bold text-amber-900 mb-2 tracking-tight">Media Inquiries</h3>
              <p className="text-amber-800/70 text-sm leading-relaxed mb-6">
                Are you a journalist seeking official statements or high-res photos?
              </p>
              <Link to="/contact" className="text-amber-700 font-bold text-xs uppercase tracking-widest hover:underline flex items-center">
                Contact Press Office <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default NewsDetails;
