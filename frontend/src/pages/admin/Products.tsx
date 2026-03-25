import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Edit, Trash2, Plus, X, Search } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    sale_price: '',
    status: 'active',
    badge: '',
    badge_color: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(currentPage, searchQuery);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  const fetchProducts = async (page: number, search: string = '') => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/admin/products?page=${page}&search=${encodeURIComponent(search)}`);
      setProducts(data.data);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
    } catch (error) {
      console.error('Failed to fetch admin products', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      // Flatten the categories if they are nested, or just use as-is if the backend returns a flat list for dropdowns.
      // Usually /categories returns a tree. We'll flatten them for the dropdown.
      const flatten = (cats: any[], depth = 0): any[] => {
        return cats.reduce((acc, cat) => {
          return [...acc, { ...cat, depth }, ...(cat.children ? flatten(cat.children, depth + 1) : [])];
        }, []);
      };
      setCategories(flatten(data));
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        category_id: product.category_id?.toString() || '',
        price: product.price?.toString() || '',
        sale_price: product.sale_price?.toString() || '',
        status: product.status || 'active',
        badge: product.badge || '',
        badge_color: product.badge_color || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', category_id: '', price: '', sale_price: '', status: 'active', badge: '', badge_color: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.sale_price) delete payload.sale_price;
      if (!payload.badge) {
        payload.badge = '';
        payload.badge_color = '';
      }

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      fetchProducts(currentPage);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save product', error);
      alert('Failed to save product. Please ensure all required fields are filled.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product', error);
      alert('Failed to delete product');
    }
  };

  if (isLoading && products.length === 0) return <div className="py-12 text-center text-text-muted">Loading products view...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-primary">Products Management</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-bg-surface border border-border-subtle rounded-lg pl-9 pr-4 py-2.5 text-sm focus:border-accent-primary/50 outline-none"
            />
          </div>
          <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center shrink-0 gap-2 bg-accent-primary text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add New Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-muted uppercase bg-bg-primary/50 tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Badge</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {products.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-text-muted">No products found.</td></tr>
              ) : products.map((product: any) => (
                <tr key={product.id} className="hover:bg-bg-primary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-bg-primary rounded-lg border border-border-subtle overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                        {product.primary_image_url ? (
                          <img src={product.primary_image_url} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-text-muted">No Img</span>
                        )}
                      </div>
                      <div className="font-medium text-text-primary max-w-[200px] truncate">{product.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bg-primary text-text-muted border border-border-subtle">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <div className="flex flex-col">
                      <span className="text-accent-primary">AED {product.sale_price || product.price}</span>
                      {product.sale_price && <span className="text-[10px] line-through text-text-muted">AED {product.price}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.badge ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: product.badge_color || '#10b981', color: '#fff' }}>
                        {product.badge}
                      </span>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      product.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-bg-primary text-text-muted'
                    }`}>
                      {product.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button onClick={() => handleOpenModal(product)} className="text-text-muted hover:text-accent-primary transition-colors p-2 rounded-lg hover:bg-bg-primary">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-text-muted hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-text-muted">
            Page {currentPage} of {lastPage}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-border-subtle bg-bg-surface text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-bg-primary transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
              disabled={currentPage === lastPage}
              className="px-4 py-2 border border-border-subtle bg-bg-surface text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-bg-primary transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl w-full max-w-2xl shadow-2xl relative my-auto">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle sticky top-0 bg-bg-surface rounded-t-2xl z-10">
              <h3 className="font-display font-bold text-lg text-text-primary">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={handleCloseModal} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle pb-2">Basic Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted ml-1">Name *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary/50 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted ml-1">Category *</label>
                    <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary/50 outline-none appearance-none">
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {'\u00A0\u00A0'.repeat(cat.depth)}{cat.depth > 0 ? '└ ' : ''}{cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted ml-1">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary/50 outline-none appearance-none">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle pb-2">Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted ml-1">Regular Price *</label>
                    <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary/50 outline-none" placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted ml-1">Sale Price (Optional)</label>
                    <input type="number" step="0.01" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary/50 outline-none" placeholder="0.00" />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle pb-2">Visuals</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted ml-1">Badge Text (Optional)</label>
                    <input type="text" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary/50 outline-none" placeholder="e.g. Bestseller, Limited" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted ml-1">Badge Color (Hex)</label>
                    <div className="flex gap-2">
                      <input type="color" value={formData.badge_color || '#10b981'} onChange={e => setFormData({...formData, badge_color: e.target.value})} className="h-10 w-12 rounded bg-bg-primary border border-border-subtle cursor-pointer shrink-0 p-0.5" />
                      <input type="text" value={formData.badge_color} onChange={e => setFormData({...formData, badge_color: e.target.value})} className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary/50 outline-none" placeholder="#10b981" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3 sticky bottom-0 bg-bg-surface pb-2">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-lg text-sm font-bold text-text-muted hover:text-text-primary hover:bg-bg-primary transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold bg-accent-primary text-white hover:opacity-90 transition-all active:scale-[0.98]">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
