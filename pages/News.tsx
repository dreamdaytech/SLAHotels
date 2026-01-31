
import React from 'react';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const News: React.FC = () => {
  const { news: articles } = useAppContext();

  return (
    <div className="pt-24 lg:pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">News & Updates</h1>
          <p className="text-slate-500 text-lg">The latest from SLAH and the hospitality world of Sierra Leone.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main List */}
          <div className="lg:col-span-8">
            {articles.length === 0 ? (
              <div className="text-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No published news found.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {articles.map((post, idx) => (
                  <article key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row hover:shadow-lg transition-all group">
                    <div className="md:w-1/3 relative h-64 md:h-auto overflow-hidden">
                      <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                      <div className="absolute top-4 left-4">
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">{post.category}</span>
                      </div>
                    </div>
                    <div className="p-8 md:w-2/3 flex flex-col justify-center">
                      <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 space-x-4">
                        <span className="flex items-center"><Calendar size={14} className="mr-1" /> {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="flex items-center"><User size={14} className="mr-1" /> {post.author}</span>
                      </div>
                      <Link to={`/news/${post.id}`}>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 leading-tight hover:text-emerald-700 transition-colors">{post.title}</h2>
                      </Link>
                      <p className="text-slate-500 mb-6 line-clamp-2">{post.excerpt}</p>
                      <Link to={`/news/${post.id}`} className="text-emerald-700 font-bold flex items-center hover:underline">
                        Read Full Story <ArrowRight size={18} className="ml-2" />
                      </Link>
                    </div>
                  </article>
                ))}

                <div className="flex justify-center pt-8">
                  <button className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50">Load Older Posts</button>
                </div>
              </div>
            )}
          </div>

          {/* News Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['Policy', 'Events', 'Training', 'Member News', 'Industry Reports', 'Tourism'].map(cat => (
                  <button key={cat} className="px-4 py-2 bg-slate-50 rounded-full text-sm font-medium text-slate-600 hover:bg-emerald-600 hover:text-white transition-colors">
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-900 text-white p-8 rounded-3xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4">Newsletter</h3>
                <p className="text-emerald-200 text-sm mb-6">Get weekly industry updates delivered directly to your inbox.</p>
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-emerald-300 outline-none mb-4"
                />
                <button className="w-full bg-amber-500 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors">Subscribe Now</button>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Tag size={120} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
