import { Account, CreditCard, Budget, FinancialGoal, Transaction } from '../types/finance';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-nubank',
    name: 'Nubank Conta',
    type: 'CHECKING',
    initialBalance: 3420.50,
    color: '#820AD1',
    institution: 'Nubank'
  },
  {
    id: 'acc-itau',
    name: 'Itaú Unibanco',
    type: 'CHECKING',
    initialBalance: 7850.00,
    color: '#EC7000',
    institution: 'Itaú'
  },
  {
    id: 'acc-inter',
    name: 'Banco Inter (Investimentos)',
    type: 'INVESTMENT',
    initialBalance: 16500.00,
    color: '#FF7A00',
    institution: 'Banco Inter'
  },
  {
    id: 'acc-dinheiro',
    name: 'Carteira Física',
    type: 'CASH',
    initialBalance: 280.00,
    color: '#10B981',
    institution: 'Dinheiro em Mãos'
  }
];

export const INITIAL_CREDIT_CARDS: CreditCard[] = [
  {
    id: 'card-nubank-uv',
    name: 'Nubank Ultravioleta',
    limit: 12000,
    closingDay: 25,
    dueDay: 5,
    accountId: 'acc-nubank',
    color: '#820AD1',
    lastDigits: '8492',
    brand: 'Mastercard Black'
  },
  {
    id: 'card-inter-black',
    name: 'Inter Black',
    limit: 15000,
    closingDay: 18,
    dueDay: 28,
    accountId: 'acc-inter',
    color: '#1E293B',
    lastDigits: '6013',
    brand: 'Mastercard'
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'bgt-1', category: 'Alimentação', monthlyLimit: 1600 },
  { id: 'bgt-2', category: 'Moradia', monthlyLimit: 2600 },
  { id: 'bgt-3', category: 'Transporte', monthlyLimit: 500 },
  { id: 'bgt-4', category: 'Lazer & Viagem', monthlyLimit: 700 },
  { id: 'bgt-5', category: 'Assinaturas & Serviços', monthlyLimit: 200 },
  { id: 'bgt-6', category: 'Saúde', monthlyLimit: 400 },
];

export const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'goal-1',
    title: 'Reserva de Emergência (6 Meses)',
    targetAmount: 25000,
    currentAmount: 18500,
    deadline: '2026-12-31',
    color: '#10B981',
    iconName: 'ShieldCheck',
    notes: 'Alocada em Tesouro Selic e CDB 100% CDI',
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    id: 'goal-2',
    title: 'Viagem de Férias para a Europa',
    targetAmount: 15000,
    currentAmount: 9200,
    deadline: '2027-07-20',
    color: '#0EA5E9',
    iconName: 'Plane',
    notes: 'Passagens aéreas, hospedagem e passeios',
    createdAt: Date.now() - 40 * 86400000,
  },
  {
    id: 'goal-3',
    title: 'Entrada do Novo Imóvel',
    targetAmount: 60000,
    currentAmount: 24000,
    deadline: '2028-06-30',
    color: '#8B5CF6',
    iconName: 'Home',
    notes: 'Aportes mensais constantes em investimentos',
    createdAt: Date.now() - 90 * 86400000,
  },
  {
    id: 'goal-4',
    title: 'MacBook Pro M3 Max',
    targetAmount: 14000,
    currentAmount: 14000,
    deadline: '2026-10-15',
    color: '#F59E0B',
    iconName: 'Laptop',
    notes: 'Meta atingida para setup profissional',
    createdAt: Date.now() - 120 * 86400000,
  },
];

