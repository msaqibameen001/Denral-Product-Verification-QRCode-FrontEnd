const initialState = {
  // Sales Report State
  salesReport: {
    sales: [],
    summary: {
      totalInvoices: 0,
      totalCustomers: 0,
      totalQuantity: 0,
      totalKilograms: 0,
      totalAmount: 0,
      totalOtherCharges: 0,
      totalSales: 0,
      totalCost: 0,
      totalProfit: 0,
      overallProfitPercentage: 0
    }
  },
  salesLoading: false,
  salesError: null,

  // Purchase Report State
  purchaseReport: {
    purchases: [],
    summary: {
      totalPurchases: 0,
      totalSuppliers: 0,
      totalQuantity: 0,
      totalPurchaseAmount: 0,
      averagePricePerKg: 0,
      minPricePerKg: 0,
      maxPricePerKg: 0
    }
  },
  purchaseLoading: false,
  purchaseError: null,

  // Ledger Report State
  ledgerReport: {
    partyInfo: {
      partyId: 0,
      partyName: '',
      phone: '',
      address: '',
      partyTypeName: '',
      openingBalance: 0,
      currentBalance: 0
    },
    transactions: [],
    summary: {
      openingBalance: 0,
      totalDebits: 0,
      totalCredits: 0,
      closingBalance: 0
    }
  },
  ledgerLoading: false,
  ledgerError: null
};

const ReportsReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==================== SALES REPORT ====================
    case 'FETCH_SALES_REPORT_REQUEST':
      return { 
        ...state, 
        salesLoading: true, 
        salesError: null 
      };

    case 'FETCH_SALES_REPORT_SUCCESS':
      return {
        ...state,
        salesLoading: false,
        salesReport: action.payload,
        salesError: null
      };

    case 'FETCH_SALES_REPORT_FAILURE':
      return {
        ...state,
        salesLoading: false,
        salesError: action.payload
      };

    case 'CLEAR_SALES_REPORT':
      return {
        ...state,
        salesReport: initialState.salesReport,
        salesError: null
      };

    // ==================== PURCHASE REPORT ====================
    case 'FETCH_PURCHASE_REPORT_REQUEST':
      return {
        ...state,
        purchaseLoading: true,
        purchaseError: null
      };

    case 'FETCH_PURCHASE_REPORT_SUCCESS':
      return {
        ...state,
        purchaseLoading: false,
        purchaseReport: action.payload,
        purchaseError: null
      };

    case 'FETCH_PURCHASE_REPORT_FAILURE':
      return {
        ...state,
        purchaseLoading: false,
        purchaseError: action.payload
      };

    case 'CLEAR_PURCHASE_REPORT':
      return {
        ...state,
        purchaseReport: initialState.purchaseReport,
        purchaseError: null
      };

    // ==================== LEDGER REPORT ====================
    case 'FETCH_LEDGER_REPORT_REQUEST':
      return {
        ...state,
        ledgerLoading: true,
        ledgerError: null
      };

    case 'FETCH_LEDGER_REPORT_SUCCESS':
      return {
        ...state,
        ledgerLoading: false,
        ledgerReport: action.payload,
        ledgerError: null
      };

    case 'FETCH_LEDGER_REPORT_FAILURE':
      return {
        ...state,
        ledgerLoading: false,
        ledgerError: action.payload
      };

    case 'CLEAR_LEDGER_REPORT':
      return {
        ...state,
        ledgerReport: initialState.ledgerReport,
        ledgerError: null
      };

    default:
      return state;
  }
};

export default ReportsReducer;