import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Globe, Database, Play, Loader2, CheckCircle2, AlertCircle, Clock, ExternalLink, Square, FileJson, Table } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface ImportLog {
  id: number;
  status: 'info' | 'success' | 'failed' | 'processing';
  message: string;
  created_at: string;
}

interface ImportJob {
  id: number;
  source_category_url: string;
  local_category_id: number;
  status: 'pending' | 'crawling_links' | 'scraping_products' | 'completed' | 'failed';
  total_found: number;
  processed_count: number;
  failed_count: number;
  error_logs: string | null;
  created_at: string;
  local_category?: {
    name: string;
  };
  logs?: ImportLog[];
}

interface MicrolessProduct {
  id: number;
  title: string;
  url: string;
  SKU: string;
  cover_image_url: string;
  active_offer?: {
    price: number;
    price_formatted: string;
  };
}

export default function Scraper() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentJobs, setRecentJobs] = useState<ImportJob[]>([]);
  const [activeJob, setActiveJob] = useState<ImportJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isRerunning, setIsRerunning] = useState(false);
  const [localCatId, setLocalCatId] = useState('');

  // Microless JSON States
  const [jsonInput, setJsonInput] = useState('');
  const [parsedProducts, setParsedProducts] = useState<MicrolessProduct[]>([]);
  const [categoryBrandsStr, setCategoryBrandsStr] = useState('');
  const [, setImportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, jobsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/admin/imports')
        ]);
        setCategories(catRes.data);
        setRecentJobs(jobsRes.data);
        
        // Check if any job is currently running
        const runningJob = jobsRes.data.find((j: ImportJob) => 
          !['completed', 'failed'].includes(j.status)
        );
        if (runningJob) setActiveJob(runningJob);

      } catch (err) {
        console.error('Failed to fetch scraper data', err);
      }
    };
    fetchData();
  }, []);

  // Poll active job status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJob && !['completed', 'failed'].includes(activeJob.status)) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/admin/imports/${activeJob.id}/status`);
          setActiveJob(res.data.job);
          if (['completed', 'failed'].includes(res.data.job.status)) {
            const jobsRes = await api.get('/admin/imports');
            setRecentJobs(jobsRes.data);
          }
        } catch (err) {
          console.error('Failed to poll job status', err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeJob]);

  const handleRerunFailed = async (jobId: number) => {
    setIsRerunning(true);
    try {
      await api.post(`/admin/imports/${jobId}/rerun-failed`);
      const res = await api.get(`/admin/imports/${jobId}/status`);
      setActiveJob(res.data.job);
      setImportStatus({ type: 'success', message: 'Re-run started for failed products' });
    } catch (err) {
      alert('Failed to re-run job');
    } finally {
      setIsRerunning(false);
    }
  };

  const flattenCategories = (cats: any[], depth = 0, parentName = ''): any[] => {
    return cats.reduce((acc, cat) => {
      const flattened = {
        ...cat,
        depth,
        isChild: depth > 0,
        parentName: depth > 0 ? parentName : ''
      };
      const children = cat.children ? flattenCategories(cat.children, depth + 1, cat.name) : [];
      return [...acc, flattened, ...children];
    }, []);
  };

  const flattenedCategories = flattenCategories(categories);

  const handleAnalyzeJson = () => {
    try {
      const data = JSON.parse(jsonInput);
      let products: MicrolessProduct[] = [];
      let brandsStr = '';
      
      // Microless JSON can be a direct array or have a 'products' key
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.products) products = [...products, ...item.products];
          else if (item.title) products.push(item);
          if (item.category_brands_str) brandsStr = item.category_brands_str;
        });
      } else if (data.products) {
        products = data.products;
        if (data.category_brands_str) brandsStr = data.category_brands_str;
      }

      setParsedProducts(products);
      setCategoryBrandsStr(brandsStr);
      if (products.length === 0) {
        alert("No products found in the JSON. Make sure you copied the correct response.");
      }
    } catch (err) {
      alert("Invalid JSON format. Please paste the raw response from Microless.");
    }
  };

  const handleBulkImportJson = async () => {
    if (!localCatId) {
      alert("Please select a target local category first.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/admin/imports/json', {
        local_category_id: localCatId,
        products: parsedProducts,
        category_brands_str: categoryBrandsStr
      });
      setActiveJob(res.data.job);
      setImportStatus({ type: 'success', message: `Importing ${parsedProducts.length} products in background...` });
      setParsedProducts([]);
      setJsonInput('');
    } catch (err: any) {
      setImportStatus({ type: 'error', message: err.response?.data?.message || 'Bulk import failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopJob = async () => {
    if (!activeJob) return;
    setIsStopping(true);
    try {
      await api.post(`/admin/imports/${activeJob.id}/stop`);
      const res = await api.get(`/admin/imports/${activeJob.id}/status`);
      setActiveJob(res.data.job);
    } catch (err) {
      alert('Failed to stop job');
    } finally {
      setIsStopping(false);
    }
  };

  const calculateProgress = () => {
    if (!activeJob || activeJob.total_found === 0) return 0;
    return Math.round((activeJob.processed_count / activeJob.total_found) * 100);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Automated Product Scraper</h1>
        <p className="text-text-muted mt-2">Bulk import products from external marketplaces with automatic image processing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-premium relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent-primary/10 transition-colors duration-500" />
            
              <div className="space-y-6">
                <div className="flex items-start gap-4 mb-2">
                  <div className="p-3 bg-accent-primary/10 rounded-xl text-accent-primary">
                    <FileJson className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-text-primary">JSON Manual Importer</h2>
                    <p className="text-text-muted text-sm">Paste the JSON response from Microless Network Tab for 100% accuracy.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Target Local Category</label>
                    <select 
                      value={localCatId}
                      onChange={(e) => setLocalCatId(e.target.value)}
                      className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-accent-primary transition-all duration-300 outline-none"
                      required
                    >
                      <option value="">Select Category</option>
                      {flattenedCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {'\u00A0\u00A0'.repeat(cat.depth)}{cat.depth > 0 ? '└ ' : ''}{cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Paste Microless JSON Response</label>
                    <textarea 
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder='Paste [{"category": ..., "products": [...]}] here...'
                      className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-accent-primary transition-all duration-300 outline-none font-mono text-xs h-48"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAnalyzeJson}
                      disabled={!jsonInput}
                      className="flex-1 bg-bg-surface border border-border-subtle hover:border-accent-primary hover:text-accent-primary text-text-primary font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Table className="w-5 h-5" />
                      Analyze & Preview
                    </button>
                    {parsedProducts.length > 0 && (
                      <button
                        onClick={handleBulkImportJson}
                        disabled={isLoading || !localCatId}
                        className="flex-1 bg-accent-primary hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                        Import {parsedProducts.length} Products
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview Table */}
                {parsedProducts.length > 0 && (
                  <div className="mt-8 border-t border-border-subtle pt-6">
                    <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <Table className="w-4 h-4" />
                      Extracted Products ({parsedProducts.length})
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-border-subtle max-h-96">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-bg-primary text-text-muted uppercase text-[10px] tracking-wider font-bold border-b border-border-subtle sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                          {parsedProducts.map((p, idx) => (
                            <tr key={idx} className="hover:bg-accent-primary/5 transition-colors duration-200">
                              <td className="px-4 py-3 flex items-center gap-3">
                                <img src={p.cover_image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                <span className="font-medium truncate max-w-[200px]">{p.title}</span>
                              </td>
                              <td className="px-4 py-3 text-text-muted font-mono text-[11px]">{p.SKU}</td>
                              <td className="px-4 py-3 text-accent-primary font-bold">{p.active_offer?.price_formatted || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
          </div>

          {/* Table of Recent Imports */}
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-premium overflow-hidden">
            <h3 className="text-xl font-display font-semibold text-text-primary mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-text-muted" />
              Recent Import Sessions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-primary text-text-muted uppercase text-[10px] tracking-wider font-bold border-b border-border-subtle">
                  <tr>
                    <th className="px-4 py-3">Source URL / Query</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Found</th>
                    <th className="px-4 py-3">Processed</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {recentJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-bg-primary/50 transition-colors duration-200">
                      <td className="px-4 py-4 max-w-[200px] truncate items-center">
                        <span className="font-medium text-text-primary block truncate">{job.source_category_url}</span>
                        <span className="text-[10px] text-text-muted bg-accent-primary/5 px-1.5 py-0.5 rounded border border-accent-primary/10">
                          {job.local_category?.name || 'Category'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                          job.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                          'bg-amber-500/10 text-amber-500 animate-pulse'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-text-primary">
                        {job.total_found}
                      </td>
                      <td className="px-4 py-4">
                         <div className="flex items-center gap-2">
                           <span className="font-bold text-emerald-500">{job.processed_count}</span>
                           <span className="text-text-muted text-[10px]">/ {job.total_found}</span>
                         </div>
                      </td>
                      <td className="px-4 py-4 text-text-muted text-[11px]">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Active Progress */}
        <div className="space-y-6">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-premium sticky top-8 overflow-hidden">
            <h3 className="text-xl font-display font-semibold text-text-primary mb-6 flex items-center gap-2">
              <Loader2 className={`w-5 h-5 ${activeJob ? 'animate-spin text-accent-primary' : 'text-text-muted'}`} />
              Active Import Progress
            </h3>

            {activeJob ? (
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-text-primary">Overall Progress</span>
                  <span className="text-sm font-bold text-accent-primary">{calculateProgress()}%</span>
                </div>
                
                {/* Custom Progress Bar */}
                <div className="h-4 bg-bg-primary rounded-full overflow-hidden border border-border-subtle p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-primary to-emerald-400 rounded-full transition-all duration-1000 flex items-center justify-end px-1"
                    style={{ width: `${calculateProgress()}%` }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg-primary p-4 rounded-xl border border-border-subtle text-center">
                    <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Processed</p>
                    <p className="text-2xl font-display font-bold text-accent-primary">{activeJob.processed_count}</p>
                  </div>
                  <div className="bg-bg-primary p-4 rounded-xl border border-border-subtle text-center">
                    <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Found</p>
                    <p className="text-2xl font-display font-bold text-text-primary">{activeJob.total_found}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`p-1.5 rounded-full ${activeJob.status === 'crawling_links' ? 'bg-accent-primary text-white' : 'bg-bg-primary text-text-muted border border-border-subtle'}`}>
                      {['scraping_products', 'completed'].includes(activeJob.status) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    </div>
                    <span className={['scraping_products', 'completed'].includes(activeJob.status) ? 'text-text-muted line-through' : 'text-text-primary font-medium'}>
                      Analyzing Listing Pages
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`p-1.5 rounded-full ${activeJob.status === 'scraping_products' ? 'bg-accent-primary text-white' : 'bg-bg-primary text-text-muted border border-border-subtle'}`}>
                       {activeJob.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
                    </div>
                    <span className={activeJob.status === 'completed' ? 'text-text-muted line-through' : 'text-text-primary font-medium'}>
                      Importing Products & Data
                    </span>
                  </div>
                </div>

                {activeJob.error_logs && (
                  <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 text-red-500 text-xs flex gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-bold uppercase tracking-widest text-[10px] mb-1">Issue Detected</p>
                      <p className="italic">"{activeJob.error_logs}"</p>
                    </div>
                  </div>
                )}

                {/* Terminal View */}
                <div className="bg-black/90 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                  <div className="bg-white/10 px-4 py-2 flex items-center justify-between border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Import Terminal</span>
                  </div>
                  <div className="p-4 font-mono text-[11px] h-64 overflow-y-auto space-y-1.5 no-scrollbar bg-[radial-gradient(circle_at_50%_0%,_rgba(16,185,129,0.05),_transparent)]">
                    {activeJob.logs && activeJob.logs.length > 0 ? (
                      activeJob.logs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-white/70 animate-in fade-in slide-in-from-left-2 duration-300">
                           <span className="text-white/30 shrink-0">[{new Date(log.created_at).toLocaleTimeString([], { hour12: false })}]</span>
                           <span className={`shrink-0 ${
                             log.status === 'success' ? 'text-emerald-400' : 
                             log.status === 'failed' ? 'text-red-400' : 
                             log.status === 'processing' ? 'text-blue-400' : 'text-amber-400'
                           }`}>
                             {log.status.toUpperCase()}
                           </span>
                           <span className="truncate">{log.message}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/20 italic">Awaiting logs...</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {activeJob.status === 'completed' && activeJob.failed_count > 0 && (
                    <button
                      onClick={() => handleRerunFailed(activeJob.id)}
                      disabled={isRerunning}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-xl transition-all duration-300 font-semibold"
                    >
                      {isRerunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      Re-run {activeJob.failed_count} Failed Products
                    </button>
                  )}
                  
                  {!['completed', 'failed'].includes(activeJob.status) && (
                    <button
                      onClick={handleStopJob}
                      disabled={isStopping}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 font-semibold"
                    >
                      {isStopping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                      Stop Importing Job
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-20 h-20 bg-bg-primary rounded-full flex items-center justify-center mx-auto border border-border-subtle group">
                  <Loader2 className="w-8 h-8 text-text-muted group-hover:text-accent-primary transition-colors duration-500" />
                </div>
                <p className="text-text-muted text-sm font-medium">Ready to start importing?</p>
                <div className="flex justify-center gap-1">
                  <div className="w-1 h-1 bg-accent-primary/20 rounded-full animate-bounce delay-100" />
                  <div className="w-1 h-1 bg-accent-primary/40 rounded-full animate-bounce delay-200" />
                  <div className="w-1 h-1 bg-accent-primary/60 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />
          </div>
          
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-premium overflow-hidden">
             <h4 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
               <ExternalLink className="w-4 h-4 text-accent-primary" />
               Scraping Rules
             </h4>
             <ul className="space-y-3 text-xs text-text-muted">
               <li className="flex gap-2">
                 <span className="text-accent-primary font-bold">01.</span>
                 Avoid frequent scraping from same IP.
               </li>
               <li className="flex gap-2">
                 <span className="text-accent-primary font-bold">02.</span>
                 Duplicate detection is based on Source URL.
               </li>
               <li className="flex gap-2">
                 <span className="text-accent-primary font-bold">03.</span>
                 Images are processed sequentially.
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
