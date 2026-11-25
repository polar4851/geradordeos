import React, { useState, useEffect, useRef } from 'react';
import { ServiceOrder, MaterialType } from './types';
import OSForm from './components/OSForm';
import OSPreview from './components/OSPreview';
import OSHistory from './components/OSHistory';
import { 
  FileText, 
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
  const [activeOSId, setActiveOSId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [storageError, setStorageError] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('traco-os-theme') === 'dark');
  const [activeTab, setActiveTab] = useState<'workspace' | 'about'>('workspace');
  const [showCompactPreview, setShowCompactPreview] = useState(false);

  useEffect(() => {
    localStorage.setItem('traco-os-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // 1. Load data from localStorage on startup
  useEffect(() => {
    const stored = localStorage.getItem('visual_comm_os_list');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ServiceOrder[];
        if (parsed.length > 0) {
          setOrders(parsed);
          setActiveOSId(parsed[0].id);
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
  const counts = {
    total: orders.length,
    draft: orders.filter((order) => order.status === 'rascunho').length,
    production: orders.filter((order) => order.status === 'producao').length,
    completed: orders.filter((order) => order.status === 'concluido').length,
    overdue: orders.filter((order) => order.status !== 'concluido' && order.dataEntrega && new Date(order.dataEntrega + 'T23:59:59') < new Date()).length
  };

  // Find active Service Order payload
  const activeOS = orders.find((ord) => ord.id === activeOSId) || orders[0];

  // Helper updating the active O.S. details
  const handleOSChange = (updated: ServiceOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  // Create a brand new blank Service Order
  const handleCreateNew = () => {
    const timestamp = Date.now();
    const nextNum = orders.length > 0 
      ? `OS-${1000 + orders.length + 1}`
      : 'OS-1001';

    // Copy branding details from active one if exists
    const currentCompany = activeOS?.companyName || 'Sua empresa';
    const currentPhone = activeOS?.companyPhone || '';

    const newOS: ServiceOrder = {
      id: `os-${timestamp}`,
      osNumber: nextNum,
      dataEmissao: new Date().toISOString().split('T')[0],
      dataEntrega: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
      clienteNome: '',
      clienteContato: '',
      vendedor: activeOS?.vendedor || '',
      designer: activeOS?.designer || '',
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
  };

  // Delete Service Order from local state
  const handleDeleteOS = (id: string) => {
    if (orders.length <= 1) {
      alert('Você deve manter no mínimo 1 Ordem de Serviço cadastrada.');
      return;
    }
    const confirmDelete = window.confirm('Tem certeza que deseja apagar permanentemente esta Ordem de Serviço?');
    if (confirmDelete) {
      const remaining = orders.filter((o) => o.id !== id);
      setOrders(remaining);
      setActiveOSId(remaining[0].id);
    }
  };

  // Duplicate Service Order to quick draft matching specifications/client
  const handleDuplicateOS = (id: string) => {
    const target = orders.find((o) => o.id === id);
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
  };

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
      {/* NAVIGATION HEADER BAR */}
      <header className="no-print sticky top-0 flex flex-wrap items-center justify-between gap-4 px-5 md:px-8 py-4 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-[0_2px_16px_rgba(15,23,42,0.04)] z-20">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-900/15">
            <PenTool className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-[21px] leading-none font-extrabold tracking-tight text-slate-950">Traço<span className="text-indigo-600">OS</span></h1>
            <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-[0.18em]">Gestão de produção visual</p>
          </div>
          <div className="hidden md:flex items-center gap-2 ml-5 pl-5 border-l border-slate-200 text-[11px] text-slate-500 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Ambiente local</div>
        </div>

        {/* Core App Actions */}
        {activeOS && (
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => { setActiveTab(activeTab === 'about' ? 'workspace' : 'about'); setShowHelp(false); }}
              aria-pressed={activeTab === 'about'}
              className={`about-tab inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition ${activeTab === 'about' ? 'about-tab-active' : ''}`}
            >
              {activeTab === 'about' ? <ArrowLeft className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              {activeTab === 'about' ? 'Voltar ao painel' : 'Sobre & créditos'}
            </button>

            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
              title={darkMode ? "Modo claro" : "Modo escuro"}
              className="theme-toggle inline-flex items-center justify-center gap-2 w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="px-3.5 py-2.5 hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold tracking-tight transition"
            >
              Ajuda / Tutorial Ctrl+V
            </button>

            <button
              type="button"
              onClick={handleDirectPrint}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-sm"
            >
              Imprimir Direto
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleExportPDF}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/15 transition active:scale-95 flex items-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Gerar PDF (A4)
                </>
              )}
            </button>
          </div>
        )}
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
            <div className="about-hero-pokemon" aria-hidden="true"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif" alt="" /></div>
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
              <div className="about-gif-strip mt-5">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/133.gif" alt="Eevee em pixel art" loading="lazy" />
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/39.gif" alt="Jigglypuff animado em pixel art" loading="lazy" />
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/94.gif" alt="Gengar em pixel art" loading="lazy" />
              </div>
              <p className="mt-3 text-[10px] about-muted">Pokémon em pixel art animado com fundo transparente.</p>
            </aside>
          </section>

          <section className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/5 p-5 md:p-6">
            <h3 className="text-sm font-black">Tecnologia e transparência</h3>
            <p className="mt-2 text-sm leading-6 about-muted">Interface construída com React, TypeScript, Tailwind CSS e Vite. Os dados de ordens são mantidos no localStorage do navegador. Isso significa que não há sincronização automática entre computadores: mantenha backups atualizados para evitar perda de informações.</p>
          </section>

          <section className="about-gif-gallery mt-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="about-eyebrow">PAUSA PARA O CAFÉ</p><h3 className="mt-1 text-2xl font-black">Pokémon em pixel art também entrou na produção.</h3></div><span className="text-xs font-semibold text-indigo-500">GIFs animados · pixel art</span></div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif" alt="Pikachu em pixel art" loading="lazy" /><span>Pikachu no ritmo</span></div>
              <div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/133.gif" alt="Eevee animado em pixel art" loading="lazy" /><span>Energia para produzir</span></div>
              <div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/39.gif" alt="Jigglypuff em pixel art" loading="lazy" /><span>Acabamento caprichado</span></div>
              <div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/94.gif" alt="Eevee dançando" loading="lazy" /><span>Ordem finalizada!</span></div>
              <div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/1.gif" alt="Bulbasaur em pixel art" loading="lazy" /><span>Conferência final</span></div>
              <div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/150.gif" alt="Mewtwo em pixel art" loading="lazy" /><span>Missão cumprida</span></div>
            </div>
          </section>

          <section className="about-credit-callout mt-8">
            <div><p className="about-eyebrow">QUEM FEZ ACONTECER</p><h3 className="mt-1 text-2xl font-black">Desenvolvido por Warleandro Nascimento.</h3><p className="mt-2 text-sm about-muted">A autoria e os contatos continuam disponíveis no rodapé do sistema.</p></div>
            <div className="text-4xl" aria-hidden="true">✦</div>
          </section>
        </main>
      )}

      <main className={`${activeTab === 'about' ? 'hidden' : ''} flex-1 max-w-[1720px] w-full mx-auto p-4 md:p-7 flex flex-col gap-6 overflow-y-auto`}>
        <section className="no-print flex flex-col md:flex-row md:items-end justify-between gap-3 pt-1">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-600 mb-2">CENTRAL DE OPERAÇÕES</p><h2 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-slate-950">Sua produção, em ordem.</h2><p className="text-sm text-slate-500 mt-1">Gerencie serviços, acompanhe prazos e prepare a ficha para a equipe.</p></div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-full px-3.5 py-2 shadow-sm"><ShieldCheck className="w-4 h-4 text-emerald-600"/> Seus dados ficam neste navegador</div>
        </section>

        <section className="no-print grid grid-cols-2 xl:grid-cols-5 gap-3">
          {[
            { label: 'Ordens cadastradas', value: counts.total, icon: FileText, tone: 'text-indigo-600 bg-indigo-50' },
            { label: 'Em rascunho', value: counts.draft, icon: Clipboard, tone: 'text-slate-600 bg-slate-100' },
            { label: 'Na produção', value: counts.production, icon: Layers, tone: 'text-amber-600 bg-amber-50' },
            { label: 'Concluídas', value: counts.completed, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
            { label: 'Prazo vencido', value: counts.overdue, icon: Clock3, tone: counts.overdue ? 'text-rose-600 bg-rose-50' : 'text-slate-500 bg-slate-100' }
          ].map((item) => { const Icon = item.icon; return <div key={item.label} className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-[0_3px_14px_rgba(15,23,42,0.035)] flex items-center gap-3.5 hover:-translate-y-0.5 hover:shadow-md transition-all"><div className={'w-9 h-9 rounded-lg flex items-center justify-center ' + item.tone}><Icon className="w-4 h-4" /></div><div><div className="text-xl font-black text-slate-900 leading-none">{item.value}</div><div className="text-[10px] text-slate-500 font-semibold mt-1">{item.label}</div></div></div>; })}
        </section>

        <section className="no-print flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl px-5 py-4 shadow-[0_3px_14px_rgba(15,23,42,0.035)]">
          <div><p className="text-xs font-bold text-slate-800">Segurança dos seus registros</p><p className="text-[11px] text-slate-500 mt-0.5">Exporte uma cópia ou restaure um backup salvo anteriormente.</p></div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleExportBackup} className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Exportar backup</button>
            <button type="button" onClick={() => importInputRef.current?.click()} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> Restaurar backup</button>
            <input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportBackup} />
          </div>
        </section>
        {storageError && <div className="no-print rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-xs font-semibold">O navegador não conseguiu salvar as alterações. Exporte um backup e libere espaço antes de continuar.</div>}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-start">

        
        {/* SIDEBAR Column 1: DB History & Actions (col-span-3) */}
        <section className="no-print lg:col-span-3 space-y-4 h-full min-w-0">
          {orders.length > 0 && (
            <OSHistory
              orders={orders}
              activeId={activeOSId}
              onSelect={(id) => setActiveOSId(id)}
              onCreateNew={handleCreateNew}
              onDelete={handleDeleteOS}
              onDuplicate={handleDuplicateOS}
            />
          )}

          {/* Quick instructions widget card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Clipboard className="w-3.5 h-3.5 text-indigo-500" />
              Agilidade na Fábrica
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Gerar a folha A4 com a <b>referência visual</b> e as <b>especificações preenchidas</b> ajuda a equipe a conferir medidas, materiais e acabamentos antes de iniciar a produção.
            </p>
            <div className="bg-indigo-50/50 p-2.5 rounded-lg text-[10px] text-indigo-950 flex items-center gap-2 border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>O.S. Pronta para fixar no material físico!</span>
            </div>
          </div>
        </section>

        {/* Column 2: O.S Dynamic Inputs Editor (col-span-5) */}
        <section className="no-print lg:col-span-9 space-y-4 min-w-0">
          {activeOS ? (
            <OSForm 
              activeOS={activeOS} 
              onChange={handleOSChange} 
            />
          ) : (
            <div className="bg-white p-8 text-center rounded-2xl border text-slate-400">
              Carregando dados do sistema...
            </div>
          )}
        </section>

        <div className="compact-preview-control no-print"><button type="button" onClick={() => setShowCompactPreview((value) => !value)} aria-expanded={showCompactPreview}>{showCompactPreview ? "Ocultar prévia A4" : "Visualizar ficha A4"}<span>{showCompactPreview ? "−" : "+"}</span></button></div>

        {/* Column 3: Live Printable A4 Simulation Preview Panel (col-span-4) */}
        <section className={"workspace-preview lg:col-span-12 bg-[#e9edf5] p-3 md:p-5 rounded-2xl border border-slate-200 w-full min-w-0 flex flex-col items-center " + (showCompactPreview ? "workspace-preview-open" : "")}>
          <div className="no-print mb-2.5 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200 px-2 py-1 rounded">
              📃 GABARITO IMPRESSÃO A4 (100%)
            </span>
          </div>
          {activeOS ? (
            <div className="preview-viewport w-full flex justify-center">
              <div className="preview-scaled-page w-[794px] shrink-0">
                {/* Printable Area component */}
                <OSPreview activeOS={activeOS} />
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 text-center rounded-2xl border text-slate-400">
              Nenhuma O.S. ativa.
            </div>
          )}
        </section>

      </div>
      </main>

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
