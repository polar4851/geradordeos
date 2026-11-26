<div align="center">

<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif" width="72" alt="Pikachu pixel art" />
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/6.gif" width="96" alt="Charizard pixel art" />
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/133.gif" width="72" alt="Eevee pixel art" />

# Traço OS

**Gestão de ordens de serviço para comunicação visual.**

Organize pedidos, acompanhe prazos e entregue à produção uma ficha técnica clara, com medidas, materiais e referência da arte.

![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

</div>

---

## O que é

O **Traço OS** foi pensado para a rotina de gráficas e empresas de comunicação visual. Ele centraliza as informações do serviço desde o atendimento até a execução: cliente, responsáveis, prazo, material, dimensões, acabamentos e imagem de referência.

## Recursos

- Cadastro, edição, duplicação e exclusão de ordens de serviço.
- Histórico pesquisável por cliente, número da O.S., vendedor e material.
- Painel com totais, rascunhos, ordens em produção, concluídas e prazos vencidos.
- Cadastro de empresa, cliente, contato, vendedor, arte-finalista e datas.
- Seleção de materiais como adesivo, lona, PVC, acrílico, MDF e banner.
- Medidas, quantidade, cálculo de área, recorte, acabamento e aplicação.
- Imagem de referência por upload, arrastar e soltar ou colagem com **Ctrl + V**.
- Pré-visualização da ficha em formato A4.
- Exportação em PDF e impressão pelo navegador.
- Backup e restauração dos registros em JSON.
- Salvamento local automático no navegador.

## Tecnologias

React 19, TypeScript, Vite, Tailwind CSS, jsPDF, html-to-image e Lucide React.

## Executar localmente

Requisitos: Node.js e npm.

```bash
git clone https://github.com/polar4851/geradordeos.git
cd geradordeos
npm install
npm run dev
```

O endereço local será exibido no terminal. O servidor Vite utiliza a porta 3000 por padrão.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente de desenvolvimento. |
| `npm run build` | Gera os arquivos de produção em `dist`. |
| `npm run preview` | Visualiza a versão de produção. |
| `npm run lint` | Verifica os tipos TypeScript. |

## Armazenamento: leia antes de usar

Nesta versão, as ordens ficam no `localStorage` do navegador. Isso significa que **não há sincronização entre computadores ou navegadores**, nem banco de dados remoto.

Faça backups regularmente usando **Exportar backup**. A restauração substitui os registros existentes no navegador pelos dados do arquivo escolhido. Guarde os backups em local seguro, pois podem conter informações de clientes.

## Fluxo de trabalho

1. Crie uma ordem e informe empresa, cliente e responsáveis.
2. Escolha o material e preencha medidas, quantidade e acabamentos.
3. Adicione a imagem de referência da arte.
4. Revise a ficha A4 antes de encaminhar o serviço para produção.
5. Exporte o PDF ou imprima.
6. Faça backup dos registros periodicamente.

---

## Criador

Desenvolvido por **Warleandro Nascimento**.

- Instagram: [@warleandro._](https://instagram.com/warleandro._)
- WhatsApp: [63 99931-8046](https://wa.me/5563999318046)