export function generateInitialTransactions(): Transaction[] {
  const currentYearMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-09"
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Helper to format date in month
  const d = (mOffset: number, day: number) => {
    const target = new Date(year, month + mOffset, day);
    return target.toISOString().slice(0, 10);
  };

  return [
    // Current month transactions
    {
      id: 'tx-101',
      description: 'Salário Mensal Tech Solutions',
      amount: 8200.00,
      type: 'INCOME',
      category: 'Salário & Remuneração',
      accountId: 'acc-itau',
      date: d(0, 5),
      status: 'PAID',
      notes: 'Depósito em conta corrente CLT',
      createdAt: Date.now() - 20 * 86400000
    },
    {
      id: 'tx-102',
      description: 'Freelance App Mobile Kotlin',
      amount: 1850.00,
      type: 'INCOME',
      category: 'Freelance & Bicos',
      accountId: 'acc-nubank',
      date: d(0, 12),
      status: 'PAID',
      notes: 'Desenvolvimento de módulo de autenticação',
      createdAt: Date.now() - 13 * 86400000
    },
    {
      id: 'tx-103',
      description: 'Rendimentos Tesouro & CDB',
      amount: 215.40,
      type: 'INCOME',
      category: 'Rendimentos & Dividendos',
      accountId: 'acc-inter',
      date: d(0, 15),
      status: 'PAID',
      notes: 'Crédito automático mensal',
      createdAt: Date.now() - 10 * 86400000
    },
    {
      id: 'tx-104',
      description: 'Aluguel do Apartamento',
      amount: 1950.00,
      type: 'EXPENSE',
      category: 'Moradia',
      accountId: 'acc-itau',
      date: d(0, 10),
      status: 'PAID',
      notes: 'PIX proprietário',
      createdAt: Date.now() - 15 * 86400000
    },
    {
      id: 'tx-105',
      description: 'Condomínio Residencial',
      amount: 480.00,
      type: 'EXPENSE',
      category: 'Moradia',
      accountId: 'acc-itau',
      date: d(0, 10),
      status: 'PAID',
      notes: 'Boleto bancário',
      createdAt: Date.now() - 15 * 86400000
    },
    {
      id: 'tx-106',
      description: 'Supermercado Pão de Açúcar',
      amount: 540.25,
      type: 'EXPENSE',
      category: 'Alimentação',
      accountId: 'acc-nubank',
      creditCardId: 'card-nubank-uv',
      date: d(0, 8),
      status: 'PAID',
      createdAt: Date.now() - 17 * 86400000
    },
    {
      id: 'tx-107',
      description: 'Feira Orgânica & Hortifrúti',
      amount: 165.80,
      type: 'EXPENSE',
      category: 'Alimentação',
      accountId: 'acc-dinheiro',
      date: d(0, 14),
      status: 'PAID',
      createdAt: Date.now() - 11 * 86400000
    },
    {
      id: 'tx-108',
      description: 'Abastecimento Posto Shell',
      amount: 230.00,
      type: 'EXPENSE',
      category: 'Transporte',
      accountId: 'acc-nubank',
      creditCardId: 'card-nubank-uv',
      date: d(0, 11),
      status: 'PAID',
      createdAt: Date.now() - 14 * 86400000
    },
    {
      id: 'tx-109',
      description: 'Netflix + Spotify Duo',
      amount: 84.80,
      type: 'EXPENSE',
      category: 'Assinaturas & Serviços',
      accountId: 'acc-nubank',
      creditCardId: 'card-nubank-uv',
      date: d(0, 3),
      status: 'PAID',
      createdAt: Date.now() - 22 * 86400000
    },
    {
      id: 'tx-110',
      description: 'Jantar Restaurante Fogo de Chão',
      amount: 290.00,
      type: 'EXPENSE',
      category: 'Lazer & Viagem',
      accountId: 'acc-nubank',
      creditCardId: 'card-nubank-uv',
      date: d(0, 17),
      status: 'PAID',
      createdAt: Date.now() - 8 * 86400000
    },
    {
      id: 'tx-111',
      description: 'Farmácia Panvel Medicamentos',
      amount: 98.40,
      type: 'EXPENSE',
      category: 'Saúde',
      accountId: 'acc-nubank',
      date: d(0, 16),
      status: 'PAID',
      createdAt: Date.now() - 9 * 86400000
    },
    {
      id: 'tx-112',
      description: 'Notebook Dell Pro',
      amount: 389.90,
      type: 'EXPENSE',
      category: 'Compras & Shopping',
      accountId: 'acc-inter',
      creditCardId: 'card-inter-black',
      date: d(0, 18),
      status: 'PAID',
      installments: {
        current: 3,
        total: 10,
        parentId: 'parent-notebook'
      },
      createdAt: Date.now() - 7 * 86400000
    },
    {
      id: 'tx-113',
      description: 'Curso Jetpack Compose Master',
      amount: 145.00,
      type: 'EXPENSE',
      category: 'Educação',
      accountId: 'acc-nubank',
      creditCardId: 'card-nubank-uv',
      date: d(0, 7),
      status: 'PAID',
      installments: {
        current: 2,
        total: 4,
        parentId: 'parent-curso-compose'
      },
      createdAt: Date.now() - 18 * 86400000
    },
    {
      id: 'tx-114',
      description: 'Aporte Reserva de Emergência',
      amount: 1500.00,
      type: 'TRANSFER',
      category: 'Outras Despesas',
      accountId: 'acc-itau',
      destinationAccountId: 'acc-inter',
      date: d(0, 6),
      status: 'PAID',
      notes: 'Transferência entre contas próprias',
      createdAt: Date.now() - 19 * 86400000
    },
    {
      id: 'tx-115',
      description: 'Conta de Energia CPFL',
      amount: 178.60,
      type: 'EXPENSE',
      category: 'Contas & Boletos',
      accountId: 'acc-itau',
      date: d(0, 27),
      status: 'PENDING',
      notes: 'Débito em conta / Boleto bancário',
      createdAt: Date.now() - 2 * 86400000
    },
    {
      id: 'tx-116',
      description: 'Internet Fibra Claro 500MB',
      amount: 149.90,
      type: 'EXPENSE',
      category: 'Contas & Boletos',
      accountId: 'acc-nubank',
      date: d(0, 28),
      status: 'PENDING',
      notes: 'Boleto mensal internet',
      createdAt: Date.now() - 2 * 86400000
    },
    {
      id: 'tx-117',
      description: 'Plano de Saúde Unimed',
      amount: 420.00,
      type: 'EXPENSE',
      category: 'Saúde',
      accountId: 'acc-itau',
      date: d(0, 30),
      status: 'PENDING',
      notes: 'Mensalidade plano de saúde',
      createdAt: Date.now() - 3 * 86400000
    },
    {
      id: 'tx-118',
      description: 'Freelance Design Landing Page',
      amount: 1650.00,
      type: 'INCOME',
      category: 'Freelance & Bicos',
      accountId: 'acc-nubank',
      date: d(0, 29),
      status: 'PENDING',
      notes: 'Entrega final do projeto UI/UX',
      createdAt: Date.now() - 4 * 86400000
    },
    {
      id: 'tx-119',
      description: 'Reembolso Despesas Viagem',
      amount: 340.00,
      type: 'INCOME',
      category: 'Reembolso / Outros',
      accountId: 'acc-itau',
      date: d(0, 26),
      status: 'PENDING',
      notes: 'Reembolso corporativo aprovado',
      createdAt: Date.now() - 5 * 86400000
    },

    // Prior months data for 6-month comparison chart
    // Month -1
    {
      id: 'tx-p1-inc',
      description: 'Salário Tech Solutions',
      amount: 8200.00,
      type: 'INCOME',
      category: 'Salário & Remuneração',
      accountId: 'acc-itau',
      date: d(-1, 5),
      status: 'PAID',
      createdAt: Date.now() - 50 * 86400000
    },
    {
      id: 'tx-p1-exp1',
      description: 'Gastos Mensais Moradia & Despesas',
      amount: 3200.00,
      type: 'EXPENSE',
      category: 'Moradia',
      accountId: 'acc-itau',
      date: d(-1, 10),
      status: 'PAID',
      createdAt: Date.now() - 45 * 86400000
    },
    {
      id: 'tx-p1-exp2',
      description: 'Alimentação e Mercado',
      amount: 1450.00,
      type: 'EXPENSE',
      category: 'Alimentação',
      accountId: 'acc-nubank',
      creditCardId: 'card-nubank-uv',
      date: d(-1, 15),
      status: 'PAID',
      createdAt: Date.now() - 40 * 86400000
    },

    // Month -2
    {
      id: 'tx-p2-inc',
      description: 'Salário Tech Solutions + Bônus',
      amount: 9500.00,
      type: 'INCOME',
      category: 'Salário & Remuneração',
      accountId: 'acc-itau',
      date: d(-2, 5),
      status: 'PAID',
      createdAt: Date.now() - 80 * 86400000
    },
    {
      id: 'tx-p2-exp1',
      description: 'Gastos Fixos & Habitação',
      amount: 3100.00,
      type: 'EXPENSE',
      category: 'Moradia',
      accountId: 'acc-itau',
      date: d(-2, 10),
      status: 'PAID',
      createdAt: Date.now() - 75 * 86400000
    },
    {
      id: 'tx-p2-exp2',
      description: 'Lazer e Viagem Fim de Semana',
      amount: 1320.00,
      type: 'EXPENSE',
      category: 'Lazer & Viagem',
      accountId: 'acc-nubank',
      creditCardId: 'card-nubank-uv',
      date: d(-2, 18),
      status: 'PAID',
      createdAt: Date.now() - 67 * 86400000
    },

    // Month -3
    {
      id: 'tx-p3-inc',
      description: 'Salário Tech Solutions',
      amount: 8200.00,
      type: 'INCOME',
      category: 'Salário & Remuneração',
      accountId: 'acc-itau',
      date: d(-3, 5),
      status: 'PAID',
      createdAt: Date.now() - 110 * 86400000
    },
    {
      id: 'tx-p3-exp',
      description: 'Despesas Gerais Consolidadas',
      amount: 4100.00,
      type: 'EXPENSE',
      category: 'Alimentação',
      accountId: 'acc-itau',
      date: d(-3, 14),
      status: 'PAID',
      createdAt: Date.now() - 100 * 86400000
    },

    // Month -4
    {
      id: 'tx-p4-inc',
      description: 'Salário Tech Solutions',
      amount: 8200.00,
      type: 'INCOME',
      category: 'Salário & Remuneração',
      accountId: 'acc-itau',
      date: d(-4, 5),
      status: 'PAID',
      createdAt: Date.now() - 140 * 86400000
    },
    {
      id: 'tx-p4-exp',
      description: 'Despesas Gerais Consolidadas',
      amount: 3850.00,
      type: 'EXPENSE',
      category: 'Moradia',
      accountId: 'acc-itau',
      date: d(-4, 15),
      status: 'PAID',
      createdAt: Date.now() - 130 * 86400000
    },

    // Month -5
    {
      id: 'tx-p5-inc',
      description: 'Salário Tech Solutions',
      amount: 8000.00,
      type: 'INCOME',
      category: 'Salário & Remuneração',
      accountId: 'acc-itau',
      date: d(-5, 5),
      status: 'PAID',
      createdAt: Date.now() - 170 * 86400000
    },
    {
      id: 'tx-p5-exp',
      description: 'Despesas Gerais Consolidadas',
      amount: 3700.00,
      type: 'EXPENSE',
      category: 'Moradia',
      accountId: 'acc-itau',
      date: d(-5, 12),
      status: 'PAID',
      createdAt: Date.now() - 160 * 86400000
    }
  ];
}
