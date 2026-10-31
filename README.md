<!-- anime header: só para dar um pouco de personalidade ao README -->

<div align="center">
  <img src="https://raw.githubusercontent.com/ZekaiDev/anime-reaction-gif/main/wink/1.gif" width="150" alt="Anime piscando">
  <img src="https://raw.githubusercontent.com/ZekaiDev/anime-reaction-gif/main/dance/1.gif" width="150" alt="Anime dançando">
  <img src="https://raw.githubusercontent.com/ZekaiDev/anime-reaction-gif/main/cool/1.gif" width="150" alt="Anime estilo cool">

  <h1>VisualPro OS</h1>
  <p>Organização de ordens de serviço para quem trabalha com comunicação visual.</p>

  ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
</div>

---

<!-- sobre o projeto -->

## Sobre

Fiz esse projeto pensando em deixar a criação e a organização das ordens de serviço mais simples no dia a dia da comunicação visual.

A ideia é reunir em um só lugar os dados do cliente, as informações da produção e a imagem de referência da arte. No final, dá para conferir tudo em uma folha A4, gerar o PDF ou imprimir.

## O que já tem por aqui

- Cadastro e edição de ordens de serviço.
- Histórico de ordens, com opções para criar, duplicar e excluir registros.
- Informações do cliente, prazos, responsáveis e dados da empresa.
- Especificação de materiais, dimensões, quantidade, recorte, acabamento e aplicação.
- Inclusão de imagem da arte por seleção ou usando **Ctrl + V**.
- Pré-visualização da ordem em formato A4.
- Exportação da ordem de serviço em PDF.
- Impressão direta pelo navegador.
- Salvamento dos registros no armazenamento local do navegador.

<!-- tecnologias utilizadas -->

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- jsPDF
- html-to-image
- Lucide React

## Rodando na máquina

**Antes de começar:** tenha Node.js e npm instalados.

```bash
# Baixar o projeto
git clone https://github.com/polar4851/geradordeos.git

# Entrar na pasta
cd geradordeos

# Instalar as dependências
npm install

# Iniciar o projeto
npm run dev
```

Depois é só abrir o endereço que aparecer no terminal. Por padrão, o Vite utiliza a porta **3000**.

## Comandos disponíveis

| Comando | Para que serve |
| --- | --- |
| `npm run dev` | Inicia o ambiente de desenvolvimento. |
| `npm run build` | Gera a versão de produção na pasta `dist`. |
| `npm run preview` | Abre uma prévia da versão de produção. |
| `npm run lint` | Verifica os tipos TypeScript. |

## Como funciona o armazenamento

Atualmente, as ordens ficam salvas no `localStorage` do navegador. Isso significa que os registros ficam vinculados ao navegador e ao dispositivo utilizados.

**Importante:** limpar os dados do navegador pode apagar as informações salvas. O armazenamento local não substitui um backup ou um banco de dados centralizado, então é bom manter cópias das informações importantes.

## Fluxo básico

1. Criar uma nova ordem de serviço.
2. Preencher os dados do cliente e as informações da produção.
3. Adicionar a imagem da arte. Também dá para copiar uma imagem e colar com **Ctrl + V**.
4. Conferir a pré-visualização em A4.
5. Gerar o PDF ou imprimir diretamente.

---

<div align="center">
  <img src="https://raw.githubusercontent.com/ZekaiDev/anime-reaction-gif/main/yay/1.gif" width="125" alt="Anime comemorando">

  <p>Feito para facilitar a rotina entre atendimento, arte-final e produção.</p>
  <sub>Se encontrar algum problema ou tiver uma sugestão, pode abrir uma issue.</sub>
</div>

<!-- gifs de reação: https://github.com/ZekaiDev/anime-reaction-gif -->
