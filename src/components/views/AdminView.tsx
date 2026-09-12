import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  X,
  Upload,
  Loader2,
  ImageOff
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, Order, OrderStatus, ProductCategory, HomepageSlot, HOMEPAGE_SLOTS, DEFAULT_SITE_SETTINGS } from '../../types';
import { BRANDS_LIST } from '../../data/mockData';

const PLACEHOLDER_IMAGE = 'https://placehold.co/800x1000/FBE8E4/241A1E?text=JARRO';

export const AdminView: React.FC = () => {
  const {
    products,
    orders,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    resetToDemoData,
    imageUploadConfigured,
    uploadProductImage,
    navigateTo,
    formatBDT,
    siteSettings,
    saveSiteSettings,
    categoryLabel,
    brandLabel,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'categories'>('dashboard');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [editingAdminNote, setEditingAdminNote] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('JARRO Everyday Prints');
  const [formCategory, setFormCategory] = useState<ProductCategory>('kurtis');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState<number>(6500);
  const [formOldPrice, setFormOldPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(15);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formManualImageUrl, setFormManualImageUrl] = useState('');
  const [uploadingCount, setUploadingCount] = useState(0);
  const [imageUploadError, setImageUploadError] = useState('');
  const [formIsNew, setFormIsNew] = useState(true);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formPlacements, setFormPlacements] = useState<HomepageSlot[]>([]);
  const [draftSettings, setDraftSettings] = useState(siteSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState('');
  const [actionError, setActionError] = useState('');

  const handleImageFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImageUploadError('');
    const fileArray = Array.from(files);
    setUploadingCount(prev => prev + fileArray.length);
    const results = await Promise.allSettled(fileArray.map(file => uploadProductImage(file)));
    const uploaded: string[] = [];
    const errors: string[] = [];
    results.forEach(res => {
      if (res.status === 'fulfilled') uploaded.push(res.value);
      else errors.push(res.reason instanceof Error ? res.reason.message : 'Upload failed.');
    });
    if (uploaded.length > 0) setFormImages(prev => [...prev, ...uploaded]);
    if (errors.length > 0) setImageUploadError(errors[0]);
    setUploadingCount(prev => prev - fileArray.length);
  };

  const runAdminAction = async (action: () => Promise<void>, fallbackMessage: string) => {
    setActionError('');
    try { await action(); }
    catch (err) { setActionError(err instanceof Error ? err.message : fallbackMessage); }
  };

  const totalRevenue = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
  const newOrdersCount = orders.filter(o => o.status === 'New').length;
  const confirmedOrdersCount = orders.filter(o => o.status === 'Confirmed' || o.status === 'Processing').length;
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return o.orderNumber.toLowerCase().includes(q) || o.customer.fullName.toLowerCase().includes(q) || o.customer.mobile.includes(q) || o.customer.district.toLowerCase().includes(q);
    }
    return true;
  });
  const filteredProducts = products.filter(p => {
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;
    setProductFormError('');
    setIsSavingProduct(true);
    const finalImages = formImages.length > 0 ? formImages : [PLACEHOLDER_IMAGE];
    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sku = `JR-${formCategory.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newProdData: Omit<Product, 'id'> = {
      sku, name: formName.trim(), slug, brand: formBrand, category: formCategory,
      subtitle: formSubtitle.trim() || 'Comfortable everyday wear',
      description: formDesc.trim() || 'A JARRO piece made for real fits and real comfort.',
      story: 'Designed in Dhaka, stitched and inspected with care before it ships.',
      price: Number(formPrice), oldPrice: formOldPrice > 0 ? Number(formOldPrice) : undefined,
      stock: Number(formStock), images: finalImages,
      variants: [{ id: `v-${Date.now()}-1`, name: formCategory === 'accessories' ? 'Free Size' : 'M', sku: `${sku}-1`, price: Number(formPrice), stock: Number(formStock), inStock: Number(formStock) > 0 }],
      rating: 5.0, reviewCount: 1, isNew: formIsNew, isBestSeller: formIsBestSeller,
      placements: formPlacements, tags: ['New', formCategory]
    };
    try {
      if (editingProduct) { await updateProduct(editingProduct.id, newProdData); setEditingProduct(null); }
      else { await addProduct(newProdData); }
      setIsAddProductModalOpen(false);
      setFormName(''); setFormSubtitle(''); setFormDesc(''); setFormPrice(6500); setFormOldPrice(0); setFormStock(15);
      setFormImages([]); setFormManualImageUrl(''); setFormPlacements([]); setImageUploadError('');
    } catch (err) {
      setProductFormError(err instanceof Error ? err.message : 'Could not save this product. Please try again.');
    } finally { setIsSavingProduct(false); }
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod); setFormName(prod.name); setFormBrand(prod.brand); setFormCategory(prod.category);
    setFormSubtitle(prod.subtitle); setFormDesc(prod.description); setFormPrice(prod.price);
    setFormOldPrice(prod.oldPrice || 0); setFormStock(prod.stock); setFormImages(prod.images || []);
    setFormManualImageUrl(''); setImageUploadError(''); setFormIsNew(!!prod.isNew); setFormIsBestSeller(!!prod.isBestSeller);
    setFormPlacements(prod.placements || []); setIsAddProductModalOpen(true);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard & Metrics', icon: LayoutDashboard },
    { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
    { id: 'products', label: `Products (${products.length})`, icon: Package },
    { id: 'categories', label: 'Storefront & Names', icon: Users }
  ] as const;

  return (
    <div className="bg-[#FDF4F1] min-h-screen pb-20">
      <div className="bg-[#241A1E] text-white px-4 sm:px-8 py-4 border-b border-[#3D2830]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigateTo('home')} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#FDF4F1] transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
              <ArrowLeft className="w-4 h-4" /><span>Back to Store</span>
            </button>
            <div className="border-l border-white/20 pl-3">
              <h1 className="font-serif text-lg font-bold tracking-wider uppercase text-white">JARRO • Executive Management</h1>
              <span className="text-[10px] text-[#C79AA3] tracking-widest uppercase">Dhaka Hub Operations & Catalogue Control</span>
            </div>
          </div>
          <button onClick={() => { if (window.confirm('Reset catalogue and orders to initial demo state?')) resetToDemoData(); }} className="text-xs px-3 py-1.5 rounded bg-white/10 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 transition cursor-pointer flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /><span>Reset Demo Data</span>
          </button>
        </div>
      </div>
      {actionError && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 sm:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700"><AlertTriangle className="w-4 h-4 shrink-0" /><span>{actionError}</span></div>
            <button onClick={() => setActionError('')} className="text-rose-700 hover:text-rose-900 cursor-pointer shrink-0" aria-label="Dismiss"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}
      <div className="bg-white border-b border-[#F0D9DC] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex gap-6 text-xs uppercase tracking-wider font-semibold overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'border-[#241A1E] text-[#241A1E] font-bold' : 'border-transparent text-[#8C6A72] hover:text-[#241A1E]'}`}>
                <Icon className="w-4 h-4" /><span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 bg-white rounded-xl border border-[#F0D9DC]"><span className="text-[10px] uppercase tracking-wider font-bold text-[#C2607D] block">Total Order Revenue</span><h3 className="font-serif text-2xl font-bold text-[#241A1E] mt-1">{formatBDT(totalRevenue)}</h3></div>
              <div className="p-6 bg-white rounded-xl border border-[#F0D9DC]"><span className="text-[10px] uppercase tracking-wider font-bold text-amber-700 block">Pending Verification</span><h3 className="font-serif text-2xl font-bold text-[#241A1E] mt-1">{newOrdersCount} New Orders</h3></div>
              <div className="p-6 bg-white rounded-xl border border-[#F0D9DC]"><span className="text-[10px] uppercase tracking-wider font-bold text-[#25633C] block">Confirmed & In Transit</span><h3 className="font-serif text-2xl font-bold text-[#241A1E] mt-1">{confirmedOrdersCount}</h3></div>
              <div className="p-6 bg-white rounded-xl border border-[#F0D9DC]"><span className="text-[10px] uppercase tracking-wider font-bold text-rose-700 block">Inventory Alerts</span><h3 className="font-serif text-2xl font-bold text-[#241A1E] mt-1">{lowStockProducts.length} Low Stock</h3></div>
            </div>
            {lowStockProducts.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-2"><AlertTriangle className="w-4 h-4" /><span>Low Inventory Warning</span></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{lowStockProducts.map(p => (<div key={p.id} className="p-2.5 bg-white rounded border border-amber-200 flex items-center justify-between text-xs"><strong className="truncate text-[#241A1E]">{p.name}</strong><span className="font-bold text-rose-600">{p.stock} left</span></div>))}</div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search orders" className="text-xs p-2.5 rounded border border-[#EFC9CE] bg-white" />
              <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="text-xs p-2.5 rounded border border-[#EFC9CE] bg-white">
                <option value="all">All statuses</option>
                {['New', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="bg-white rounded-xl border border-[#F0D9DC] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FDF4F1] text-[#8C6A72] uppercase tracking-wider text-[10px]"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
                <tbody>{filteredOrders.map(order => (
                  <tr key={order.id} className="border-t border-[#F0D9DC]">
                    <td className="p-3 font-semibold">{order.orderNumber}</td>
                    <td className="p-3">{order.customer.fullName}<div className="text-[10px] text-[#8C6A72]">{order.customer.mobile}</div></td>
                    <td className="p-3">{formatBDT(order.total)}</td>
                    <td className="p-3"><select value={order.status} onChange={(e) => runAdminAction(() => updateOrderStatus(order.id, e.target.value as OrderStatus), 'Could not update order.')} className="text-xs p-1.5 rounded border border-[#EFC9CE]">{['New', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                    <td className="p-3 text-right"><button onClick={() => { setSelectedOrderForModal(order); setEditingAdminNote(order.adminNotes || ''); }} className="text-[#C2607D] font-semibold">Details</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products" className="text-xs p-2.5 rounded border border-[#EFC9CE] bg-white" />
              <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)} className="text-xs p-2.5 rounded border border-[#EFC9CE] bg-white">
                <option value="all">All departments</option>
                {(['kurtis', 'three-piece', 'co-ords', 'ponchos', 'accessories'] as ProductCategory[]).map(id => <option key={id} value={id}>{categoryLabel(id)}</option>)}
              </select>
              <button onClick={() => { setEditingProduct(null); setFormPlacements([]); setIsAddProductModalOpen(true); }} className="ml-auto text-xs px-4 py-2 bg-[#241A1E] text-white rounded flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Add Product</button>
            </div>
            <div className="bg-white rounded-xl border border-[#F0D9DC] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FDF4F1] text-[#8C6A72] uppercase tracking-wider text-[10px]"><tr><th className="p-3">Product</th><th className="p-3">Dept</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th></tr></thead>
                <tbody>{filteredProducts.map(product => (
                  <tr key={product.id} className="border-t border-[#F0D9DC]">
                    <td className="p-3"><div className="font-semibold">{product.name}</div><div className="text-[10px] text-[#8C6A72]">{brandLabel(product.brand)}</div></td>
                    <td className="p-3">{categoryLabel(product.category)}</td>
                    <td className="p-3">{formatBDT(product.price)}</td>
                    <td className="p-3"><input type="number" defaultValue={product.stock} onBlur={(e) => runAdminAction(() => updateStock(product.id, Number(e.target.value)), 'Could not update stock.')} className="w-16 p-1 border border-[#EFC9CE] rounded text-xs" /></td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleOpenEditProduct(product)} className="p-1.5 text-[#8C6A72] hover:text-[#241A1E]"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => { if (window.confirm(`Delete "${product.name}"?`)) runAdminAction(() => deleteProduct(product.id), 'Could not delete this product.'); }} className="p-1.5 text-[#B98C93] hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-[#F0D9DC] space-y-4">
              <div><h3 className="font-serif text-lg font-bold text-[#241A1E]">Rename categories</h3><p className="text-xs text-[#8C6A72] mt-1">Internal id stays the same so existing products keep working. Only the public name changes.</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['kurtis', 'three-piece', 'co-ords', 'ponchos', 'accessories'] as ProductCategory[]).map((id) => (
                  <label key={id} className="text-xs space-y-1"><span className="uppercase tracking-wider font-bold text-[#8C6A72]">{id}</span>
                    <input value={draftSettings.categoryLabels[id]} onChange={(e) => setDraftSettings((prev) => ({ ...prev, categoryLabels: { ...prev.categoryLabels, [id]: e.target.value } }))} className="w-full p-2.5 rounded-lg border border-[#EFC9CE] text-sm" />
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#F0D9DC] space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#241A1E]">Rename collections / brands</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BRANDS_LIST.map((brand) => (
                  <label key={brand.name} className="text-xs space-y-1"><span className="uppercase tracking-wider font-bold text-[#8C6A72]">{brand.name}</span>
                    <input value={draftSettings.brandLabels[brand.name] ?? brand.name} onChange={(e) => setDraftSettings((prev) => ({ ...prev, brandLabels: { ...prev.brandLabels, [brand.name]: e.target.value } }))} className="w-full p-2.5 rounded-lg border border-[#EFC9CE] text-sm" />
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#F0D9DC] space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#241A1E]">Hero copy</h3>
              <p className="text-xs text-[#8C6A72]">Hero photo comes from any product ticked Hero banner. If none is ticked, the default banner is used.</p>
              {(['heroEyebrow', 'heroTitle', 'heroSubtitle', 'heroCtaPrimary', 'heroCtaSecondary'] as const).map((key) => (
                <label key={key} className="text-xs space-y-1 block"><span className="uppercase tracking-wider font-bold text-[#8C6A72]">{key}</span>
                  {key === 'heroSubtitle' ? (<textarea rows={3} value={draftSettings[key]} onChange={(e) => setDraftSettings((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full p-2.5 rounded-lg border border-[#EFC9CE] text-sm" />) : (<input value={draftSettings[key]} onChange={(e) => setDraftSettings((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full p-2.5 rounded-lg border border-[#EFC9CE] text-sm" />)}
                </label>
              ))}
            </div>
            {settingsError && (<div className="text-xs bg-rose-50 text-rose-800 border border-rose-100 rounded-lg px-3 py-2">{settingsError}</div>)}
            {settingsSaved && (<div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg px-3 py-2">Storefront settings saved. Refresh the homepage to see names and hero copy.</div>)}
            <button type="button" disabled={isSavingSettings} onClick={async () => { setSettingsError(''); setSettingsSaved(false); setIsSavingSettings(true); try { await saveSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...draftSettings }); setSettingsSaved(true); } catch (err) { setSettingsError(err instanceof Error ? err.message : 'Could not save settings.'); } finally { setIsSavingSettings(false); } }} className="px-6 py-3 bg-[#241A1E] text-white text-xs font-bold uppercase tracking-wider rounded-lg disabled:opacity-60">{isSavingSettings ? 'Saving…' : 'Save storefront settings'}</button>
          </div>
        )}
      </div>
      {selectedOrderForModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setSelectedOrderForModal(null)} className="fixed inset-0 bg-black/60" />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-2xl rounded-xl p-6 space-y-4 border border-[#F0D9DC]">
              <div className="flex justify-between"><h3 className="font-serif text-lg font-bold">{selectedOrderForModal.orderNumber}</h3><button onClick={() => setSelectedOrderForModal(null)}><X className="w-5 h-5" /></button></div>
              <p className="text-xs">{selectedOrderForModal.customer.fullName} · {selectedOrderForModal.customer.mobile}</p>
              <p className="text-xs">{selectedOrderForModal.customer.fullAddress}, {selectedOrderForModal.customer.district}</p>
              <ul className="text-xs space-y-1">{selectedOrderForModal.items.map((item, i) => (<li key={i}>{item.quantity} × {item.productName} — {formatBDT(item.totalPrice)}</li>))}</ul>
              <textarea value={editingAdminNote} onChange={(e) => setEditingAdminNote(e.target.value)} className="w-full text-xs p-2.5 border border-[#EFC9CE] rounded" rows={3} />
              <button onClick={() => runAdminAction(async () => { await updateOrderStatus(selectedOrderForModal.id, selectedOrderForModal.status, editingAdminNote); setSelectedOrderForModal(null); }, 'Could not save notes.')} className="px-4 py-2 bg-[#241A1E] text-white text-xs rounded">Save notes</button>
            </div>
          </div>
        </div>
      )}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setIsAddProductModalOpen(false)} className="fixed inset-0 bg-black/60" />
          <div className="min-h-full flex items-center justify-center p-4">
            <form onSubmit={handleSaveProduct} className="relative bg-white w-full max-w-lg rounded-xl p-6 space-y-4 border border-[#F0D9DC] text-xs">
              <div className="flex justify-between items-center"><h3 className="font-serif text-lg font-bold">{editingProduct ? 'Edit product' : 'Add product'}</h3><button type="button" onClick={() => setIsAddProductModalOpen(false)}><X className="w-5 h-5" /></button></div>
              {productFormError && <div className="text-rose-700 bg-rose-50 border border-rose-100 rounded px-3 py-2">{productFormError}</div>}
              <input required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Product name" className="w-full p-2.5 rounded border border-[#EFC9CE]" />
              <div className="grid grid-cols-2 gap-3">
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as ProductCategory)} className="w-full p-2.5 rounded border border-[#EFC9CE]">
                  <option value="kurtis">{categoryLabel('kurtis')}</option>
                  <option value="three-piece">{categoryLabel('three-piece')}</option>
                  <option value="co-ords">{categoryLabel('co-ords')}</option>
                  <option value="ponchos">{categoryLabel('ponchos')}</option>
                  <option value="accessories">{categoryLabel('accessories')}</option>
                </select>
                <select value={formBrand} onChange={(e) => setFormBrand(e.target.value)} className="w-full p-2.5 rounded border border-[#EFC9CE]">{BRANDS_LIST.map(b => <option key={b.name} value={b.name}>{brandLabel(b.name)}</option>)}</select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" required value={formPrice} onChange={(e) => setFormPrice(Number(e.target.value))} className="p-2.5 rounded border border-[#EFC9CE]" />
                <input type="number" value={formOldPrice} onChange={(e) => setFormOldPrice(Number(e.target.value))} className="p-2.5 rounded border border-[#EFC9CE]" />
                <input type="number" value={formStock} onChange={(e) => setFormStock(Number(e.target.value))} className="p-2.5 rounded border border-[#EFC9CE]" />
              </div>
              <input value={formSubtitle} onChange={(e) => setFormSubtitle(e.target.value)} placeholder="Subtitle" className="w-full p-2.5 rounded border border-[#EFC9CE]" />
              <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Description" className="w-full p-2.5 rounded border border-[#EFC9CE]" rows={3} />
              <div>
                <span className="font-bold uppercase tracking-wider block mb-1">Photos</span>
                {imageUploadConfigured && (<label className="flex items-center gap-2 cursor-pointer text-[#241A1E] mb-2"><Upload className="w-4 h-4" /><input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageFilesSelected(e.target.files)} /><span>Upload to S3</span>{uploadingCount > 0 && <Loader2 className="w-4 h-4 animate-spin" />}</label>)}
                {imageUploadError && <p className="text-rose-700 mb-2">{imageUploadError}</p>}
                <div className="flex gap-2 mb-2">
                  <input value={formManualImageUrl} onChange={(e) => setFormManualImageUrl(e.target.value)} placeholder="Or paste image URL" className="flex-1 p-2.5 rounded border border-[#EFC9CE]" />
                  <button type="button" onClick={() => { if (formManualImageUrl.trim()) { setFormImages(prev => [...prev, formManualImageUrl.trim()]); setFormManualImageUrl(''); } }} className="px-3 border border-[#EFC9CE] rounded">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formImages.length === 0 && <div className="text-[#A8828A] flex items-center gap-1"><ImageOff className="w-4 h-4" />No photos yet</div>}
                  {formImages.map((url, i) => (<div key={url + i} className="relative w-16 h-20 rounded overflow-hidden border border-[#EFC9CE]"><img src={url} alt="" className="w-full h-full object-cover" /><button type="button" onClick={() => setFormImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-black/60 text-white p-0.5"><X className="w-3 h-3" /></button></div>))}
                </div>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formIsNew} onChange={(e) => setFormIsNew(e.target.checked)} className="accent-[#241A1E]" />Mark as New Arrival</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formIsBestSeller} onChange={(e) => setFormIsBestSeller(e.target.checked)} className="accent-[#241A1E]" />Mark as Best Seller</label>
              <div className="pt-3 border-t border-[#F0D9DC] space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C6A72] block">Show this product on</span>
                <p className="text-[11px] text-[#A8828A]">Department still controls the shop. Tick extra slots to also pin this product on the homepage.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{HOMEPAGE_SLOTS.map((slot) => (<label key={slot.id} className="flex items-center gap-2 text-[11px] font-medium text-[#241A1E]"><input type="checkbox" checked={formPlacements.includes(slot.id)} onChange={(e) => { setFormPlacements((prev) => e.target.checked ? [...prev, slot.id] : prev.filter((id) => id !== slot.id)); }} className="accent-[#241A1E]" /><span>{slot.label}</span></label>))}</div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddProductModalOpen(false)} className="px-4 py-2 border border-[#EFC9CE] rounded">Cancel</button>
                <button type="submit" disabled={isSavingProduct || uploadingCount > 0} className="px-6 py-2 bg-[#241A1E] text-white font-bold uppercase tracking-wider rounded disabled:opacity-60">{isSavingProduct ? 'Saving…' : uploadingCount > 0 ? 'Uploading photos…' : editingProduct ? 'Update Product' : 'Save & Publish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
