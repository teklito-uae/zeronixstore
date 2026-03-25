import { useEffect, useState, useRef } from 'react';
import { api } from '../../lib/api';
import { Edit, Trash2, Plus, X, Upload } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id ? category.parent_id.toString() : '',
      });
      setImagePreview(category.image_url || null);
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', parent_id: '' });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    if (formData.description) submitData.append('description', formData.description);
    if (formData.parent_id) submitData.append('parent_id', formData.parent_id);
    if (imageFile) submitData.append('image', imageFile);

    try {
      if (editingCategory) {
        // Method spoofing for PUT request with FormData
        submitData.append('_method', 'PUT');
        await api.post(`/admin/categories/${editingCategory.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/categories', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category', error);
      alert('Failed to save category. Check console for details.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? Sub-categories and products might be affected.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category', error);
      alert('Failed to delete category');
    }
  };

  // Flatten categories recursively for display to show all levels clearly
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

  if (isLoading) return <div className="py-12 text-center text-text-muted">Loading categories view...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-primary">Categories Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-accent-primary text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-muted uppercase bg-bg-primary/50 tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Hierarchy</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {flattenedCategories.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-text-muted">No categories found.</td></tr>
              ) : flattenedCategories.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-bg-primary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-4 ${cat.isChild ? 'ml-8' : ''}`}>
                      <div className="h-10 w-10 bg-bg-primary rounded-lg border border-border-subtle overflow-hidden flex-shrink-0 p-1 flex items-center justify-center text-text-muted">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-text-muted/50">No Img</span>
                        )}
                      </div>
                      <div className="font-medium text-text-primary">{cat.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cat.isChild ? 'bg-bg-primary text-text-muted border border-border-subtle' : 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
                    }`}>
                      {cat.isChild ? `Sub of ${cat.parentName}` : 'Main Category'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-muted font-mono text-xs">
                    {cat.slug}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(cat)} className="text-text-muted hover:text-accent-primary transition-colors p-2 rounded-lg hover:bg-bg-primary">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-text-muted hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-6 border-b border-border-subtle">
              <h3 className="font-display font-bold text-lg text-text-primary">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={handleCloseModal} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted ml-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-accent-primary/50 focus:ring-4 focus:ring-accent-primary/10 transition-all outline-none"
                  placeholder="E.g. Gaming Laptops"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted ml-1">Parent Category</label>
                <select
                  value={formData.parent_id}
                  onChange={e => setFormData({...formData, parent_id: e.target.value})}
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-accent-primary/50 focus:ring-4 focus:ring-accent-primary/10 transition-all outline-none appearance-none"
                >
                  <option value="">None (Main Category)</option>
                  {flattenedCategories.map(parent => (
                    // Don't let a category be its own parent
                    (!editingCategory || parent.id !== editingCategory.id) && (
                      <option key={parent.id} value={parent.id}>
                        {'\u00A0\u00A0'.repeat(parent.depth)}{parent.depth > 0 ? '└ ' : ''}{parent.name}
                      </option>
                    )
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted ml-1">Icon/Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 w-full bg-bg-primary border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all relative overflow-hidden group"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-2" />
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full bg-bg-surface flex items-center justify-center text-text-muted group-hover:text-accent-primary group-hover:scale-110 transition-all shadow-sm">
                        <Upload className="h-4 w-4" />
                      </div>
                      <span className="text-xs text-text-muted font-medium">Click to upload image</span>
                    </>
                  )}
                  {imagePreview && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <span className="text-white text-xs font-bold">Change Image</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold text-text-muted hover:text-text-primary hover:bg-bg-primary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-lg text-sm font-bold bg-accent-primary text-white hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
