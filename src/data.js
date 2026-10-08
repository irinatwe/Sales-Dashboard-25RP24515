export const paymentMethods = ['Cash', 'Card', 'Mobile Money', 'Bank Transfer']
export const saleStatuses = ['Completed', 'Pending', 'Cancelled', 'Refunded']
export const expenseCategories = ['Rent', 'Salaries', 'Transport', 'Utilities', 'Internet', 'Marketing', 'Office Supplies', 'Maintenance', 'Equipment', 'Taxes', 'Other']
export const departments = ['Operations', 'Sales', 'Administration', 'Marketing', 'Technology']

export const initialProducts = [
  { id: 'p-1', code: 'PRD-2026-0001', name: 'Premium Laptop', category: 'Electronics', description: 'Business laptop for professional work.', unitPrice: 1250, costPrice: 820, stock: 18, reorderLevel: 5, supplier: 'TechSource Ltd', discontinued: false },
  { id: 'p-2', code: 'PRD-2026-0002', name: 'Wireless Headset', category: 'Accessories', description: 'Noise-cancelling headset for hybrid teams.', unitPrice: 185, costPrice: 95, stock: 42, reorderLevel: 10, supplier: 'Audio Hub', discontinued: false },
  { id: 'p-3', code: 'PRD-2026-0003', name: '4K Monitor', category: 'Electronics', description: '27-inch 4K monitor with USB-C.', unitPrice: 520, costPrice: 315, stock: 7, reorderLevel: 8, supplier: 'Vision Works', discontinued: false },
  { id: 'p-4', code: 'PRD-2026-0004', name: 'Ergonomic Keyboard', category: 'Accessories', description: 'Comfort-focused keyboard for all-day typing.', unitPrice: 95, costPrice: 48, stock: 0, reorderLevel: 12, supplier: 'Office Plus', discontinued: false },
  { id: 'p-5', code: 'PRD-2026-0005', name: 'USB-C Dock', category: 'Accessories', description: 'Multi-port dock for modern workstations.', unitPrice: 145, costPrice: 80, stock: 23, reorderLevel: 8, supplier: 'TechSource Ltd', discontinued: false },
]

export const initialCustomers = [
  { id: 'c-1', number: 'CUS-2026-0001', name: 'Aline Mukamana', phone: '+250 788 123 456', email: 'aline@example.com', address: 'Kigali, Rwanda', type: 'Individual', registered: '2026-01-12', status: 'Active' },
  { id: 'c-2', number: 'CUS-2026-0002', name: 'Brightline Studio', phone: '+250 788 222 111', email: 'hello@brightline.rw', address: 'Kigali, Rwanda', type: 'Business', registered: '2026-02-04', status: 'Active' },
  { id: 'c-3', number: 'CUS-2026-0003', name: 'Kivu Learning Centre', phone: '+250 788 333 222', email: 'admin@kivulearning.rw', address: 'Karongi, Rwanda', type: 'Organization', registered: '2026-02-18', status: 'Active' },
  { id: 'c-4', number: 'CUS-2026-0004', name: 'Jean Pierre Habimana', phone: '+250 788 444 333', email: 'jp@example.com', address: 'Huye, Rwanda', type: 'Individual', registered: '2026-03-01', status: 'Inactive' },
]

export const initialSales = [
  { id: 's-1', number: 'SAL-2026-0001', customerId: 'c-2', productId: 'p-1', quantity: 2, unitPrice: 1250, discount: 100, subtotal: 2500, total: 2400, paymentMethod: 'Bank Transfer', date: '2026-03-03', salesperson: 'Christian', status: 'Completed', notes: 'Delivered to client office.' },
  { id: 's-2', number: 'SAL-2026-0002', customerId: 'c-1', productId: 'p-2', quantity: 3, unitPrice: 185, discount: 0, subtotal: 555, total: 555, paymentMethod: 'Mobile Money', date: '2026-03-08', salesperson: 'Cyprien', status: 'Completed', notes: '' },
  { id: 's-3', number: 'SAL-2026-0003', customerId: 'c-3', productId: 'p-3', quantity: 2, unitPrice: 520, discount: 40, subtotal: 1040, total: 1000, paymentMethod: 'Card', date: '2026-03-12', salesperson: 'Christian', status: 'Completed', notes: '' },
  { id: 's-4', number: 'SAL-2026-0004', customerId: 'c-2', productId: 'p-5', quantity: 4, unitPrice: 145, discount: 0, subtotal: 580, total: 580, paymentMethod: 'Cash', date: '2026-03-15', salesperson: 'Cyprien', status: 'Pending', notes: 'Awaiting payment confirmation.' },
  { id: 's-5', number: 'SAL-2026-0005', customerId: 'c-1', productId: 'p-2', quantity: 2, unitPrice: 185, discount: 20, subtotal: 370, total: 350, paymentMethod: 'Mobile Money', date: '2026-03-19', salesperson: 'Christian', status: 'Completed', notes: '' },
  { id: 's-6', number: 'SAL-2026-0006', customerId: 'c-3', productId: 'p-1', quantity: 1, unitPrice: 1250, discount: 0, subtotal: 1250, total: 1250, paymentMethod: 'Bank Transfer', date: '2026-03-22', salesperson: 'Cyprien', status: 'Completed', notes: 'Institutional purchase.' },
]

export const initialExpenses = [
  { id: 'e-1', number: 'EXP-2026-0001', category: 'Rent', description: 'March office rent', amount: 650, paymentMethod: 'Bank Transfer', department: 'Administration', date: '2026-03-01', recordedBy: 'Finance', status: 'Paid', notes: '' },
  { id: 'e-2', number: 'EXP-2026-0002', category: 'Internet', description: 'Business internet subscription', amount: 120, paymentMethod: 'Mobile Money', department: 'Technology', date: '2026-03-05', recordedBy: 'Finance', status: 'Paid', notes: '' },
  { id: 'e-3', number: 'EXP-2026-0003', category: 'Marketing', description: 'Social media campaign', amount: 280, paymentMethod: 'Card', department: 'Marketing', date: '2026-03-10', recordedBy: 'Christian', status: 'Paid', notes: '' },
  { id: 'e-4', number: 'EXP-2026-0004', category: 'Transport', description: 'Client delivery transport', amount: 95, paymentMethod: 'Cash', department: 'Operations', date: '2026-03-17', recordedBy: 'Cyprien', status: 'Paid', notes: '' },
  { id: 'e-5', number: 'EXP-2026-0005', category: 'Office Supplies', description: 'Printer paper and stationery', amount: 75, paymentMethod: 'Cash', department: 'Administration', date: '2026-03-20', recordedBy: 'Finance', status: 'Paid', notes: '' },
]

export const money = (value) => `RWF ${new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(value || 0)}`
export const dateLabel = (value) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
export const productStatus = (product) => product.discontinued ? 'Discontinued' : product.stock === 0 ? 'Out of Stock' : product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock'
export const getStorage = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback } }
