import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ServiceOrder, MaterialType } from './types';
import OSForm from './components/OSForm';
import OSPreview from './components/OSPreview';
import OSHistory from './components/OSHistory';
import { 
  FileText, Menu, X, Home, LayoutDashboard,
  Printer, 
  Download, 
  Clipboard, 
  Sparkles, 
  RotateCw, 
  FileSpreadsheet,
  AlertTriangle,
  HelpCircle,
  Copy,
  FolderOpen,
  Info, Save, Upload, Instagram, MessageCircle, Layers, CheckCircle2, Clock3, PenTool, ShieldCheck, ChevronRight, Moon, Sun, BookOpen, ArrowLeft, Database, ClipboardList, PrinterCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

// Default initial visual blueprint image SVG
const VECTOR_BLUEPRINT_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'><rect width='400' height='250' fill='%23fafafa'/><rect x='20' y='20' width='360' height='210' rx='10' fill='none' stroke='%233b82f6' stroke-width='2' stroke-dasharray='6'/><circle cx='200' cy='125' r='55' fill='%23eff6ff' stroke='%232563eb' stroke-width='3'/><text x='200' y='120' font-family='sans-serif' font-size='15' font-weight='bold' fill='%231e3a8a' text-anchor='middle'>REFERÊNCIA VISUAL</text><text x='200' y='140' font-family='sans-serif' font-size='10' font-weight='800' fill='%232563eb' text-anchor='middle'>✔ CORTE ELETRÔNICO</text><rect x='110' y='170' width='180' height='22' rx='4' fill='%231e293b'/><text x='200' y='184' font-family='monospace' font-size='9' fill='%23f1f5f9' text-anchor='middle'>AD_CORTE_FRENTE.AI</text></svg>";

const DEFAULT_ORDERS: ServiceOrder[] = [
  {
    id: 'os-default-1',
    osNumber: 'OS-1001',
    dataEmissao: new Date().toISOString().split('T')[0],
    dataEntrega: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clienteNome: '',
    clienteContato: '',
    vendedor: '',
    designer: '',
    material: 'Adesivo',
    largura: 1.00,
    altura: 1.00,
    quantidade: 1,
    detalhes: {
      recorte: 'Sem Recorte',
      acabamento: 'Sem Acabamento',
      aplicacao: 'Vidro / Vitrine',
    },
    observacoes: '',
    pastedImage: null,
    imageFit: 'contain',
    imageRotation: 0,
    companyName: 'Sua empresa',
    companyPhone: '',
    status: 'producao'
  }
];

const SHOW_LOCK_SCREEN = false;

export default function App() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [activeOSId, setActiveOSId] = useState<string>(() => localStorage.getItem('traco-os-active-id') || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [storageError, setStorageError] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('traco-os-theme') === 'dark');
  const [activeTab, setActiveTab] = useState<'home' | 'workspace' | 'about'>(() => {
    const saved = localStorage.getItem('traco-os-active-tab');
    return saved === 'workspace' || saved === 'about' ? saved : 'home';
  });
  const [previewOS, setPreviewOS] = useState<ServiceOrder | null>(null);
  const [historyOrders, setHistoryOrders] = useState<ServiceOrder[]>([]);
  const [showCompactPreview, setShowCompactPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('traco-os-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('traco-os-active-tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (activeOSId) localStorage.setItem('traco-os-active-id', activeOSId);
  }, [activeOSId]);

  useEffect(() => {
    const key = `traco-os-scroll-${activeTab}`;
    const saved = Number(localStorage.getItem(key) || 0);
    const restoreFrame = window.requestAnimationFrame(() => window.scrollTo(0, saved));
    let saveTimer = 0;
    const saveScroll = () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => localStorage.setItem(key, String(window.scrollY)), 160);
    };
    window.addEventListener('scroll', saveScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(restoreFrame);
      window.clearTimeout(saveTimer);
      window.removeEventListener('scroll', saveScroll);
    };
  }, [activeTab]);


  // 1. Load data from localStorage on startup
  useEffect(() => {
    const stored = localStorage.getItem('visual_comm_os_list');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ServiceOrder[];
        if (parsed.length > 0) {
          setOrders(parsed);
          const savedId = localStorage.getItem('traco-os-active-id');
          setActiveOSId(parsed.some((order) => order.id === savedId) ? savedId! : parsed[0].id);
        } else {
          setOrders(DEFAULT_ORDERS);
          setActiveOSId(DEFAULT_ORDERS[0].id);
        }
      } catch (e) {
        console.error('Falha ao restaurar do localStorage', e);
        setOrders(DEFAULT_ORDERS);
        setActiveOSId(DEFAULT_ORDERS[0].id);
      }
    } else {
      setOrders(DEFAULT_ORDERS);
      setActiveOSId(DEFAULT_ORDERS[0].id);
    }
  }, []);

  // 2. Persist after a short pause, avoiding JSON serialization on every keystroke.
  useEffect(() => {
    if (orders.length === 0) return;
    const timeoutId = window.setTimeout(() => {
      try {
        localStorage.setItem('visual_comm_os_list', JSON.stringify(orders));
        setStorageError(false);
      } catch (error) {
        console.error('Falha ao salvar', error);
        setStorageError(true);
      }
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [orders]);

  // 3. LISTEN TO GLOBAL PASTE (CTRL+V) EVENT
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing custom notes or fields, unless they copy-paste a file!
      const activeEl = document.activeElement;
      const isInputText = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA'
      );

      const items = e.clipboardData?.items;
      if (!items) return;

      let imageFound = false;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            imageFound = true;
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                // Update active O.S. with pasted image
                setOrders((prev) => 
                  prev.map((ord) => 
                    ord.id === activeOSId 
                      ? { ...ord, pastedImage: event.target.result as string } 
                      : ord
                  )
                );
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }

      // If user pasted an image file, block standard paste to prevent rendering text junk in input fields
      if (imageFound) {
        e.preventDefault();
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [activeOSId]);


  const handleExportBackup = () => {
    const payload = { app: 'Traço OS', version: 1, exportedAt: new Date().toISOString(), orders };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-traco-os-' + new Date().toISOString().slice(0, 10) + '.json';
    link.click();
    URL.revokeObjectURL(url);
  };
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const imported = Array.isArray(parsed) ? parsed : parsed.orders;
        if (!Array.isArray(imported) || imported.length === 0 || imported.some((item: any) => !item || typeof item.id !== 'string' || typeof item.osNumber !== 'string' || typeof item.clienteNome !== 'string' || typeof item.material !== 'string')) throw new Error('Formato inválido');
        if (!window.confirm('Importar ' + imported.length + ' ordem(ns)? Os dados atuais deste navegador serão substituídos.')) return;
        setOrders(imported); setActiveOSId(imported[0]?.id || '');
        localStorage.setItem('visual_comm_os_list', JSON.stringify(imported)); setStorageError(false);
        alert('Backup importado com sucesso.');
      } catch (error) { alert('Não foi possível importar. Selecione um backup JSON válido deste sistema.'); }
      finally { event.target.value = ''; }
    };
    reader.readAsText(file);
  };
  const counts = useMemo(() => ({
    total: orders.length,
    draft: orders.filter((order) => order.status === 'rascunho').length,
    production: orders.filter((order) => order.status === 'producao').length,
    completed: orders.filter((order) => order.status === 'concluido').length,
    overdue: orders.filter((order) => order.status !== 'concluido' && order.dataEntrega && new Date(order.dataEntrega + 'T23:59:59') < new Date()).length
  }), [orders]);

  // Find active Service Order payload
  const activeOS = orders.find((ord) => ord.id === activeOSId) || orders[0];

  // Keep expensive secondary views off the keystroke-by-keystroke render path.
  useEffect(() => {
    if (!activeOS) return;
    const timer = window.setTimeout(() => setPreviewOS(activeOS), 220);
    return () => window.clearTimeout(timer);
  }, [activeOS]);

  useEffect(() => {
    const timer = window.setTimeout(() => setHistoryOrders(orders), 280);
    return () => window.clearTimeout(timer);
  }, [orders]);

  const activeOSRef = useRef(activeOS);
  const ordersRef = useRef(orders);
  activeOSRef.current = activeOS;
  ordersRef.current = orders;

  // Helper updating the active O.S. details
  const handleOSChange = useCallback((updated: ServiceOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }, []);

  const handleSelectOS = useCallback((id: string) => setActiveOSId(id), []);

  // Create a brand new blank Service Order
  const handleCreateNew = useCallback(() => {
    const currentOrders = ordersRef.current;
    const currentOS = activeOSRef.current;
    const timestamp = Date.now();
    const nextNum = currentOrders.length > 0
      ? `OS-${1000 + currentOrders.length + 1}`
      : 'OS-1001';

    // Copy branding details from active one if exists
    const currentCompany = currentOS?.companyName || 'Sua empresa';
    const currentPhone = currentOS?.companyPhone || '';

    const newOS: ServiceOrder = {
      id: `os-${timestamp}`,
      osNumber: nextNum,
      dataEmissao: new Date().toISOString().split('T')[0],
      dataEntrega: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
      clienteNome: '',
      clienteContato: '',
      vendedor: currentOS?.vendedor || '',
      designer: currentOS?.designer || '',
      impressor: currentOS?.impressor || '',
      material: 'Adesivo',
      largura: 1.0,
      altura: 1.0,
      quantidade: 1,
      detalhes: {
        recorte: 'Sem Recorte',
        acabamento: 'Sem Acabamento',
        aplicacao: 'Vidro / Vitrine',
      },
      observacoes: '',
      pastedImage: null,
      imageFit: 'contain',
      imageRotation: 0,
      companyName: currentCompany,
      companyPhone: currentPhone,
      status: 'rascunho'
    };

    setOrders((prev) => [newOS, ...prev]);
    setActiveOSId(newOS.id);
  }, []);

  // Delete Service Order from local state
  const handleDeleteOS = useCallback((id: string) => {
    const currentOrders = ordersRef.current;
    if (currentOrders.length <= 1) {
      alert('Você deve manter no mínimo 1 Ordem de Serviço cadastrada.');
      return;
    }
    const confirmDelete = window.confirm('Tem certeza que deseja apagar permanentemente esta Ordem de Serviço?');
    if (confirmDelete) {
      const remaining = currentOrders.filter((o) => o.id !== id);
      setOrders(remaining);
      setActiveOSId(remaining[0].id);
    }
  }, []);

  // Duplicate Service Order to quick draft matching specifications/client
  const handleDuplicateOS = useCallback((id: string) => {
    const target = ordersRef.current.find((o) => o.id === id);
    if (!target) return;

    const duplicated: ServiceOrder = {
      ...target,
      id: `os-dup-${Date.now()}`,
      osNumber: `${target.osNumber}-CÓPIA`,
      clienteNome: `${target.clienteNome} (Cópia)`,
      status: 'rascunho'
    };

    setOrders((prev) => [duplicated, ...prev]);
    setActiveOSId(duplicated.id);
  }, []);

  // EXPORT TO HIGH-DENSITY A4 PDF
  const handleExportPDF = async () => {
    if (!activeOS) return;
    setIsGenerating(true);
    
    try {
      const element = document.getElementById('a4-job-ticket');
      if (!element) {
        throw new Error('Elemento de preview A4 não encontrado.');
      }

      // Converte o elemento HTML diretamente para PNG em alta resolução
      // O html-to-image captura o elemento em seu tamanho real (794x1123px), sem distorções ou esmagamentos!
      const imgData = await toPng(element, {
        pixelRatio: 3, // Resolução 3x ultra-nítida de nível profissional para impressão industrial
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = 297; // Proporção perfeita A4 (210mm x 297mm)

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileNameStr = (activeOS.clienteNome || 'sem_nome').trim().replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`${activeOS.osNumber}_${fileNameStr}_producao.pdf`);
    } catch (err) {
      console.error('Falha ao exportar PDF:', err);
      alert('Houve um erro ao renderizar o PDF. Dica: você também pode usar o botão "IMPRIMIR DIRETO" (Ctrl+P) escolhendo "Salvar como PDF" no navegador.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct Browser Printing (Triggers optimized A4 native print sheet)
  const handleDirectPrint = () => {
    window.print();
  };

  if (SHOW_LOCK_SCREEN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/30 bg-slate-900/95 p-8 text-center shadow-2xl shadow-black/40">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20 text-red-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Acesso bloqueado</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            Sua empresa foi banida do uso da aplicação. Por favor, contatar o administrador Warleandro Nascimento.
          </p>
          <p className="mt-6 text-sm uppercase tracking-[0.3em] text-red-400">
            Bloqueio ativo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-shell min-h-screen flex flex-col font-sans text-slate-800 ${darkMode ? 'dark' : ''}`}>
      {sidebarOpen && <button type="button" aria-label="Fechar menu" className="sidebar-backdrop no-print" onClick={() => setSidebarOpen(false)} />}
      <aside className={`app-sidebar no-print ${sidebarOpen ? 'is-open' : ''}`} aria-label="Menu principal">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark"><PenTool /></div>
          <div><strong>Traço<span>OS</span></strong><small>GESTÃO DE PRODUÇÃO</small></div>
        </div>
        <div className="sidebar-caption">ESPAÇO DE TRABALHO</div>
        <nav className="sidebar-nav">
          <button type="button" className={activeTab === 'home' ? 'active' : ''} onClick={() => { setActiveTab('home'); setSidebarOpen(false); }}><Home />Visão geral</button>
          <button type="button" className={activeTab === 'workspace' ? 'active' : ''} onClick={() => { setActiveTab('workspace'); setSidebarOpen(false); }}><LayoutDashboard />Painel de produção</button>
          <button type="button" className={activeTab === 'about' ? 'active' : ''} onClick={() => { setActiveTab('about'); setSidebarOpen(false); }}><BookOpen />Sobre o projeto</button>
        </nav>
        <div className="sidebar-divider" />
        <button type="button" className="sidebar-create" onClick={() => { handleCreateNew(); setActiveTab('workspace'); setSidebarOpen(false); }}><FileText />Nova ordem de serviço</button>
        <div className="sidebar-spacer" />
        <div className="sidebar-status"><span className="status-dot" />Sistema neste navegador</div>
        <button type="button" className="sidebar-theme" onClick={() => setDarkMode((value) => !value)}>
          {darkMode ? <Sun /> : <Moon />}<span>{darkMode ? 'Modo claro' : 'Modo escuro'}</span>
        </button>
        <div className="sidebar-profile"><div className="sidebar-avatar">W</div><div><strong>Warleandro</strong><small>Administrador</small></div></div>
      </aside>
      {/* HEADER PRINCIPAL */}
      <header className="app-header no-print">
        <div className="app-header-brand">
          <button type="button" className="sidebar-mobile-toggle" aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setSidebarOpen((value) => !value)}>{sidebarOpen ? <X /> : <Menu />}</button>
          <div className="header-wordmark"><span className="header-mark"><PenTool /></span><div><h1>Traço<span>OS</span></h1><p>{activeTab === 'home' ? 'Visão geral' : activeTab === 'workspace' ? 'Painel de produção' : 'Sobre o projeto'}</p></div></div>
        </div>
        <div className="app-header-tools">
          <span className="header-local-status"><i /> Sistema local</span>
          {activeOS && activeTab === 'workspace' && <>
            <button type="button" onClick={() => setShowHelp(!showHelp)} className="header-quiet-action"><Info className="w-4 h-4"/> Ajuda</button>
            <button type="button" onClick={handleDirectPrint} className="header-quiet-action"><Printer className="w-4 h-4"/> Imprimir</button>
            <button type="button" disabled={isGenerating} onClick={handleExportPDF} className="header-primary-action">{isGenerating ? <RotateCw className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}{isGenerating ? 'Gerando...' : 'Exportar PDF'}</button>
          </>}
          <button type="button" onClick={() => setDarkMode((value) => !value)} aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"} className="theme-toggle">{darkMode ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}</button>
        </div>
      </header>

      {/* QUICK INSTRUCTIONS BANNER */}
      {showHelp && activeTab === 'workspace' && (
        <div className="no-print bg-indigo-50/75 border-b border-indigo-100 px-6 py-4 animate-fadeIn transition-all">
          <div className="max-w-[1400px] mx-auto flex items-start gap-3 text-indigo-955 text-xs">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-indigo-900">💡 Como funciona o fluxo de trabalho do Arte-Finalista para a Produção?</p>
              <p className="leading-relaxed text-indigo-800">
                1. <b>Design Concluído</b>: Quando você terminar a criação no <i>CorelDRAW, Illustrator, Photoshop ou Figma</i>, selecione a imagem do layout e copie-a <b>(Ctrl+C)</b> ou tire um print screen.<br />
                2. <b>Cole no Sistema</b>: Aperte <b>Ctrl + V</b> em qualquer ponto da página. A imagem aparecerá no centro da folha A4 em tempo real!<br />
                3. <b>Especificações do Material</b>: Escolha o material (adesivo, lona, etc.) e preencha as dimensões exatas de largura e altura. O metro quadrado (m²) e acabamentos serão marcados no painel.<br />
                4. <b>Imprima ou Baixe o PDF</b>: Clique em <b>"Gerar PDF (A4)"</b> para salvar ou clique em <b>"Imprimir Direto"</b> para imprimir fisicamente e entregar pronto à equipe de fábrica.
              </p>
            </div>
            <button 
              onClick={() => setShowHelp(false)}
              className="ml-auto text-indigo-600 hover:text-indigo-850 font-bold px-2 py-1 text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {activeTab === 'home' && (
        <main className="traco-home app-page">
          <section className="dashboard-hero">
            <div className="dashboard-hero-content">
              <span className="dashboard-eyebrow">TRAÇO OS <b>/</b> PRODUÇÃO VISUAL</span>
              <h2>Produção organizada.<br/><span>Do atendimento à impressão.</span></h2>
              <p>Centralize ordens, acompanhe cada etapa e entregue informações claras para quem está na produção.</p>
              <div className="dashboard-hero-actions">
                <button type="button" onClick={() => { handleCreateNew(); setActiveTab('workspace'); }} className="dashboard-primary"><PlusIconFallback/> Criar ordem de serviço</button>
                <button type="button" onClick={() => setActiveTab('workspace')} className="dashboard-secondary">Abrir painel <ChevronRight className="w-4 h-4"/></button>
              </div>
            </div>
            <div className="dashboard-hero-visual" aria-hidden="true"><div className="hero-arc"></div><div className="hero-document"><FileText/><span>ORDEM DE PRODUÇÃO</span><strong>OS-{String(1000 + orders.length).padStart(4,'0')}</strong><i></i><i></i><i></i></div></div>
          </section>

          <section className="dashboard-metrics" aria-label="Resumo da produção">
            <div className="metric-intro"><span className="dashboard-eyebrow">ACOMPANHAMENTO</span><h3>Seu ritmo de produção</h3><p>Resumo atualizado das ordens cadastradas.</p></div>
            <div className="metric-item"><span>Total de ordens</span><strong>{counts.total}</strong><small>Registros salvos</small></div>
            <div className="metric-item"><span>Em produção</span><strong>{counts.production}</strong><small>Em andamento</small></div>
            <div className="metric-item"><span>Concluídas</span><strong>{counts.completed}</strong><small>Finalizadas</small></div>
            <div className="metric-item"><span>Prazo vencido</span><strong>{counts.overdue}</strong><small>Atenção necessária</small></div>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">FERRAMENTAS</span><h3>O que você precisa fazer?</h3><p>Acesse rapidamente as principais áreas do sistema.</p></div><button type="button" className="text-link" onClick={() => setActiveTab('workspace')}>Ver painel completo <ChevronRight className="w-4 h-4"/></button></div>
            <div className="dashboard-feature-grid">
              <button type="button" className="dashboard-feature-card feature-highlight" onClick={() => { handleCreateNew(); setActiveTab('workspace'); }}><span className="feature-icon"><FileText/></span><span className="feature-title">Nova ordem de serviço</span><span className="feature-description">Cadastre cliente, material, medidas e responsáveis.</span><span className="feature-link">Criar ordem <ChevronRight/></span></button>
              <button type="button" className="dashboard-feature-card" onClick={() => setActiveTab('workspace')}><span className="feature-icon"><ClipboardList/></span><span className="feature-title">Ordens e histórico</span><span className="feature-description">Encontre, edite, duplique ou atualize uma ordem.</span><span className="feature-link">Acessar histórico <ChevronRight/></span></button>
              <button type="button" className="dashboard-feature-card" onClick={() => setActiveTab('workspace')}><span className="feature-icon"><PrinterCheck/></span><span className="feature-title">Ficha de produção</span><span className="feature-description">Confira a prévia técnica e prepare a impressão A4.</span><span className="feature-link">Abrir ficha <ChevronRight/></span></button>
              <button type="button" className="dashboard-feature-card" onClick={handleExportBackup}><span className="feature-icon"><Download/></span><span className="feature-title">Exportar backup</span><span className="feature-description">Guarde uma cópia dos registros deste navegador.</span><span className="feature-link">Baixar backup <ChevronRight/></span></button>
              <button type="button" className="dashboard-feature-card" onClick={() => importInputRef.current?.click()}><span className="feature-icon"><Upload/></span><span className="feature-title">Restaurar backup</span><span className="feature-description">Importe um arquivo JSON salvo anteriormente.</span><span className="feature-link">Importar arquivo <ChevronRight/></span></button>
              <button type="button" className="dashboard-feature-card" onClick={() => setActiveTab('about')}><span className="feature-icon"><BookOpen/></span><span className="feature-title">Sobre o Traço OS</span><span className="feature-description">Consulte informações, recursos e créditos do projeto.</span><span className="feature-link">Conhecer projeto <ChevronRight/></span></button>
            </div>
          </section>

          <section className="dashboard-trust-band"><div><span className="dashboard-eyebrow">FEITO PARA O DIA A DIA DA GRÁFICA</span><h3>Informação certa, na hora certa.</h3><p>Uma rotina mais clara entre atendimento, arte-final e impressão.</p></div><div className="trust-points"><div><strong>01</strong><span>Cadastro centralizado</span></div><div><strong>02</strong><span>Ficha técnica padronizada</span></div><div><strong>03</strong><span>Impressão A4 pronta</span></div><div><strong>04</strong><span>Backup dos registros</span></div></div></section>

          <section className="dashboard-section recent-section">
            <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">CONTINUE DE ONDE PAROU</span><h3>Ordens recentes</h3><p>Abra uma ordem para continuar a edição.</p></div><button type="button" className="text-link" onClick={() => setActiveTab('workspace')}>Ver todas <ChevronRight className="w-4 h-4"/></button></div>
            <div className="recent-orders-grid">{orders.slice(0,3).map((order) => <button type="button" key={order.id} className="recent-order-card" onClick={() => { setActiveOSId(order.id); setActiveTab('workspace'); }}><div className="recent-order-top"><span>{order.osNumber}</span><span className={'recent-status status-'+order.status}>{order.status === 'concluido' ? 'Concluída' : order.status === 'producao' ? 'Em produção' : 'Rascunho'}</span></div><strong>{order.clienteNome || 'Cliente não cadastrado'}</strong><small>{order.material} · {order.largura.toFixed(2)} × {order.altura.toFixed(2)} m</small><span className="recent-order-open">Abrir ordem <ChevronRight/></span></button>)}</div>
          </section>
          <input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportBackup} />
        </main>
      )}

      {/* DETAILED SERVICE WORKSPACE BOARD */}

      {activeTab === 'about' && (
        <main className="about-page flex-1 w-full max-w-[1240px] mx-auto px-4 py-7 md:px-8 md:py-10">
          <section className="about-hero relative overflow-hidden rounded-[2rem] p-7 md:p-12 text-white">
            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">Manual do projeto · Traço OS</span>
              <h2 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">Produção visual, <span className="text-indigo-300">sem bagunça.</span></h2>
              <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-slate-300">Um sistema leve para organizar ordens de serviço de comunicação visual, reunir as informações técnicas e entregar uma ficha de produção pronta para imprimir.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={() => setActiveTab('workspace')} className="rounded-xl bg-white px-5 py-3 text-xs font-black text-slate-950 hover:bg-indigo-100 transition">Abrir o painel <ArrowLeft className="ml-2 inline h-4 w-4 rotate-180" /></button>
                <a href="https://github.com/polar4851/geradordeos" target="_blank" rel="noreferrer" className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/15 transition">Ver código no GitHub ↗</a>
              </div>
            </div>
            <div className="about-hero-mark" aria-hidden="true"><Layers /></div>
          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="about-info-card"><div className="about-icon"><ClipboardList /></div><h3>Ordens de serviço</h3><p>Cadastro de cliente, material, medidas, quantidade, acabamento, aplicação e observações para orientar a produção.</p></article>
            <article className="about-info-card"><div className="about-icon"><PrinterCheck /></div><h3>Ficha A4</h3><p>Prévia da ordem com referência visual e dados técnicos, pronta para impressão direta ou exportação em PDF A4.</p></article>
            <article className="about-info-card"><div className="about-icon"><Database /></div><h3>Dados locais</h3><p>Os registros ficam armazenados no navegador deste dispositivo. Exporte backups JSON para guardar uma cópia ou transferir seus dados manualmente.</p></article>
          </section>

          <section className="about-content-card mt-6 grid gap-8 p-6 md:grid-cols-[1.1fr_.9fr] md:p-9">
            <div>
              <p className="about-eyebrow">README · VISÃO GERAL</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">O que é o Traço OS?</h3>
              <p className="mt-3 text-sm leading-7 about-muted">O Traço OS foi pensado para o dia a dia de gráficas e empresas de comunicação visual. A proposta é centralizar os detalhes de cada trabalho em uma ordem clara, reduzindo dúvidas entre atendimento, arte-final e produção.</p>
              <h4 className="mt-7 text-sm font-extrabold">Fluxo de trabalho</h4>
              <ol className="about-steps mt-3">
                <li><b>1.</b><span>Crie uma ordem e preencha os dados do cliente e do serviço.</span></li>
                <li><b>2.</b><span>Selecione o material e informe medidas, quantidade e acabamentos.</span></li>
                <li><b>3.</b><span>Copie uma imagem do layout e use Ctrl + V para anexá-la à ordem.</span></li>
                <li><b>4.</b><span>Confira a ficha A4 e imprima ou gere o PDF para a equipe.</span></li>
              </ol>
              <h4 className="mt-7 text-sm font-extrabold">Recursos principais</h4>
              <ul className="about-bullets mt-3">
                <li>Histórico de ordens, duplicação e exclusão.</li>
                <li>Prévia da ficha de produção em formato A4.</li>
                <li>Importação e exportação de backup em JSON.</li>
                <li>Modo claro e modo escuro.</li>
                <li>Uso local, sem exigir conta para operar.</li>
              </ul>
            </div>
            <aside className="about-side-panel">
              <div className="flex items-center justify-between gap-3"><span className="about-eyebrow">NA PRÁTICA</span><span className="text-2xl">⚡</span></div>
              <h4 className="mt-2 text-xl font-black">Feito para quem produz.</h4>
              <p className="mt-2 text-sm leading-6 about-muted">Menos informação perdida no caminho. Mais clareza para quem vai imprimir, recortar, aplicar, montar e finalizar.</p>
              <div className="about-resource-list mt-5">
                <div><ClipboardList /><span><b>Organização</b><small>Ordens e histórico em um só lugar.</small></span></div>
                <div><PrinterCheck /><span><b>Produção</b><small>Ficha técnica pronta para a equipe.</small></span></div>
                <div><Database /><span><b>Segurança local</b><small>Backup para guardar seus registros.</small></span></div>
              </div>
            </aside>
          </section>

          <section className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/5 p-5 md:p-6">
            <h3 className="text-sm font-black">Tecnologia e transparência</h3>
            <p className="mt-2 text-sm leading-6 about-muted">Interface construída com React, TypeScript, Tailwind CSS e Vite. Os dados de ordens são mantidos no localStorage do navegador. Isso significa que não há sincronização automática entre computadores: mantenha backups atualizados para evitar perda de informações.</p>
          </section>

          <section className="about-credit-callout mt-8">
            <div><p className="about-eyebrow">QUEM FEZ ACONTECER</p><h3 className="mt-1 text-2xl font-black">Desenvolvido por Warleandro Nascimento.</h3><p className="mt-2 text-sm about-muted">A autoria e os contatos continuam disponíveis no rodapé do sistema.</p></div>
            <div className="text-4xl" aria-hidden="true">✦</div>
          </section>
        </main>
      )}

      {activeTab === 'workspace' && <main className="workspace-page app-page">
        <section className="workspace-heading no-print"><div><span className="dashboard-eyebrow">PAINEL DE PRODUÇÃO</span><h2>Ordens de serviço</h2><p>Gerencie os trabalhos e prepare cada ficha para a equipe.</p></div><button type="button" className="workspace-new-button" onClick={handleCreateNew}><FileText className="w-4 h-4"/> Nova ordem</button></section>
        <section className="workspace-stats no-print">
          <div><span>Ordens cadastradas</span><strong>{counts.total}</strong><small>Todos os registros</small></div>
          <div><span>Em rascunho</span><strong>{counts.draft}</strong><small>Aguardando produção</small></div>
          <div><span>Na produção</span><strong>{counts.production}</strong><small>Em andamento</small></div>
          <div><span>Concluídas</span><strong>{counts.completed}</strong><small>Finalizadas</small></div>
          <div><span>Prazo vencido</span><strong>{counts.overdue}</strong><small>Verificar entrega</small></div>
        </section>
        <section className="workspace-toolbar no-print">
          <div><ShieldCheck className="w-4 h-4"/><span>Seus registros ficam salvos neste navegador.</span></div>
          <div><button type="button" onClick={handleExportBackup}><Save className="w-4 h-4"/> Exportar backup</button><button type="button" onClick={() => importInputRef.current?.click()}><Upload className="w-4 h-4"/> Restaurar</button><input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportBackup}/></div>
        </section>
        {storageError && <div className="no-print storage-warning"><AlertTriangle className="w-4 h-4"/> O navegador não conseguiu salvar as alterações. Exporte um backup e libere espaço antes de continuar.</div>}
        <div className="workspace-columns">
          <aside className="workspace-history no-print">{orders.length > 0 && <OSHistory orders={historyOrders.length ? historyOrders : orders} activeId={activeOSId} onSelect={handleSelectOS} onCreateNew={handleCreateNew} onDelete={handleDeleteOS} onDuplicate={handleDuplicateOS}/>}</aside>
          <section className="workspace-editor no-print">
            <div className="panel-section-heading"><div><span className="dashboard-eyebrow">EDIÇÃO DA ORDEM</span><h3>Dados do trabalho</h3></div>{activeOS && <span className="order-number-tag">{activeOS.osNumber}</span>}</div>
            {activeOS ? <OSForm activeOS={activeOS} onChange={handleOSChange}/> : <div className="empty-panel">Carregando dados do sistema...</div>}
          </section>
          <section className={"workspace-preview-panel " + (showCompactPreview ? "workspace-preview-open" : "")}>
            <div className="preview-panel-heading no-print"><div><span className="dashboard-eyebrow">DOCUMENTO</span><h3>Prévia da ficha A4</h3></div><button type="button" onClick={() => setShowCompactPreview((value) => !value)} aria-expanded={showCompactPreview}>{showCompactPreview ? 'Ocultar' : 'Mostrar'} <ChevronRight className={showCompactPreview ? 'rotate-90' : ''}/></button></div>
            <div className="preview-panel-content">{activeOS ? <div className="preview-viewport"><div className="preview-scaled-page"><OSPreview activeOS={previewOS?.id === activeOS.id ? previewOS : activeOS}/></div></div> : <div className="empty-panel">Nenhuma O.S. ativa.</div>}</div>
          </section>
        </div>
      </main>}

      {/* Bottom Status Bar */}
      <footer className="no-print px-6 py-3 bg-slate-950 text-slate-400 flex flex-wrap gap-2 justify-between items-center text-[10px] font-medium border-t border-slate-900 mt-auto">
        <div className="flex gap-4">
          <span>SISTEMA: ONLINE</span>
          <span>PILOTO COPIADO (CTRL+V): MONITORANDO</span>
          <span>ARMAZENAMENTO: NESTE NAVEGADOR</span>
        </div>
        <div className="flex gap-2 items-center font-semibold text-slate-300">
          <span className={`w-2 h-2 ${storageError ? 'bg-rose-500' : 'bg-emerald-500'} rounded-full`}></span>
          {storageError ? 'FALHA AO SALVAR' : 'SALVAMENTO LOCAL ATIVO'}
        </div>
      </footer>

      <footer className="no-print bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="text-center sm:text-left"><p className="font-semibold text-slate-700">Desenvolvido por <span className="text-indigo-600">Warleandro Nascimento</span></p><p className="text-[11px] mt-0.5">Traço OS · Gestão de ordens para comunicação visual</p></div>
        <div className="flex items-center gap-4"><a href="https://instagram.com/warleandro._" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition"><Instagram className="w-4 h-4" /> @warleandro._</a><a href="https://wa.me/5563999318046" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition"><MessageCircle className="w-4 h-4" /> WhatsApp</a></div>
      </footer>
    </div>
  );
}
