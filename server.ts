import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI with telemetry User-Agent as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer & Viagem',
  'Educação',
  'Compras & Shopping',
  'Assinaturas & Serviços',
  'Contas & Boletos',
  'Outras Despesas',
];

const INCOME_CATEGORIES = [
  'Salário & Remuneração',
  'Freelance & Bicos',
  'Rendimentos & Dividendos',
  'Reembolso / Outros',
];

// Endpoint for AI category suggestions based on description
app.post('/api/suggest-category', async (req, res) => {
  try {
    const { description, type } = req.body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Descrição é obrigatória.' });
    }

    const isExpense = type !== 'INCOME';
    const allowedCategories = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analise a descrição desta movimentação financeira (${isExpense ? 'Despesa' : 'Receita'}): "${description.trim()}".
Selecione a categoria mais adequada estritamente dentre as opções permitidas:
${allowedCategories.join(', ')}.

Exemplos:
- "iFood burger", "Supermercado Pão de Açúcar", "Padaria Estrela" -> "Alimentação"
- "Uber viagem", "Abastecimento Shell", "Pedágio AutoBan" -> "Transporte"
- "Aluguel", "Condomínio Edifício", "IPTU parcela" -> "Moradia"
- "Farmácia Raia", "Consulta dentista", "Exame sangue" -> "Saúde"
- "Cinema ingresso", "Passagem aérea", "Hotel pousada" -> "Lazer & Viagem"
- "Curso Kotlin", "Mensalidade faculdade", "Livro técnico" -> "Educação"
- "Amazon tênis", "Magazine Luiza", "Zara camisa" -> "Compras & Shopping"
- "Netflix mensalidade", "Spotify Premium", "Google One" -> "Assinaturas & Serviços"
- "Conta de Luz Enel", "Sabesp água", "Internet Claro" -> "Contas & Boletos"
- "Salário empresa", "Pagamento mensal CLT", "Adiantamento quinzenal" -> "Salário & Remuneração"
- "Desenvolvimento site cliente", "Design UI freelance" -> "Freelance & Bicos"
- "Dividendos Petrobras", "Rendimento CDB banco" -> "Rendimentos & Dividendos"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'A categoria selecionada exatamente como uma das opções permitidas.',
            },
            reason: {
              type: Type.STRING,
              description: 'Breve justificativa em uma frase em português.',
            },
          },
          required: ['category'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const matchedCategory = allowedCategories.find(
      c => c.toLowerCase() === (parsed.category || '').toLowerCase()
    ) || (isExpense ? 'Outras Despesas' : 'Reembolso / Outros');

    return res.json({
      category: matchedCategory,
      reason: parsed.reason || '',
    });
  } catch (error: any) {
    console.error('Error suggesting category with Gemini API:', error);
    return res.status(500).json({
      error: 'Erro ao sugerir categoria com Gemini',
      details: error?.message || 'Unknown error',
    });
  }
});

// Endpoint for AI Financial Insights & Health Assessment
app.post('/api/financial-insights', async (req, res) => {
  try {
    const { income, expense, balance, savingsRate, topCategories, goalsSummary, month } = req.body;

    const prompt = `Você é o consultor de inteligência financeira do aplicativo Gestor Financeiro.
Analise os seguintes dados financeiros do usuário no mês ${month || 'atual'}:
- Receitas Totais: R$ ${Number(income || 0).toFixed(2)}
- Despesas Totais: R$ ${Number(expense || 0).toFixed(2)}
- Saldo Líquido: R$ ${Number(balance || 0).toFixed(2)}
- Taxa de Poupança: ${Number(savingsRate || 0).toFixed(1)}%
- Maiores categorias de despesa: ${JSON.stringify(topCategories || [])}
- Metas financeiras cadastradas: ${JSON.stringify(goalsSummary || [])}

Forneça uma análise financeira executiva, humana, motivadora e prática com:
1. Status geral da saúde financeira (ex: "Excelente", "Equilibrado", "Alerta de Gastos", "Risco de Endividamento").
2. Um resumo de 2 a 3 frases em tom amigável e profissional.
3. 3 dicas práticas acionáveis para otimizar gastos ou acelerar o alcance das metas.
4. Uma recomendação específica para as metas financeiras.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: 'Status resumido da saúde financeira (ex: Excelente, Equilibrado, Atenção aos Gastos)',
            },
            summary: {
              type: Type.STRING,
              description: 'Resumo conciso da saúde financeira em 2 a 3 frases.',
            },
            tips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Título curto da dica' },
                  tip: { type: Type.STRING, description: 'Descrição da recomendação acionável' },
                  type: { type: Type.STRING, description: 'Tipo: ECONOMIA, INVESTIMENTO, or ALERTA' },
                },
                required: ['title', 'tip', 'type'],
              },
              description: 'Lista de 3 dicas práticas.',
            },
            goalAdvice: {
              type: Type.STRING,
              description: 'Recomendação focada nas metas de longo prazo.',
            },
          },
          required: ['status', 'summary', 'tips', 'goalAdvice'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating financial insights with Gemini:', error);
    return res.status(500).json({
      error: 'Erro ao gerar insights com Gemini',
      details: error?.message || 'Unknown error',
    });
  }
});

// Endpoint for automated WhatsApp reminder dispatch & webhook forwarding
app.post('/api/whatsapp-automation/dispatch', async (req, res) => {
  try {
    const { phone, message, transaction, customWebhookUrl } = req.body;

    // If a custom webhook/gateway is provided (e.g. Evolution API, Z-API, Baileys gateway)
    if (customWebhookUrl) {
      try {
        const webhookRes = await fetch(customWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: phone,
            message: message,
            transaction: transaction,
          }),
        });
        const webhookData = await webhookRes.json().catch(() => ({}));
        return res.json({
          success: true,
          dispatchedVia: 'CUSTOM_GATEWAY',
          details: webhookData,
        });
      } catch (webhookErr: any) {
        console.warn('Custom WhatsApp Webhook failed:', webhookErr);
      }
    }

    // Default response confirming formatted payload is prepared
    return res.json({
      success: true,
      dispatchedVia: 'WHATSAPP_INTENT',
      timestamp: new Date().toISOString(),
      phone: phone || null,
      messagePreview: message ? message.slice(0, 80) + '...' : '',
    });
  } catch (err: any) {
    console.error('Error dispatching automated WhatsApp reminder:', err);
    return res.status(500).json({ error: 'Erro ao processar disparo de WhatsApp' });
  }
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gestor Financeiro Server rodando em http://0.0.0.0:${PORT}`);
  });
}

start();
