import { combineReducers } from 'redux';
import CustomersReducer from './Party/CustomerReducer/CustomerReducer';
import SupplierReducer from './Party/SupplierReducer/SupplierReducer';
import OtherExpenseReducer from './Party/OtherExpenseReducer/OtherExpenseReducer';
import ProductsReducer from './ProductsReducer/ProductsReducer';
import PurchaseReducer from './PurchaseReducer/PurchaseReducer';
import InvoiceReducer from './InvoiceReducer/InvoiceReducer';
import PettyCashReducer from './PettyCashReducer/PettyCashReducer';
import PartyTypeReducer from './Party/PartyTypeReducer/PartyTypeReducer';
import ItemReducer from './ItemsReducer/ItemsReducer';
import ReportsReducer from './ReportsReducer/ReportsReducer';
import AuthReducer from './AuthReducer/AuthReducer';
import UsersReducer from './UserReducer/UserReducer';
import CategoryReducer from './ProductsReducer/CategoryReducer';
import QRBatchReducer from './QRBatchReducer/QRBatchReducer';
import PrintSettingsReducer from './PrintSettingsReducer/PrintSettingsReducer';

const partyReducer = combineReducers({
  customer: CustomersReducer,
  supplier: SupplierReducer,
  otherExpense: OtherExpenseReducer,
  partyType: PartyTypeReducer
});

const LPGReducer = combineReducers({
  purchase: PurchaseReducer,
  invoice: InvoiceReducer,
  item: ItemReducer
});

// Combine both reducers into a single root reducer
const rootReducer = combineReducers({
  PRT: partyReducer,
  LPG: LPGReducer,
  PC: PettyCashReducer,
  reports: ReportsReducer,
  auth: AuthReducer,
  user: UsersReducer,
  product: ProductsReducer,
  category: CategoryReducer,
  qrBatch: QRBatchReducer,
  printSettings: PrintSettingsReducer
});

export default rootReducer;
