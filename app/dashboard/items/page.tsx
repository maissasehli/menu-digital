'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Restaurant, Category, Item } from '@/types'

export default function ItemsPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('all')
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', image_url: '' })
  const [focused, setFocused] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editUploading, setEditUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data: resto } = await supabase.from('restaurants').select('*').eq('user_id', session.user.id).single()
      if (!resto) { router.push('/login'); return }
      const [{ data: cats }, { data: allItems }] = await Promise.all([
        supabase.from('categories').select('*').eq('restaurant_id', resto.id).order('position'),
        supabase.from('items').select('*, categories!inner(restaurant_id)').eq('categories.restaurant_id', resto.id).order('position'),
      ])
      setRestaurant(resto)
      setCategories(cats || [])
      setItems(allItems || [])
      if (cats && cats.length > 0) setForm(f => ({ ...f, category_id: cats[0].id }))
      setLoading(false)
    }
    load()
  }, [router])

  // Upload image to Cloudinary via API route
  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) return null
    const data = await res.json()
    return data.url ?? null
  }

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = e => setPreviewUrl(e.target?.result as string)
    reader.readAsDataURL(file)
    const url = await uploadFile(file)
    if (url) {
      setForm(f => ({ ...f, image_url: url }))
      setPreviewUrl(url)
    }
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleEditFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setEditUploading(true)
    const reader = new FileReader()
    reader.onload = e => setEditImageUrl(e.target?.result as string)
    reader.readAsDataURL(file)
    const url = await uploadFile(file)
    if (url) setEditImageUrl(url)
    setEditUploading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category_id) return
    setSaving(true)
    const { data } = await supabase.from('items').insert({
      category_id: form.category_id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      image_url: form.image_url || null,
      is_available: true,
      position: items.length,
    }).select().single()
    if (data) setItems(prev => [...prev, data])
    setForm(f => ({ ...f, name: '', description: '', price: '', image_url: '' }))
    setPreviewUrl(null)
    setSaving(false)
  }

  const toggleAvailable = async (item: Item) => {
    await supabase.from('items').update({ is_available: !item.is_available }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
  }

  const handleDelete = async (id: string) => {
    await supabase.from('items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const openEdit = (item: Item) => {
    setEditingItem(item)
    setEditImageUrl(item.image_url || '')
  }

  const saveEdit = async () => {
    if (!editingItem) return
    const { data } = await supabase.from('items')
      .update({ image_url: editImageUrl || null })
      .eq('id', editingItem.id)
      .select().single()
    if (data) setItems(prev => prev.map(i => i.id === data.id ? data : i))
    setEditingItem(null)
    setEditImageUrl('')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#09090a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid rgba(181,137,58,.2)', borderTopColor: '#b5893a', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const filteredItems = filterCat === 'all' ? items : items.filter(i => i.category_id === filterCat)
  const available = items.filter(i => i.is_available).length

  return (
    <div className="root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500;600;700&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --gold:#b5893a;
          --bg:#09090a;
          --surface:#111113;
          --surface2:#18181b;
          --border:rgba(255,255,255,0.07);
          --border-gold:rgba(181,137,58,0.25);
          --txt:#f4f0e8;
          --muted:rgba(244,240,232,0.45);
          --dim:rgba(244,240,232,0.22);
          --display:'Playfair Display',Georgia,serif;
          --body:'Jost',-apple-system,sans-serif;
        }
        body{background:var(--bg);color:var(--txt);font-family:var(--body);-webkit-font-smoothing:antialiased}

        .root{min-height:100vh;background:var(--bg);position:relative;overflow-x:hidden}

        /* NAV */
        .nav{
          position:sticky;top:0;z-index:40;
          border-bottom:1px solid var(--border);
          background:rgba(9,9,10,.85);backdrop-filter:blur(24px);
        }
        .nav-inner{
          max-width:1100px;margin:0 auto;
          padding:15px 24px;
          display:flex;align-items:center;justify-content:space-between;
        }
        .logo{font-family:var(--display);font-size:20px;font-weight:400;color:var(--txt);text-decoration:none;letter-spacing:.02em}
        .logo b{color:var(--gold)}
        .back{
          display:flex;align-items:center;gap:6px;
          font-size:12.5px;color:var(--muted);text-decoration:none;
          transition:color .2s;letter-spacing:.04em;
        }
        .back:hover{color:var(--txt)}

        /* CONTENT */
        .content{max-width:1100px;margin:0 auto;padding:40px 24px 80px}

        /* PAGE HEADER */
        .ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;gap:16px;flex-wrap:wrap}
        .ph-left{display:flex;align-items:center;gap:16px}
        .ph-icon{
          width:52px;height:52px;border-radius:16px;
          background:rgba(181,137,58,.1);border:1px solid var(--border-gold);
          display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0;
        }
        .ph-title{font-family:var(--display);font-size:28px;font-weight:400;font-style:italic;margin-bottom:3px}
        .ph-sub{font-size:13px;color:var(--muted);font-weight:300}

        /* MINI STATS */
        .stats{display:flex;align-items:center;gap:20px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:12px 20px}
        .stat{text-align:center}
        .stat-val{display:block;font-family:var(--display);font-size:22px;font-weight:600;line-height:1}
        .stat-lbl{font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-top:3px}
        .stat-sep{width:1px;height:28px;background:var(--border)}

        /* FORM CARD */
        .fc{
          position:relative;border:1px solid var(--border);background:var(--surface);
          border-radius:20px;padding:28px;margin-bottom:32px;overflow:hidden;
        }
        .fc::before{
          content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
          width:180px;height:1px;
          background:linear-gradient(90deg,transparent,var(--gold),transparent);
        }
        .fc-title{font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:22px}
        .fc-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
        .fc-grid-3{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-bottom:14px}

        /* FIELDS */
        .field{display:flex;flex-direction:column;gap:7px}
        .field-lbl{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);transition:color .2s}
        .field.focus .field-lbl{color:var(--gold)}
        .field-wrap{position:relative;display:flex;align-items:center}
        .field-icon{position:absolute;left:13px;color:var(--dim);pointer-events:none;transition:color .2s}
        .field.focus .field-icon{color:var(--gold)}
        .field-input,.field-select{
          width:100%;background:var(--surface2);border:1px solid var(--border);
          border-radius:12px;padding:12px 14px 12px 38px;
          font-size:13.5px;color:var(--txt);outline:none;font-family:var(--body);
          transition:border-color .2s,box-shadow .2s;font-weight:400;
        }
        .field-select{padding-left:14px;appearance:none;cursor:pointer}
        .field-select option{background:#18181b}
        .field-input::placeholder{color:var(--dim)}
        .field.focus .field-input{border-color:rgba(181,137,58,.45);box-shadow:0 0 0 3px rgba(181,137,58,.06)}
        .field.focus .field-select{border-color:rgba(181,137,58,.45)}
        .field-pl{padding-left:14px!important}
        .field-opt{font-size:10px;font-weight:400;color:var(--dim);text-transform:none;letter-spacing:0}

        /* IMAGE UPLOAD */
        .img-upload-area{
          border:1.5px dashed var(--border);border-radius:14px;
          overflow:hidden;transition:border-color .25s,background .25s;
          cursor:pointer;
        }
        .img-upload-area:hover,.img-upload-area.drag{border-color:rgba(181,137,58,.45);background:rgba(181,137,58,.03)}
        .img-upload-empty{
          padding:28px 20px;
          display:flex;flex-direction:column;align-items:center;gap:10px;
          text-align:center;
        }
        .img-upload-icon{
          width:48px;height:48px;border-radius:12px;
          background:rgba(181,137,58,.08);border:1px solid var(--border-gold);
          display:flex;align-items:center;justify-content:center;color:var(--gold);
        }
        .img-upload-lbl{font-size:13px;font-weight:500;color:var(--muted)}
        .img-upload-sub{font-size:11px;color:var(--dim);font-weight:300}
        .img-upload-btn{
          display:inline-flex;align-items:center;gap:6px;
          background:var(--gold);border:none;border-radius:9px;
          padding:8px 16px;font-size:12px;font-weight:600;color:#09090a;
          cursor:pointer;font-family:var(--body);transition:opacity .2s;
        }
        .img-upload-btn:hover{opacity:.85}
        .img-preview-wrap{position:relative}
        .img-preview{width:100%;height:180px;object-fit:cover;display:block}
        .img-preview-actions{
          position:absolute;top:10px;right:10px;
          display:flex;gap:6px;
        }
        .img-action-btn{
          background:rgba(0,0,0,.7);backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,.12);border-radius:8px;
          padding:6px 10px;font-size:11px;font-weight:600;
          cursor:pointer;font-family:var(--body);transition:background .2s;
          display:flex;align-items:center;gap:5px;
        }
        .img-action-btn.change{color:var(--gold)}
        .img-action-btn.remove{color:#f87171}
        .img-action-btn:hover{background:rgba(0,0,0,.9)}
        .img-uploading{
          padding:28px;display:flex;flex-direction:column;align-items:center;gap:12px;
        }
        .spinner-gold{
          width:28px;height:28px;border-radius:50%;
          border:2px solid rgba(181,137,58,.2);border-top-color:var(--gold);
          animation:spin .7s linear infinite;
        }

        /* SUBMIT */
        .submit-btn{
          display:flex;align-items:center;justify-content:center;gap:8px;
          width:100%;background:var(--gold);border:none;border-radius:13px;
          padding:14px;font-size:14px;font-weight:600;color:#09090a;
          cursor:pointer;font-family:var(--body);letter-spacing:.02em;
          transition:opacity .2s,transform .15s;margin-top:4px;
        }
        .submit-btn:hover:not(:disabled){opacity:.88;transform:translateY(-1px)}
        .submit-btn:disabled{opacity:.45;cursor:not-allowed}
        .submit-spinner{width:15px;height:15px;border-radius:50%;border:2px solid rgba(9,9,10,.3);border-top-color:#09090a;animation:spin .7s linear infinite}

        /* NO CATS BANNER */
        .no-cats{
          display:flex;align-items:center;gap:10px;
          border:1px solid rgba(251,191,36,.15);background:rgba(251,191,36,.05);
          border-radius:13px;padding:14px 18px;font-size:13.5px;
          color:rgba(251,191,36,.75);margin-bottom:28px;font-weight:300;
        }
        .no-cats a{margin-left:auto;font-weight:600;color:var(--gold);text-decoration:none}

        /* FILTER */
        .filter-wrap{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:20px}
        .filter-btn{
          background:var(--surface2);border:1px solid var(--border);
          border-radius:100px;padding:6px 16px;
          font-size:12px;font-weight:500;color:var(--muted);
          cursor:pointer;font-family:var(--body);transition:all .2s;
        }
        .filter-btn:hover{color:var(--txt);border-color:var(--border-gold)}
        .filter-btn.on{background:rgba(181,137,58,.12);border-color:var(--border-gold);color:var(--gold)}

        /* ITEM ROWS */
        .items-list{display:flex;flex-direction:column;gap:8px}
        .item-row{
          display:flex;align-items:center;gap:0;
          border:1px solid var(--border);background:var(--surface);
          border-radius:15px;overflow:hidden;
          transition:border-color .2s,transform .2s;
        }
        .item-row:hover{border-color:var(--border-gold);transform:translateY(-1px)}

        .item-thumb{
          width:72px;height:72px;flex-shrink:0;overflow:hidden;
          border-right:1px solid var(--border);cursor:pointer;position:relative;
        }
        .item-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}
        .item-row:hover .item-thumb img{transform:scale(1.08)}
        .item-thumb-edit{
          position:absolute;inset:0;background:rgba(0,0,0,0);
          display:flex;align-items:center;justify-content:center;
          opacity:0;transition:all .2s;font-size:18px;
        }
        .item-row:hover .item-thumb-edit{background:rgba(0,0,0,.4);opacity:1}
        .item-placeholder{
          width:72px;height:72px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          background:var(--surface2);font-size:22px;
          border-right:1px solid var(--border);cursor:pointer;
          position:relative;
        }
        .item-placeholder-hint{
          position:absolute;inset:0;background:rgba(0,0,0,0);
          display:flex;align-items:center;justify-content:center;
          opacity:0;transition:all .2s;font-size:11px;font-weight:600;
          color:var(--gold);
        }
        .item-row:hover .item-placeholder-hint{background:rgba(0,0,0,.45);opacity:1}

        .item-info{flex:1;padding:12px 16px;min-width:0}
        .item-name{font-family:var(--display);font-size:15px;font-weight:500;margin-bottom:2px}
        .item-cat{
          font-size:10.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
          color:var(--dim);margin-bottom:4px;
        }
        .item-desc{font-size:12px;color:var(--muted);font-weight:300;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

        .item-actions{display:flex;align-items:center;gap:8px;padding:0 14px;flex-shrink:0}
        .item-price{
          font-family:var(--display);font-size:16px;font-weight:600;
          color:var(--gold);white-space:nowrap;
        }
        .item-price span{font-size:10px;font-weight:300;opacity:.65;font-family:var(--body);margin-left:2px}

        .toggle{
          display:flex;align-items:center;gap:5px;
          border-radius:100px;padding:4px 11px;
          font-size:10.5px;font-weight:600;cursor:pointer;
          border:none;font-family:var(--body);transition:all .2s;
        }
        .toggle-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
        .toggle.on{background:rgba(34,197,94,.1);color:#4ade80;border:1px solid rgba(34,197,94,.2)}
        .toggle.on .toggle-dot{background:#4ade80;box-shadow:0 0 5px #4ade80}
        .toggle.off{background:var(--surface2);color:var(--dim);border:1px solid var(--border)}
        .toggle.off .toggle-dot{background:var(--dim)}

        .del-btn{
          background:none;border:1px solid var(--border);border-radius:9px;
          padding:7px;color:var(--dim);cursor:pointer;
          display:flex;align-items:center;transition:all .2s;
        }
        .del-btn:hover{color:#f87171;border-color:rgba(248,113,113,.3);background:rgba(248,113,113,.06)}

        /* EDIT MODAL */
        .modal-backdrop{
          position:fixed;inset:0;z-index:200;
          background:rgba(0,0,0,.85);backdrop-filter:blur(8px);
          display:flex;align-items:center;justify-content:center;padding:20px;
          animation:fadeIn .2s ease;
        }
        .modal{
          width:100%;max-width:460px;background:var(--surface);
          border:1px solid var(--border-gold);border-radius:22px;
          overflow:hidden;animation:scaleIn .25s ease;
        }
        .modal-top{
          display:flex;align-items:center;gap:1px;
          position:absolute;top:0;left:50%;transform:translateX(-50%);
          width:120px;height:1px;
          background:linear-gradient(90deg,transparent,var(--gold),transparent);
        }
        .modal-header{padding:22px 24px 16px;border-bottom:1px solid var(--border)}
        .modal-title{font-family:var(--display);font-size:20px;font-weight:400;font-style:italic}
        .modal-sub{font-size:12px;color:var(--muted);margin-top:3px;font-weight:300}
        .modal-body{padding:20px 24px}
        .modal-footer{padding:0 24px 22px;display:flex;gap:10px}
        .modal-cancel{
          flex:1;background:var(--surface2);border:1px solid var(--border);
          border-radius:12px;padding:12px;font-size:13.5px;font-weight:500;
          color:var(--muted);cursor:pointer;font-family:var(--body);transition:all .2s;
        }
        .modal-cancel:hover{color:var(--txt)}
        .modal-save{
          flex:1;background:var(--gold);border:none;border-radius:12px;
          padding:12px;font-size:13.5px;font-weight:600;color:#09090a;
          cursor:pointer;font-family:var(--body);transition:opacity .2s;
        }
        .modal-save:hover{opacity:.88}

        /* EMPTY */
        .empty{
          border:1px dashed var(--border);border-radius:18px;
          padding:60px 24px;text-align:center;
        }
        .empty-icon{font-size:44px;margin-bottom:16px}
        .empty-title{font-family:var(--display);font-size:20px;font-weight:400;font-style:italic;margin-bottom:8px}
        .empty-sub{font-size:13px;color:var(--muted);font-weight:300;max-width:300px;margin:0 auto 24px;line-height:1.7}
        .empty-link{
          display:inline-block;text-decoration:none;
          background:var(--gold);color:#09090a;
          font-size:13px;font-weight:600;
          padding:11px 24px;border-radius:12px;
          transition:opacity .2s;
        }
        .empty-link:hover{opacity:.85}

        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}

        @media(max-width:800px){
          .fc-grid,.fc-grid-3{grid-template-columns:1fr}
          .ph{flex-direction:column;align-items:flex-start}
          .stats{align-self:stretch;justify-content:space-around}
          .item-actions{flex-wrap:wrap;justify-content:flex-end;padding:8px 10px}
        }
        @media(max-width:560px){
          .content{padding:28px 16px 60px}
          .item-row{flex-wrap:wrap}
          .item-actions{flex:1;justify-content:flex-end}
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/dashboard" className="logo">Menu<b>Digital</b></Link>
          <Link href="/dashboard" className="back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="content">

        {/* PAGE HEADER */}
        <div className="ph">
          <div className="ph-left">
            <div className="ph-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
            <div>
              <div className="ph-title">Plats</div>
              <div className="ph-sub">Gérez les plats et leurs photos</div>
            </div>
          </div>
          <div className="stats">
            <div className="stat">
              <span className="stat-val" style={{ color: '#f4f0e8' }}>{items.length}</span>
              <div className="stat-lbl">Total</div>
            </div>
            <div className="stat-sep" />
            <div className="stat">
              <span className="stat-val" style={{ color: '#4ade80' }}>{available}</span>
              <div className="stat-lbl">Dispo</div>
            </div>
            <div className="stat-sep" />
            <div className="stat">
              <span className="stat-val" style={{ color: '#b5893a' }}>{items.filter(i => i.image_url).length}</span>
              <div className="stat-lbl">Avec photo</div>
            </div>
          </div>
        </div>

        {/* ADD FORM */}
        {categories.length === 0 ? (
          <div className="no-cats">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Créez d abord une catégorie avant d ajouter des plats.
            <Link href="/dashboard/categories">Créer →</Link>
          </div>
        ) : (
          <div className="fc">
            <div className="fc-title">Ajouter un nouveau plat</div>
            <form onSubmit={handleAdd}>
              {/* Name + Category */}
              <div className="fc-grid">
                <div className={`field${focused === 'name' ? ' focus' : ''}`}>
                  <label className="field-lbl">Nom du plat</label>
                  <div className="field-wrap">
                    <svg className="field-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <input className="field-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} placeholder="Couscous Royal, Brik…" required />
                  </div>
                </div>
                <div className={`field${focused === 'cat' ? ' focus' : ''}`}>
                  <label className="field-lbl">Catégorie</label>
                  <div className="field-wrap">
                    <select className="field-select" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} onFocus={() => setFocused('cat')} onBlur={() => setFocused(null)}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description + Price */}
              <div className="fc-grid-3">
                <div className={`field${focused === 'desc' ? ' focus' : ''}`}>
                  <label className="field-lbl">Description <span className="field-opt">— optionnel</span></label>
                  <div className="field-wrap">
                    <input className="field-input field-pl" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)} placeholder="Ingrédients, allergènes…" />
                  </div>
                </div>
                <div className={`field${focused === 'price' ? ' focus' : ''}`}>
                  <label className="field-lbl">Prix (TND)</label>
                  <div className="field-wrap">
                    <svg className="field-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <input className="field-input" type="number" step="0.001" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} onFocus={() => setFocused('price')} onBlur={() => setFocused(null)} placeholder="12.500" required />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="field" style={{ marginBottom: 18 }}>
                <label className="field-lbl">Photo du plat <span className="field-opt">— optionnel</span></label>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} />
                <div
                  className={`img-upload-area${dragOver ? ' drag' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => !previewUrl && !uploading && fileRef.current?.click()}
                >
                  {uploading ? (
                    <div className="img-uploading">
                      <div className="spinner-gold" />
                      <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300 }}>Envoi en cours…</span>
                    </div>
                  ) : previewUrl ? (
                    <div className="img-preview-wrap">
                      <img className="img-preview" src={previewUrl} alt="preview" />
                      <div className="img-preview-actions">
                        <button type="button" className="img-action-btn change" onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Changer
                        </button>
                        <button type="button" className="img-action-btn remove" onClick={e => { e.stopPropagation(); setPreviewUrl(null); setForm(f => ({ ...f, image_url: '' })) }}>
                          ✕ Retirer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="img-upload-empty">
                      <div className="img-upload-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <div className="img-upload-lbl">Glissez une photo ici</div>
                      <div className="img-upload-sub">JPG, PNG, WEBP · Max 10 Mo</div>
                      <button type="button" className="img-upload-btn" onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Parcourir
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={saving || uploading} className="submit-btn">
                {saving ? <><span className="submit-spinner" /> Ajout…</> : '+ Ajouter le plat'}
              </button>
            </form>
          </div>
        )}

        {/* FILTER */}
        {items.length > 0 && (
          <div className="filter-wrap">
            <button className={`filter-btn${filterCat === 'all' ? ' on' : ''}`} onClick={() => setFilterCat('all')}>
              Tout ({items.length})
            </button>
            {categories.map(c => {
              const n = items.filter(i => i.category_id === c.id).length
              return (
                <button key={c.id} className={`filter-btn${filterCat === c.id ? ' on' : ''}`} onClick={() => setFilterCat(c.id)}>
                  {c.name} ({n})
                </button>
              )
            })}
          </div>
        )}

        {/* ITEMS LIST */}
        {filteredItems.length > 0 ? (
          <div className="items-list">
            {filteredItems.map(item => {
              const cat = categories.find(c => c.id === item.category_id)
              return (
                <div key={item.id} className="item-row">
                  {item.image_url ? (
                    <div className="item-thumb" onClick={() => openEdit(item)} title="Modifier la photo">
                      <img src={item.image_url} alt={item.name} />
                      <div className="item-thumb-edit">✏️</div>
                    </div>
                  ) : (
                    <div className="item-placeholder" onClick={() => openEdit(item)} title="Ajouter une photo">
                      🍽️
                      <div className="item-placeholder-hint">+ Photo</div>
                    </div>
                  )}
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    {cat && <div className="item-cat">{cat.name}</div>}
                    {item.description && <div className="item-desc">{item.description}</div>}
                  </div>
                  <div className="item-actions">
                    <div className="item-price">
                      {Number(item.price).toFixed(3)}
                      <span>TND</span>
                    </div>
                    <button className={`toggle${item.is_available ? ' on' : ' off'}`} onClick={() => toggleAvailable(item)}>
                      <span className="toggle-dot" />
                      {item.is_available ? 'Dispo' : 'Indispo'}
                    </button>
                    <button className="del-btn" onClick={() => handleDelete(item.id)} title="Supprimer">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : items.length > 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: 13, color: 'var(--dim)' }}>Aucun plat dans cette catégorie.</div>
        ) : (
          <div className="empty">
            <div className="empty-icon">🍽️</div>
            <div className="empty-title">Votre menu est vide</div>
            <div className="empty-sub">Ajoutez votre premier plat en remplissant le formulaire ci-dessus.</div>
          </div>
        )}
      </div>

      {/* EDIT IMAGE MODAL */}
      {editingItem && (
        <div className="modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative' }}>
              <div className="modal-top" />
            </div>
            <div className="modal-header">
              <div className="modal-title">{editingItem.name}</div>
              <div className="modal-sub">Modifier la photo du plat</div>
            </div>
            <div className="modal-body">
              <input ref={editFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleEditFileSelect(f) }} />
              <div
                className={`img-upload-area`}
                style={{ cursor: 'pointer' }}
                onClick={() => !editUploading && editFileRef.current?.click()}
              >
                {editUploading ? (
                  <div className="img-uploading">
                    <div className="spinner-gold" />
                    <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 300 }}>Envoi en cours…</span>
                  </div>
                ) : editImageUrl ? (
                  <div className="img-preview-wrap">
                    <img className="img-preview" src={editImageUrl} alt="preview" />
                    <div className="img-preview-actions">
                      <button type="button" className="img-action-btn change" onClick={e => { e.stopPropagation(); editFileRef.current?.click() }}>✏️ Changer</button>
                      <button type="button" className="img-action-btn remove" onClick={e => { e.stopPropagation(); setEditImageUrl('') }}>✕ Retirer</button>
                    </div>
                  </div>
                ) : (
                  <div className="img-upload-empty">
                    <div className="img-upload-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <div className="img-upload-lbl">Cliquez pour ajouter une photo</div>
                    <div className="img-upload-sub">JPG, PNG, WEBP</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setEditingItem(null)}>Annuler</button>
              <button className="modal-save" onClick={saveEdit} disabled={editUploading}>
                {editUploading ? 'Envoi…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}