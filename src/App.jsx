import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { Alert, AppBar, Box, Button, Card, CardContent, Chip, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, TextField, Toolbar, Tooltip, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded'
import { departments, expenseCategories, getStorage, initialCustomers, initialExpenses, initialProducts, initialSales, money, dateLabel, paymentMethods, productStatus, saleStatuses } from './data'
import { ManagementPage } from './Management.jsx'

const navItems = [{ label: 'Overview', path: '/', icon: <DashboardRoundedIcon /> }, { label: 'Sales', path: '/sales', icon: <PointOfSaleRoundedIcon /> }, { label: 'Products', path: '/products', icon: <Inventory2RoundedIcon /> }, { label: 'Expenses', path: '/expenses', icon: <ReceiptLongRoundedIcon /> }, { label: 'Customers', path: '/customers', icon: <PeopleAltRoundedIcon /> }, { label: 'Reports', path: '/reports', icon: <InsightsRoundedIcon /> }]

function useBusinessStore() {
  const [products, setProducts] = useState(() => getStorage('biz-products', initialProducts))
  const [customers, setCustomers] = useState(() => getStorage('biz-customers', initialCustomers))
  const [sales, setSales] = useState(() => getStorage('biz-sales', initialSales))
  const [expenses, setExpenses] = useState(() => getStorage('biz-expenses', initialExpenses))
  const [notice, setNotice] = useState('')
  useEffect(() => { localStorage.setItem('biz-products', JSON.stringify(products)) }, [products])
  useEffect(() => { localStorage.setItem('biz-customers', JSON.stringify(customers)) }, [customers])
  useEffect(() => { localStorage.setItem('biz-sales', JSON.stringify(sales)) }, [sales])
  useEffect(() => { localStorage.setItem('biz-expenses', JSON.stringify(expenses)) }, [expenses])
  const completedSales = useMemo(() => sales.filter((sale) => sale.status === 'Completed'), [sales])
  const totalSales = useMemo(() => completedSales.reduce((sum, sale) => sum + sale.total, 0), [completedSales])
  const totalExpenses = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses])
  const metrics = useMemo(() => ({ totalSales, totalExpenses, netIncome: totalSales - totalExpenses, averageSale: completedSales.length ? totalSales / completedSales.length : 0 }), [completedSales.length, totalExpenses, totalSales])
  const addSale = (payload) => {
    const product = products.find((item) => item.id === payload.productId)
    if (!product || payload.quantity > product.stock) { setNotice(`Only ${product?.stock || 0} units of ${product?.name || 'this product'} are available.`); return false }
    const subtotal = payload.quantity * product.unitPrice; const discount = Number(payload.discount) || 0
    const sale = { ...payload, id: `s-${Date.now()}`, number: `SAL-2026-${String(sales.length + 1).padStart(4, '0')}`, unitPrice: product.unitPrice, subtotal, discount, total: Math.max(0, subtotal - discount), status: 'Completed', salesperson: 'Finance Desk' }
    setSales((current) => [sale, ...current]); setProducts((current) => current.map((item) => item.id === product.id ? { ...item, stock: item.stock - sale.quantity } : item)); setNotice('Sale recorded and inventory updated.'); return true
  }
  const addExpense = (payload) => { const amount = Number(payload.amount); if (!amount || amount <= 0) return setNotice('Expense amount must be greater than zero.'); setExpenses((current) => [{ ...payload, id: `e-${Date.now()}`, number: `EXP-2026-${String(current.length + 1).padStart(4, '0')}`, amount, status: 'Paid', recordedBy: 'Finance Desk' }, ...current]); setNotice('Expense recorded successfully.') }
  const updateProduct = (id, payload) => { setProducts((current) => current.map((item) => item.id === id ? { ...item, ...payload, unitPrice: Number(payload.unitPrice), costPrice: Number(payload.costPrice) || 0, stock: Number(payload.stock) || 0, reorderLevel: Number(payload.reorderLevel) || 0 } : item)); setNotice('Product updated successfully.') }
  const removeProduct = (id) => { if (sales.some((sale) => sale.productId === id)) return setNotice('Products with sales history cannot be deleted.'); setProducts((current) => current.filter((item) => item.id !== id)); setNotice('Product deleted.') }
  const updateCustomer = (id, payload) => { setCustomers((current) => current.map((item) => item.id === id ? { ...item, ...payload } : item)); setNotice('Customer updated successfully.') }
  const removeCustomer = (id) => { if (sales.some((sale) => sale.customerId === id)) return setNotice('Customers with sales history cannot be deleted.'); setCustomers((current) => current.filter((item) => item.id !== id)); setNotice('Customer deleted.') }
  const updateExpense = (id, payload) => { const amount = Number(payload.amount); if (!amount || amount <= 0) return setNotice('Expense amount must be greater than zero.'); setExpenses((current) => current.map((item) => item.id === id ? { ...item, ...payload, amount } : item)); setNotice('Expense updated successfully.') }
    const updateSale = (id, payload) => {
      const previous = sales.find((item) => item.id === id)
      const product = products.find((item) => item.id === payload.productId)
      if (!previous || !product) { setNotice('Choose a valid product for this sale.'); return false }
      const available = product.stock + (previous.status === 'Completed' && previous.productId === product.id ? previous.quantity : 0)
      if (payload.status === 'Completed' && Number(payload.quantity) > available) { setNotice(`Only ${available} units of ${product.name} are available.`); return false }
      const quantity = Number(payload.quantity)
      const discount = Number(payload.discount) || 0
      const updated = { ...previous, ...payload, quantity, discount, unitPrice: product.unitPrice, subtotal: quantity * product.unitPrice, total: Math.max(0, quantity * product.unitPrice - discount) }
      setSales((current) => current.map((item) => item.id === id ? updated : item))
      setProducts((current) => current.map((item) => {
        let stock = item.stock
        if (previous.status === 'Completed' && previous.productId === item.id) stock += previous.quantity
        if (updated.status === 'Completed' && updated.productId === item.id) stock -= updated.quantity
        return stock === item.stock ? item : { ...item, stock }
      }))
      setNotice('Sale updated and inventory adjusted.'); return true
    }
  const addCustomer = (payload) => {
    if (!payload.name.trim() || !payload.phone.trim() || !payload.email.trim()) return setNotice('Name, phone, and email are required.')
    const customer = { ...payload, id: `c-${Date.now()}`, number: `CUS-2026-${String(customers.length + 1).padStart(4, '0')}`, registered: new Date().toISOString().slice(0, 10), status: 'Active' }
    setCustomers((current) => [...current, customer])
    setNotice('Customer added successfully.')
    return customer
  }
  const updateSaleStatus = (id, status) => {
    const sale = sales.find((item) => item.id === id)
    if (!sale || sale.status === status) return
    const wasCompleted = sale.status === 'Completed'
    const becomesCompleted = status === 'Completed'
    if (!wasCompleted && becomesCompleted) {
      const product = products.find((item) => item.id === sale.productId)
      if (!product || product.stock < sale.quantity) return setNotice(`Cannot complete this sale: only ${product?.stock || 0} units are available.`)
    }
    setSales((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    if (wasCompleted !== becomesCompleted) setProducts((current) => current.map((item) => item.id === sale.productId ? { ...item, stock: item.stock + (wasCompleted ? sale.quantity : -sale.quantity) } : item))
    setNotice(`Sale marked ${status.toLowerCase()}${wasCompleted !== becomesCompleted ? ' and inventory updated' : ''}.`)
  }
  const removeSale = (id) => { const sale = sales.find((item) => item.id === id); if (!sale) return; if (sale.status === 'Completed') setProducts((current) => current.map((item) => item.id === sale.productId ? { ...item, stock: item.stock + sale.quantity } : item)); setSales((current) => current.filter((item) => item.id !== id)); setNotice('Sale deleted and inventory updated.') }
  const removeExpense = (id) => { setExpenses((current) => current.filter((expense) => expense.id !== id)); setNotice('Expense deleted.') }
  return { products, setProducts, customers, sales, expenses, completedSales, metrics, addSale, addExpense, addCustomer, updateProduct, removeProduct, updateCustomer, removeCustomer, updateExpense, updateSale, removeSale, removeExpense, updateSaleStatus, notice, setNotice }
}

const AUTH_USERS_KEY = 'ledgerly-users'
const AUTH_SESSION_KEY = 'ledgerly-session'
const DEFAULT_ADMIN_EMAIL = 'irinatwefabrice40@gmail.com'
const DEFAULT_ADMIN_PASSWORD = 'fabra@123'

function hashPassword(password) {
  let hash = 2166136261
  for (let index = 0; index < password.length; index += 1) {
    hash ^= password.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function getStoredUsers() {
  const raw = localStorage.getItem(AUTH_USERS_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      localStorage.removeItem(AUTH_USERS_KEY)
    }
  }

  const defaultUsers = [{
    id: 'admin-1',
    name: 'Admin User',
    email: DEFAULT_ADMIN_EMAIL,
    passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    role: 'admin',
    createdAt: new Date().toISOString(),
  }]

  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(defaultUsers))
  return defaultUsers
}

function getSessionUser() {
  const raw = localStorage.getItem(AUTH_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function AuthScreen({ onSuccess, onCustomerSignup }) {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: DEFAULT_ADMIN_EMAIL,
    password: '',
    confirmPassword: '',
  })

  const submit = (event) => {
    event.preventDefault()
    const email = form.email.trim().toLowerCase()
    const password = form.password
    const users = getStoredUsers()

    if (mode === 'reset') {
      if (!email) {
        setError('Enter the email address for your account.')
        return
      }
      if (password.length < 6) {
        setError('New password must be at least 6 characters long.')
        return
      }
      if (password !== form.confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      const accountExists = users.some((user) => user.email.toLowerCase() === email)
      if (!accountExists) {
        setError('No account was found for that email in this browser.')
        return
      }

      const updatedUsers = users.map((user) => user.email.toLowerCase() === email ? { ...user, passwordHash: hashPassword(password) } : user)
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(updatedUsers))
      setError('')
      setMessage('Password updated on this browser. Return to sign in.')
      setForm((current) => ({ ...current, password: '', confirmPassword: '' }))
      return
    }

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    if (mode === 'login') {
      const match = users.find((user) => user.email.toLowerCase() === email && user.passwordHash === hashPassword(password))
      if (!match) {
        setError('Email or password is incorrect.')
        return
      }

      const sessionUser = { id: match.id, name: match.name, email: match.email, role: match.role, customerId: match.customerId }
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser))
      onSuccess(sessionUser)
      return
    }

    if (!form.name.trim() || !form.phone.trim()) {
      setError('Full name and phone are required for customer sign-up.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (users.some((user) => user.email.toLowerCase() === email)) {
      setError('This email already exists in the app.')
      return
    }

    const existingCustomer = onCustomerSignup.findCustomer(email)
    const customer = existingCustomer || onCustomerSignup.createCustomer({ name: form.name.trim(), phone: form.phone.trim(), email })
    if (!customer) {
      setError('Could not create a customer profile with those details.')
      return
    }

    const nextUser = {
      id: `user-${Date.now()}`,
      name: customer.name,
      email,
      passwordHash: hashPassword(password),
      role: 'customer',
      customerId: customer.id,
      createdAt: new Date().toISOString(),
    }

    users.push(nextUser)
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users))
    const sessionUser = { id: nextUser.id, name: nextUser.name, email: nextUser.email, role: nextUser.role, customerId: nextUser.customerId }
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser))
    onSuccess(sessionUser)
  }

  return (
    <Box className="auth-page" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#edf5ef', p: 3 }}>
      <Card sx={{ width: '100%', maxWidth: 520, p: 3, borderRadius: 4, boxShadow: '0 18px 45px rgba(15, 33, 28, 0.12)' }}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ color: '#6d7c76', letterSpacing: '.18em', fontWeight: 800 }}>PRIVATE ACCESS</Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-.05em', color: '#10251f' }}>
            {mode === 'login' ? 'Welcome back' : mode === 'reset' ? 'Reset password' : 'Customer account'}
          </Typography>
          <Typography sx={{ color: '#5f776b' }}>
            {mode === 'login' ? 'Sign in to your business or customer account.' : mode === 'reset' ? 'Set a new password for an account saved in this browser.' : 'Create an account to view your customer profile and purchases.'}
          </Typography>
        </Stack>

        <form onSubmit={submit}>
          <Stack spacing={2}>
            {mode === 'signup' && (
              <TextField label="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            )}
            {mode === 'signup' && (
              <TextField label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required />
            )}
            <TextField type="email" label="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            <TextField type="password" label={mode === 'reset' ? 'New password' : 'Password'} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
            {(mode === 'signup' || mode === 'reset') && (
              <TextField type="password" label="Confirm password" value={form.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))} required />
            )}

            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            {mode === 'reset' && <Alert severity="info">No recovery email is sent. This changes the password only in this browser.</Alert>}

            <Button type="submit" variant="contained" sx={{ bgcolor: '#16392d', py: 1.3 }}>
              {mode === 'login' ? 'Login securely' : mode === 'reset' ? 'Update password' : 'Create account'}
            </Button>

            {mode === 'login' && <Button type="button" variant="text" onClick={() => { setMode('signup'); setError(''); setMessage('') }}>New customer? Create an account</Button>}
            {mode === 'login' && <Button type="button" variant="text" onClick={() => { setMode('reset'); setError(''); setMessage('') }}>Forgot password?</Button>}
            {mode !== 'login' && <Button type="button" variant="text" onClick={() => { setMode('login'); setError(''); setMessage('') }}>Back to sign in</Button>}
          </Stack>
        </form>

      </Card>
    </Box>
  )
}

function App() {
  const store = useBusinessStore()
  const [sessionUser, setSessionUser] = useState(() => getSessionUser())
  const signOut = () => {
    localStorage.removeItem(AUTH_SESSION_KEY)
    setSessionUser(null)
  }
  const customerSignup = {
    findCustomer: (email) => store.customers.find((customer) => customer.email.trim().toLowerCase() === email),
    createCustomer: (customer) => store.addCustomer({ ...customer, address: '', type: 'Individual' }),
  }

  return (
    <BrowserRouter>
      <CssBaseline />
      {sessionUser?.role === 'customer'
        ? <CustomerPortal store={store} user={sessionUser} onLogout={signOut} />
        : sessionUser
          ? <Shell store={store} user={sessionUser} onLogout={signOut} />
          : <AuthScreen onSuccess={setSessionUser} onCustomerSignup={customerSignup} />}
    </BrowserRouter>
  )
}
function Shell({ store, user, onLogout }) {
  const location = useLocation();
  const current =
    navItems.find((item) => item.path === location.pathname) ||
    navItems.find(
      (item) => location.pathname.startsWith(item.path) && item.path !== "/",
    );
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f7f5" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 244,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 244,
            boxSizing: "border-box",
            border: 0,
            bgcolor: "#10251f",
            color: "#d8e5df",
          },
        }}
      >
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography
            sx={{
              color: "#b7e45c",
              fontWeight: 800,
              letterSpacing: "-.03em",
              fontSize: 22,
            }}
          >
            ledger<span style={{ color: "#f4f7f5" }}>ly</span>
          </Typography>
          <Typography variant="caption" sx={{ color: "#88a69a" }}>
            Business command center
          </Typography>
        </Box>
        <Box sx={{ px: 1.5, mt: 2 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {({ isActive }) => (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.35,
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: isActive ? "#29493e" : "transparent",
                    color: isActive ? "#d5f27d" : "#9bb4a9",
                    "&:hover": { bgcolor: "#1b3930", color: "#f4f7f5" },
                  }}
                >
                  {item.icon}
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: isActive ? 700 : 500 }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              )}
            </NavLink>
          ))}
        </Box>
        <Box sx={{ mt: "auto", p: 2.5 }}>
          <Box sx={{ p: 2, border: "1px solid #355449", borderRadius: 2.5 }}>
            <Typography variant="caption" sx={{ color: "#8fa99e" }}>
              CURRENT PERIOD
            </Typography>
            <Typography sx={{ color: "#f4f7f5", fontWeight: 700, mt: 0.5 }}>
              March 2026
            </Typography>
            <Typography variant="caption" sx={{ color: "#b7e45c" }}>
              Live local data
            </Typography>
          </Box>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "#fff",
            color: "#10251f",
            borderBottom: "1px solid #dfe8e3",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", minHeight: 76 }}>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: "#789187",
                  fontWeight: 700,
                  letterSpacing: ".12em",
                }}
              >
                BUSINESS INTELLIGENCE
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, letterSpacing: "-.03em" }}
              >
                {current?.label || "Details"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  bgcolor: "#a5d94f",
                  borderRadius: "50%",
                }}
              />
              <Typography variant="body2" sx={{ color: "#60766d" }}>
                Local workspace
              </Typography>
              <Box
                sx={{
                  ml: 1,
                  width: 38,
                  height: 38,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#e3eddf",
                  color: "#375649",
                  borderRadius: "50%",
                  fontWeight: 800,
                }}
              >
                {user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, ml: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{user.name}</Typography>
                <Typography variant="caption" sx={{ color: '#71877b', textTransform: 'capitalize' }}>{user.role}</Typography>
              </Box>
              <Tooltip title="Sign out">
                <IconButton aria-label="Sign out" onClick={onLogout} sx={{ color: '#567366', ml: 1 }}>
                  <LogoutRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, mx: "auto" }}>
          <Routes>
            <Route path="/" element={<Dashboard store={store} />} />
            <Route path="/sales" element={<ManagementPage entity="sales" store={store} />} />
            <Route
              path="/sales/:saleId"
              element={<SaleDetails store={store} />}
            />
            <Route path="/products" element={<ManagementPage entity="products" store={store} />} />
            <Route
              path="/products/:productId"
              element={<ProductDetails store={store} />}
            />
            <Route path="/expenses" element={<ManagementPage entity="expenses" store={store} />} />
            <Route path="/customers" element={<ManagementPage entity="customers" store={store} />} />
            <Route
              path="/customers/:customerId"
              element={<CustomerDetails store={store} />}
            />
            <Route path="/reports" element={<Reports store={store} />} />
          </Routes>
        </Box>
      </Box>
      <Snackbar
        open={Boolean(store.notice)}
        autoHideDuration={3200}
        onClose={() => store.setNotice("")}
      >
        <Alert
          severity="success"
          onClose={() => store.setNotice("")}
          sx={{ width: "100%" }}
        >
          {store.notice}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function CustomerPortal({ store, user, onLogout }) {
  const [quantities, setQuantities] = useState({})
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0])
  const [purchaseNotice, setPurchaseNotice] = useState({ open: false, message: '', severity: 'success' })
  const customer = store.customers.find((item) => item.id === user.customerId)
    || store.customers.find((item) => item.email.trim().toLowerCase() === user.email.toLowerCase())

  const buyProduct = (product) => {
    const quantity = Number(quantities[product.id] ?? 1)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
      setPurchaseNotice({ open: true, message: `Choose a quantity from 1 to ${product.stock}.`, severity: 'error' })
      return
    }

    const success = store.addSale({
      customerId: customer.id,
      productId: product.id,
      quantity,
      discount: 0,
      paymentMethod,
      date: new Date().toISOString().slice(0, 10),
      notes: 'Customer portal order',
    })
    setPurchaseNotice({ open: true, message: success ? `${product.name} order placed.` : store.notice, severity: success ? 'success' : 'error' })
    if (success) setQuantities((current) => ({ ...current, [product.id]: 1 }))
  }

  if (!customer) {
    return <Box sx={{ minHeight: '100vh', p: 3 }}><Button onClick={onLogout} startIcon={<LogoutRoundedIcon />}>Sign out</Button><Typography sx={{ mt: 4 }}>Customer profile not found.</Typography></Box>
  }

  const purchases = store.sales.filter((sale) => sale.customerId === customer.id).map((sale) => ({
    ...sale,
    product: store.products.find((item) => item.id === sale.productId)?.name || 'Product unavailable',
  })).sort((first, second) => second.date.localeCompare(first.date))
  const completedPurchases = purchases.filter((sale) => sale.status === 'Completed')
  const pendingPurchases = purchases.filter((sale) => sale.status === 'Pending')
  const totalSpent = completedPurchases.reduce((sum, sale) => sum + sale.total, 0)
  const itemsPurchased = completedPurchases.reduce((sum, sale) => sum + sale.quantity, 0)
  const latestPurchase = purchases[0]

  return <Box sx={{ minHeight: '100vh', bgcolor: '#f4f7f5' }}>
    <AppBar position="static" elevation={0} sx={{ bgcolor: '#fff', color: '#10251f', borderBottom: '1px solid #dfe8e3' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography sx={{ color: '#10251f', fontWeight: 800, fontSize: 22 }}>ledger<span style={{ color: '#6b9634' }}>ly</span></Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ color: '#60766d' }}>{customer.name}</Typography>
          <Tooltip title="Sign out"><IconButton aria-label="Sign out" onClick={onLogout} sx={{ color: '#567366' }}><LogoutRoundedIcon /></IconButton></Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader eyebrow="CUSTOMER ACCOUNT" title={`Welcome, ${customer.name}`} subtitle="Your purchases and account details, all in one place." />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          ['Total spent', money(totalSpent), 'Completed purchases', '#b7e45c', <ShoppingBagRoundedIcon key="spent" />],
          ['Completed orders', completedPurchases.length, 'Successfully completed', '#9bd3bd', <PointOfSaleRoundedIcon key="completed" />],
          ['Awaiting update', pendingPurchases.length, 'Pending orders', '#f1c76b', <ReceiptLongRoundedIcon key="pending" />],
          ['Items purchased', itemsPurchased, 'Across completed orders', '#d5c7f4', <Inventory2RoundedIcon key="items" />],
        ].map(([label, value, detail, color, icon]) => <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}><StatCard label={label} value={value} detail={detail} color={color} icon={icon} /></Grid>)}
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Recent orders">
            <Box sx={{ height: 420, width: '100%' }}>
              <DataGrid rows={purchases} columns={[
                { field: 'number', headerName: 'Order number', flex: 1, minWidth: 145 },
                { field: 'date', headerName: 'Date', width: 135, valueFormatter: (value) => dateLabel(value) },
                { field: 'product', headerName: 'Product', flex: 1.2, minWidth: 160 },
                { field: 'quantity', headerName: 'Qty', width: 75 },
                { field: 'total', headerName: 'Total', width: 125, valueFormatter: (value) => money(value) },
                { field: 'status', headerName: 'Status', width: 125, renderCell: ({ value }) => <StatusChip status={value} /> },
              ]} pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} disableRowSelectionOnClick sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f4f8f5', color: '#567366', fontWeight: 800 } }} />
            </Box>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            <SectionCard title="Account details">
              <Stack spacing={1.5}>
                {[['Customer number', customer.number], ['Email', customer.email], ['Phone', customer.phone], ['Address', customer.address || 'Not provided']].map(([label, value]) => <Box key={label}><Typography variant="caption" sx={{ color: '#71877b', fontWeight: 700 }}>{label.toUpperCase()}</Typography><Typography sx={{ mt: .25, fontWeight: 700, overflowWrap: 'anywhere' }}>{value}</Typography></Box>)}
              </Stack>
            </SectionCard>
            <SectionCard title="Latest order">
              {latestPurchase ? <Stack spacing={1}>
                <Typography variant="caption" sx={{ color: '#71877b', fontWeight: 700 }}>{latestPurchase.number}</Typography>
                <Typography sx={{ fontWeight: 800, color: '#18352b' }}>{latestPurchase.product}</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">{dateLabel(latestPurchase.date)}</Typography>
                  <StatusChip status={latestPurchase.status} />
                </Stack>
                <Typography sx={{ fontWeight: 800, color: '#47721f' }}>{money(latestPurchase.total)}</Typography>
              </Stack> : <Typography variant="body2" color="text.secondary">No purchases yet. Your orders will appear here.</Typography>}
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <SectionCard title="Shop the catalog" action={
          <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 180 } }}>
            <InputLabel id="customer-payment-method-label">Payment method</InputLabel>
            <Select labelId="customer-payment-method-label" value={paymentMethod} label="Payment method" onChange={(event) => setPaymentMethod(event.target.value)}>
              {paymentMethods.map((method) => <MenuItem key={method} value={method}>{method}</MenuItem>)}
            </Select>
          </FormControl>
        }>
          <Alert severity="info" sx={{ mb: 2 }}>Demo checkout records your order but does not process a payment.</Alert>
          <Grid container spacing={2}>
            {store.products.map((product) => {
              const unavailable = product.stock < 1 || product.discontinued
              return <Grid key={product.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card sx={{ height: '100%', border: '1px solid #e0e9e3', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">{product.category}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, mt: .5 }}>{product.name}</Typography>
                      </Box>
                      <StatusChip status={productStatus(product)} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, mt: 1 }}>{product.description || 'Available from our catalog.'}</Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#18352b' }}>{money(product.unitPrice)}</Typography>
                      <Typography variant="caption" color="text.secondary">{product.stock} available</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        type="number"
                        label="Qty"
                        size="small"
                        value={quantities[product.id] ?? 1}
                        onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: event.target.value }))}
                        inputProps={{ min: 1, max: product.stock, step: 1 }}
                        sx={{ width: 92 }}
                        disabled={unavailable}
                      />
                      <Button fullWidth variant="contained" startIcon={<ShoppingBagRoundedIcon />} disabled={unavailable} onClick={() => buyProduct(product)} sx={{ bgcolor: '#b7e45c', color: '#10251f', '&:hover': { bgcolor: '#a5d94f' } }}>
                        {unavailable ? 'Unavailable' : 'Place order'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            })}
          </Grid>
        </SectionCard>
      </Box>
    </Box>
    <Snackbar open={purchaseNotice.open} autoHideDuration={3600} onClose={() => setPurchaseNotice((current) => ({ ...current, open: false }))}>
      <Alert severity={purchaseNotice.severity} onClose={() => setPurchaseNotice((current) => ({ ...current, open: false }))} sx={{ width: '100%' }}>{purchaseNotice.message}</Alert>
    </Snackbar>
  </Box>
}

function PageHeader({ eyebrow, title, subtitle, action }) { return <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}><Box><Typography variant="overline" sx={{ color: '#6f877b', fontWeight: 800, letterSpacing: '.13em' }}>{eyebrow}</Typography><Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-.045em', color: '#10251f' }}>{title}</Typography>{subtitle && <Typography sx={{ color: '#72877e', mt: .5 }}>{subtitle}</Typography>}</Box>{action}</Stack> }
function StatCard({ label, value, detail, color = '#b7e45c', icon }) { return <Card sx={{ height: '100%', border: '1px solid #e0e9e3', boxShadow: '0 6px 20px rgba(26, 61, 45, .04)' }}><CardContent sx={{ p: 2.5 }}><Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Typography variant="body2" sx={{ color: '#71877b', fontWeight: 700 }}>{label}</Typography><Box sx={{ width: 34, height: 34, display: 'grid', placeItems: 'center', bgcolor: color, color: '#10251f', borderRadius: 1.5 }}>{icon}</Box></Stack><Typography variant="h4" sx={{ mt: 2, fontWeight: 800, letterSpacing: '-.045em', color: '#10251f' }}>{value}</Typography><Typography variant="caption" sx={{ color: '#7c9086' }}>{detail}</Typography></CardContent></Card> }
function SectionCard({ title, action, children, sx = {} }) { return <Card sx={{ border: '1px solid #e0e9e3', boxShadow: '0 6px 20px rgba(26, 61, 45, .04)', ...sx }}><CardContent sx={{ p: 2.5 }}><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}><Typography sx={{ fontWeight: 800, color: '#18352b' }}>{title}</Typography>{action}</Stack>{children}</CardContent></Card> }
function StatusChip({ status }) { const colors = { Completed: 'success', Pending: 'warning', Cancelled: 'default', Refunded: 'error', 'In Stock': 'success', 'Low Stock': 'warning', 'Out of Stock': 'error', Discontinued: 'default', Active: 'success', Inactive: 'default', Paid: 'success' }; return <Chip size="small" label={status} color={colors[status] || 'default'} sx={{ fontWeight: 700 }} /> }

function Dashboard({ store }) { const { metrics, products, customers, completedSales } = store; const topProduct = useMemo(() => { const totals = completedSales.reduce((acc, sale) => { acc[sale.productId] = (acc[sale.productId] || 0) + sale.quantity; return acc }, {}); const id = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0]; return products.find((item) => item.id === id)?.name || 'No sales yet' }, [completedSales, products]); const trend = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => ({ month, sales: index === 2 ? metrics.totalSales : Math.round(metrics.totalSales * [0.58, .7, .86, .78, .9, 1][index]), expenses: index === 2 ? metrics.totalExpenses : Math.round(metrics.totalExpenses * [0.72, .84, .92, .8, .9, 1][index]) })), [metrics]); const productMix = products.map((product) => ({ name: product.name, value: completedSales.filter((sale) => sale.productId === product.id).reduce((sum, sale) => sum + sale.total, 0) })).filter((item) => item.value); return <><PageHeader eyebrow="MARCH 2026 / LIVE" title="Good morning, Finance Desk" subtitle="Here is what is happening across your business today." action={<Button component={Link} to="/sales" variant="contained" startIcon={<AddRoundedIcon />} sx={{ bgcolor: '#b7e45c', color: '#10251f' }}>Record a sale</Button>} /><Grid container spacing={2} sx={{ mb: 2 }}>{[['Total Sales', money(metrics.totalSales), 'Completed revenue', '#b7e45c', <TrendingUpRoundedIcon />], ['Total Expenses', money(metrics.totalExpenses), 'Recorded costs', '#f1c76b', <TrendingDownRoundedIcon />], ['Net Income', money(metrics.netIncome), 'Sales less expenses', '#9bd3bd', <InsightsRoundedIcon />], ['Transactions', completedSales.length, 'Completed sales', '#d5c7f4', <PointOfSaleRoundedIcon />]].map(([label, value, detail, color, icon]) => <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}><StatCard label={label} value={value} detail={detail} color={color} icon={icon} /></Grid>)}</Grid><Grid container spacing={2} sx={{ mb: 2 }}><Grid size={{ xs: 12, lg: 8 }}><SectionCard title="Financial pulse" action={<Chip label="Last 6 months" size="small" sx={{ bgcolor: '#eff5ee', color: '#567366' }} />}><ResponsiveContainer width="100%" height={290}><AreaChart data={trend}><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b7e45c" stopOpacity={.5} /><stop offset="100%" stopColor="#b7e45c" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#e7eee9" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#84968d', fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#84968d', fontSize: 12 }} /><ChartTooltip formatter={(value) => money(value)} /><Area type="monotone" dataKey="sales" stroke="#6b9634" strokeWidth={3} fill="url(#salesFill)" /><Line type="monotone" dataKey="expenses" stroke="#d19c3c" strokeWidth={2.5} dot={false} /></AreaChart></ResponsiveContainer></SectionCard></Grid><Grid size={{ xs: 12, lg: 4 }}><SectionCard title="Revenue by product"><ResponsiveContainer width="100%" height={290}><PieChart><Pie data={productMix} innerRadius={68} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name">{productMix.map((entry, index) => <Cell key={entry.name} fill={['#6b9634', '#b7e45c', '#d19c3c', '#8cb8a1', '#d5c7f4'][index % 5]} />)}</Pie><ChartTooltip formatter={(value) => money(value)} /><Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer></SectionCard></Grid></Grid><Grid container spacing={2}><Grid size={{ xs: 12, md: 4 }}><SectionCard title="Business snapshot"><Stack spacing={2}>{[['Products', products.length], ['Customers', customers.length], ['Avg. sale', money(metrics.averageSale)], ['Best seller', topProduct]].map(([label, value]) => <Stack key={label} direction="row" justifyContent="space-between" alignItems="center"><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="body2" sx={{ fontWeight: 800, color: '#18352b', textAlign: 'right', maxWidth: 170 }}>{value}</Typography></Stack>)}</Stack></SectionCard></Grid><Grid size={{ xs: 12, md: 8 }}><SectionCard title="Recent activity" action={<Button component={Link} to="/sales" size="small">View all</Button>}><Stack divider={<Divider />} spacing={0}>{[...completedSales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((sale) => <Stack key={sale.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.2 }}><Box><Typography variant="body2" sx={{ fontWeight: 700 }}>{sale.number}</Typography><Typography variant="caption" color="text.secondary">{dateLabel(sale.date)} Â· {customers.find((c) => c.id === sale.customerId)?.name}</Typography></Box><Typography sx={{ fontWeight: 800, color: '#47721f' }}>{money(sale.total)}</Typography></Stack>)}</Stack></SectionCard></Grid></Grid></> }

function SaleDialog({ open, onClose, store }) { const [form, setForm] = useState({ customerId: '', productId: '', quantity: 1, discount: 0, paymentMethod: 'Cash', date: new Date().toISOString().slice(0, 10), notes: '' }); const product = store.products.find((item) => item.id === form.productId); const subtotal = (Number(form.quantity) || 0) * (product?.unitPrice || 0); const update = (key, value) => setForm((current) => ({ ...current, [key]: value })); const submit = () => { if (!form.customerId || !form.productId || !form.quantity) return; store.addSale({ ...form, quantity: Number(form.quantity), discount: Number(form.discount) || 0 }); onClose() }; return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"><DialogTitle sx={{ fontWeight: 800 }}>Record a new sale</DialogTitle><DialogContent><Grid container spacing={2} sx={{ pt: 1 }}><Grid size={6}><FormControl fullWidth><InputLabel>Customer</InputLabel><Select value={form.customerId} label="Customer" onChange={(e) => update('customerId', e.target.value)}>{store.customers.filter((c) => c.status === 'Active').map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}</Select></FormControl></Grid><Grid size={6}><FormControl fullWidth><InputLabel>Product</InputLabel><Select value={form.productId} label="Product" onChange={(e) => update('productId', e.target.value)}>{store.products.filter((p) => p.stock > 0).map((p) => <MenuItem key={p.id} value={p.id}>{p.name} ({p.stock} left)</MenuItem>)}</Select></FormControl></Grid><Grid size={6}><TextField fullWidth type="number" label="Quantity" value={form.quantity} inputProps={{ min: 1, max: product?.stock }} onChange={(e) => update('quantity', e.target.value)} /></Grid><Grid size={6}><TextField fullWidth label="Unit price" value={product ? money(product.unitPrice) : '-'} InputProps={{ readOnly: true }} /></Grid><Grid size={6}><TextField fullWidth type="number" label="Discount" value={form.discount} inputProps={{ min: 0 }} onChange={(e) => update('discount', e.target.value)} /></Grid><Grid size={6}><TextField fullWidth label="Subtotal" value={money(subtotal)} InputProps={{ readOnly: true }} /></Grid><Grid size={6}><FormControl fullWidth><InputLabel>Payment method</InputLabel><Select value={form.paymentMethod} label="Payment method" onChange={(e) => update('paymentMethod', e.target.value)}>{paymentMethods.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid><Grid size={6}><TextField fullWidth type="date" label="Sale date" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => update('date', e.target.value)} /></Grid><Grid size={12}><TextField fullWidth multiline rows={2} label="Notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} /></Grid></Grid></DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Cancel</Button><Button variant="contained" onClick={submit} sx={{ bgcolor: '#264c3c' }}>Save sale</Button></DialogActions></Dialog> }

function Sales({ store }) { const [open, setOpen] = useState(false); const [search, setSearch] = useState(''); const [status, setStatus] = useState('All'); const rows = store.sales.filter((sale) => { const customer = store.customers.find((c) => c.id === sale.customerId)?.name || ''; const product = store.products.find((p) => p.id === sale.productId)?.name || ''; return (`${sale.number} ${customer} ${product}`).toLowerCase().includes(search.toLowerCase()) && (status === 'All' || sale.status === status) }).map((sale) => ({ ...sale, customer: store.customers.find((c) => c.id === sale.customerId)?.name || 'Unknown', product: store.products.find((p) => p.id === sale.productId)?.name || 'Unknown' })); const columns = [{ field: 'number', headerName: 'Sale number', flex: 1.1, minWidth: 150 }, { field: 'date', headerName: 'Date', width: 120, valueFormatter: (value) => dateLabel(value) }, { field: 'customer', headerName: 'Customer', flex: 1.1, minWidth: 140 }, { field: 'product', headerName: 'Product', flex: 1.1, minWidth: 150 }, { field: 'quantity', headerName: 'Qty', width: 65 }, { field: 'total', headerName: 'Total', width: 105, valueFormatter: (value) => money(value) }, { field: 'paymentMethod', headerName: 'Payment', width: 125 }, { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusChip status={value} /> }, { field: 'actions', headerName: '', width: 110, sortable: false, renderCell: ({ row }) => <Stack direction="row"><Tooltip title="View"><IconButton component={Link} to={`/sales/${row.id}`} size="small"><VisibilityRoundedIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => store.removeSale(row.id)}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Tooltip></Stack> }]; return <><PageHeader eyebrow="TRANSACTIONS" title="Sales" subtitle="Record, review, and manage every customer transaction." action={<Button onClick={() => setOpen(true)} variant="contained" startIcon={<AddRoundedIcon />} sx={{ bgcolor: '#b7e45c', color: '#10251f' }}>Record sale</Button>} /><SectionCard title={`${rows.length} transactions`} action={<Stack direction="row" spacing={1}><TextField size="small" placeholder="Search sales" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: '#8ba096' }} /> }} /><FormControl size="small" sx={{ minWidth: 130 }}><InputLabel>Status</InputLabel><Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}><MenuItem value="All">All statuses</MenuItem>{saleStatuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Stack> }><Box sx={{ height: 500, width: '100%' }}><DataGrid rows={rows} columns={columns} pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} disableRowSelectionOnClick sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f4f8f5', color: '#567366', fontWeight: 800 } }} /></Box></SectionCard><SaleDialog open={open} onClose={() => setOpen(false)} store={store} /></> }

function Products({ store }) { const [open, setOpen] = useState(false); const [form, setForm] = useState({ name: '', category: 'Electronics', unitPrice: '', costPrice: '', stock: '', reorderLevel: 5, supplier: '' }); const save = () => { if (!form.name || !form.unitPrice) return; store.setProducts((current) => [...current, { ...form, id: `p-${Date.now()}`, code: `PRD-2026-${String(current.length + 1).padStart(4, '0')}`, unitPrice: Number(form.unitPrice), costPrice: Number(form.costPrice) || 0, stock: Number(form.stock) || 0, reorderLevel: Number(form.reorderLevel) || 0, discontinued: false }]); store.setNotice('Product added successfully.'); setOpen(false) }; return <><PageHeader eyebrow="CATALOG" title="Products" subtitle="Keep stock, pricing, and product performance in one place." action={<Button onClick={() => setOpen(true)} variant="contained" startIcon={<AddRoundedIcon />} sx={{ bgcolor: '#b7e45c', color: '#10251f' }}>Add product</Button>} /><Grid container spacing={2}>{store.products.map((product) => <Grid key={product.id} size={{ xs: 12, sm: 6, lg: 4 }}><Card component={Link} to={`/products/${product.id}`} sx={{ textDecoration: 'none', color: 'inherit', border: '1px solid #e0e9e3', boxShadow: '0 6px 20px rgba(26, 61, 45, .04)', '&:hover': { borderColor: '#a5d94f', transform: 'translateY(-2px)' }, transition: 'all .2s' }}><CardContent sx={{ p: 2.5 }}><Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box><Typography variant="caption" color="text.secondary">{product.code}</Typography><Typography variant="h6" sx={{ fontWeight: 800, mt: .5 }}>{product.name}</Typography><Typography variant="body2" color="text.secondary">{product.category} Â· {product.supplier}</Typography></Box><StatusChip status={productStatus(product)} /></Stack><Divider sx={{ my: 2 }} /><Stack direction="row" justifyContent="space-between"><Box><Typography variant="caption" color="text.secondary">UNIT PRICE</Typography><Typography sx={{ fontWeight: 800, fontSize: 20 }}>{money(product.unitPrice)}</Typography></Box><Box sx={{ textAlign: 'right' }}><Typography variant="caption" color="text.secondary">IN STOCK</Typography><Typography sx={{ fontWeight: 800, fontSize: 20, color: product.stock <= product.reorderLevel ? '#bd7b16' : '#47721f' }}>{product.stock}</Typography></Box></Stack></CardContent></Card></Grid>)}</Grid><Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle sx={{ fontWeight: 800 }}>Add product</DialogTitle><DialogContent><Grid container spacing={2} sx={{ pt: 1 }}>{[['name', 'Product name'], ['category', 'Category'], ['unitPrice', 'Unit price'], ['costPrice', 'Cost price'], ['stock', 'Current stock'], ['reorderLevel', 'Reorder level'], ['supplier', 'Supplier']].map(([key, label]) => <Grid key={key} size={key === 'name' || key === 'supplier' ? 12 : 6}><TextField fullWidth label={label} type={['unitPrice', 'costPrice', 'stock', 'reorderLevel'].includes(key) ? 'number' : 'text'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></Grid>)}</Grid></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save} sx={{ bgcolor: '#264c3c' }}>Save product</Button></DialogActions></Dialog></> }

function Expenses({ store }) { const [open, setOpen] = useState(false); const [form, setForm] = useState({ category: 'Rent', description: '', amount: '', paymentMethod: 'Bank Transfer', department: 'Operations', date: new Date().toISOString().slice(0, 10), notes: '' }); const save = () => { store.addExpense(form); setOpen(false) }; const columns = [{ field: 'number', headerName: 'Expense', flex: 1, minWidth: 150 }, { field: 'date', headerName: 'Date', width: 125, valueFormatter: (value) => dateLabel(value) }, { field: 'category', headerName: 'Category', width: 145 }, { field: 'description', headerName: 'Description', flex: 1.3, minWidth: 180 }, { field: 'department', headerName: 'Department', width: 140 }, { field: 'amount', headerName: 'Amount', width: 115, valueFormatter: (value) => money(value) }, { field: 'status', headerName: 'Status', width: 100, renderCell: ({ value }) => <StatusChip status={value} /> }, { field: 'action', headerName: '', width: 60, renderCell: ({ row }) => <IconButton size="small" color="error" onClick={() => store.removeExpense(row.id)}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton> }]; return <><PageHeader eyebrow="OUTGOINGS" title="Expenses" subtitle="Track the costs that shape your bottom line." action={<Button onClick={() => setOpen(true)} variant="contained" startIcon={<AddRoundedIcon />} sx={{ bgcolor: '#b7e45c', color: '#10251f' }}>Add expense</Button>} /><Grid container spacing={2} sx={{ mb: 2 }}><Grid size={{ xs: 12, md: 4 }}><StatCard label="Total expenses" value={money(store.metrics.totalExpenses)} detail="Across all recorded costs" color="#f1c76b" icon={<ReceiptLongRoundedIcon />} /></Grid><Grid size={{ xs: 12, md: 4 }}><StatCard label="Expense entries" value={store.expenses.length} detail="Recorded transactions" color="#d5c7f4" icon={<InsightsRoundedIcon />} /></Grid><Grid size={{ xs: 12, md: 4 }}><StatCard label="Largest category" value={Object.entries(store.expenses.reduce((acc, item) => ({ ...acc, [item.category]: (acc[item.category] || 0) + item.amount }), {})).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'} detail="By total amount" color="#9bd3bd" icon={<TrendingDownRoundedIcon />} /></Grid></Grid><SectionCard title="Expense register"><Box sx={{ height: 500 }}><DataGrid rows={store.expenses} columns={columns} pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} disableRowSelectionOnClick sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f4f8f5', color: '#567366', fontWeight: 800 } }} /></Box></SectionCard><Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm"><DialogTitle sx={{ fontWeight: 800 }}>Record an expense</DialogTitle><DialogContent><Grid container spacing={2} sx={{ pt: 1 }}><Grid size={6}><FormControl fullWidth><InputLabel>Category</InputLabel><Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>{expenseCategories.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid><Grid size={6}><TextField fullWidth type="number" label="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Grid><Grid size={12}><TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid><Grid size={6}><FormControl fullWidth><InputLabel>Payment method</InputLabel><Select value={form.paymentMethod} label="Payment method" onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>{paymentMethods.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid><Grid size={6}><FormControl fullWidth><InputLabel>Department</InputLabel><Select value={form.department} label="Department" onChange={(e) => setForm({ ...form, department: e.target.value })}>{departments.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl></Grid><Grid size={6}><TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Grid><Grid size={12}><TextField fullWidth label="Notes" multiline rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Grid></Grid></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save} sx={{ bgcolor: '#264c3c' }}>Save expense</Button></DialogActions></Dialog></> }

function CustomerDialog({ open, onClose, store }) { const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', type: 'Individual' }); const save = () => { store.addCustomer(form); if (form.name.trim() && form.phone.trim() && form.email.trim()) { setForm({ name: '', phone: '', email: '', address: '', type: 'Individual' }); onClose() } }; return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"><DialogTitle sx={{ fontWeight: 800 }}>Add customer</DialogTitle><DialogContent><Grid container spacing={2} sx={{ pt: 1 }}><Grid size={12}><TextField fullWidth label="Full name or organization" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid><Grid size={6}><TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid><Grid size={6}><TextField fullWidth type="email" label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid><Grid size={12}><TextField fullWidth label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Grid><Grid size={12}><FormControl fullWidth><InputLabel>Customer type</InputLabel><Select value={form.type} label="Customer type" onChange={(e) => setForm({ ...form, type: e.target.value })}><MenuItem value="Individual">Individual</MenuItem><MenuItem value="Business">Business</MenuItem><MenuItem value="Organization">Organization</MenuItem></Select></FormControl></Grid></Grid></DialogContent><DialogActions><Button onClick={onClose}>Cancel</Button><Button variant="contained" onClick={save} sx={{ bgcolor: '#264c3c' }}>Save customer</Button></DialogActions></Dialog> }

function Customers({ store }) { const [open, setOpen] = useState(false); const [search, setSearch] = useState(''); const rows = store.customers.filter((customer) => `${customer.name} ${customer.number} ${customer.email}`.toLowerCase().includes(search.toLowerCase())).map((customer) => { const purchases = store.completedSales.filter((sale) => sale.customerId === customer.id); return { ...customer, totalPurchases: purchases.reduce((sum, sale) => sum + sale.total, 0), transactions: purchases.length } }); const columns = [{ field: 'number', headerName: 'Customer no.', flex: 1, minWidth: 145 }, { field: 'name', headerName: 'Customer', flex: 1.2, minWidth: 170 }, { field: 'type', headerName: 'Type', width: 125 }, { field: 'phone', headerName: 'Phone', width: 145 }, { field: 'totalPurchases', headerName: 'Purchases', width: 120, valueFormatter: (value) => money(value) }, { field: 'transactions', headerName: 'Orders', width: 90 }, { field: 'status', headerName: 'Status', width: 105, renderCell: ({ value }) => <StatusChip status={value} /> }, { field: 'actions', headerName: '', width: 55, renderCell: ({ row }) => <IconButton component={Link} to={`/customers/${row.id}`} size="small"><VisibilityRoundedIcon fontSize="small" /></IconButton> }]; return <><PageHeader eyebrow="RELATIONSHIPS" title="Customers" subtitle="Understand the people and organizations behind your revenue." action={<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><TextField size="small" placeholder="Search customers" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: '#8ba096' }} /> }} /><Button onClick={() => setOpen(true)} variant="contained" startIcon={<AddRoundedIcon />} sx={{ bgcolor: '#b7e45c', color: '#10251f' }}>Add customer</Button></Stack>} /><SectionCard title={`${rows.length} customers`}><Box sx={{ height: 500 }}><DataGrid rows={rows} columns={columns} pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} disableRowSelectionOnClick sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f4f8f5', color: '#567366', fontWeight: 800 } }} /></Box></SectionCard><CustomerDialog open={open} onClose={() => setOpen(false)} store={store} /></> }

function DetailHeader({ back, eyebrow, title, subtitle }) { return <><Button component={Link} to={back} startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 2, color: '#648075' }}>Back</Button><PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} /></> }
function SaleDetails({ store }) { const { saleId } = useParams(); const sale = store.sales.find((item) => item.id === saleId); if (!sale) return <Typography>Sale not found.</Typography>; const customer = store.customers.find((item) => item.id === sale.customerId); const product = store.products.find((item) => item.id === sale.productId); return <><DetailHeader back="/sales" eyebrow="SALE DETAIL" title={sale.number} subtitle={`${dateLabel(sale.date)} Â· ${sale.salesperson}`} /><Grid container spacing={2}><Grid size={{ xs: 12, md: 8 }}><SectionCard title="Sale summary" action={<StatusChip status={sale.status} />}><Grid container spacing={2}>{[['Customer', customer?.name], ['Product', product?.name], ['Quantity', sale.quantity], ['Unit price', money(sale.unitPrice)], ['Subtotal', money(sale.subtotal)], ['Discount', money(sale.discount)], ['Payment method', sale.paymentMethod], ['Sale date', dateLabel(sale.date)]].map(([label, value]) => <Grid key={label} size={{ xs: 6, sm: 3 }}><Typography variant="caption" color="text.secondary">{label.toUpperCase()}</Typography><Typography sx={{ mt: .5, fontWeight: 700 }}>{value}</Typography></Grid>)}</Grid><Divider sx={{ my: 3 }} /><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography sx={{ fontWeight: 700 }}>Total amount</Typography><Typography variant="h4" sx={{ fontWeight: 800, color: '#47721f' }}>{money(sale.total)}</Typography></Stack></SectionCard></Grid><Grid size={{ xs: 12, md: 4 }}><SectionCard title="Actions"><Stack spacing={1.5}><Button variant="outlined" startIcon={<PrintRoundedIcon />} onClick={() => window.print()}>Print receipt</Button>{sale.status === 'Completed' && <Button color="warning" variant="outlined" onClick={() => store.updateSaleStatus(sale.id, 'Cancelled')}>Cancel sale</Button>}</Stack></SectionCard></Grid></Grid></> }
function ProductDetails({ store }) { const { productId } = useParams(); const product = store.products.find((item) => item.id === productId); const sales = store.completedSales.filter((sale) => sale.productId === productId); if (!product) return <Typography>Product not found.</Typography>; const units = sales.reduce((sum, sale) => sum + sale.quantity, 0); const revenue = sales.reduce((sum, sale) => sum + sale.total, 0); return <><DetailHeader back="/products" eyebrow="PRODUCT DETAIL" title={product.name} subtitle={`${product.code} Â· ${product.category}`} /><Grid container spacing={2} sx={{ mb: 2 }}>{[['Current stock', product.stock, productStatus(product)], ['Units sold', units, 'All completed sales'], ['Sales revenue', money(revenue), 'Completed revenue'], ['Gross profit', money(revenue - units * product.costPrice), 'Estimated']].map(([label, value, detail], index) => <Grid key={label} size={{ xs: 6, md: 3 }}><StatCard label={label} value={value} detail={detail} color={['#b7e45c', '#9bd3bd', '#d5c7f4', '#f1c76b'][index]} icon={<Inventory2RoundedIcon />} /></Grid>)}</Grid><SectionCard title="Product information" action={<StatusChip status={productStatus(product)} />}><Grid container spacing={3}>{[['Description', product.description], ['Supplier', product.supplier], ['Unit price', money(product.unitPrice)], ['Cost price', money(product.costPrice)], ['Reorder level', `${product.reorderLevel} units`], ['Transactions', sales.length]].map(([label, value]) => <Grid key={label} size={{ xs: 6, md: 2 }}><Typography variant="caption" color="text.secondary">{label.toUpperCase()}</Typography><Typography sx={{ fontWeight: 700, mt: .5 }}>{value}</Typography></Grid>)}</Grid></SectionCard><Box sx={{ mt: 2 }}><SectionCard title="Sales history"><Box sx={{ height: 310 }}><DataGrid rows={sales.map((sale) => ({ ...sale, customer: store.customers.find((c) => c.id === sale.customerId)?.name }))} columns={[{ field: 'number', headerName: 'Sale', flex: 1 }, { field: 'date', headerName: 'Date', width: 130 }, { field: 'customer', headerName: 'Customer', flex: 1 }, { field: 'quantity', headerName: 'Units', width: 90 }, { field: 'total', headerName: 'Revenue', width: 130, valueFormatter: (value) => money(value) }]} hideFooter sx={{ border: 0 }} /></Box></SectionCard></Box></> }
function CustomerDetails({ store }) { const { customerId } = useParams(); const customer = store.customers.find((item) => item.id === customerId); const sales = store.completedSales.filter((sale) => sale.customerId === customerId); if (!customer) return <Typography>Customer not found.</Typography>; const total = sales.reduce((sum, sale) => sum + sale.total, 0); return <><DetailHeader back="/customers" eyebrow="CUSTOMER DETAIL" title={customer.name} subtitle={`${customer.number} Â· ${customer.type}`} /><Grid container spacing={2} sx={{ mb: 2 }}>{[['Total purchases', money(total), 'Completed revenue'], ['Transactions', sales.length, 'Completed orders'], ['Average purchase', money(sales.length ? total / sales.length : 0), 'Per transaction'], ['Last purchase', sales[0] ? dateLabel([...sales].sort((a, b) => b.date.localeCompare(a.date))[0].date) : '-', 'Most recent']].map(([label, value, detail], index) => <Grid key={label} size={{ xs: 6, md: 3 }}><StatCard label={label} value={value} detail={detail} color={['#b7e45c', '#9bd3bd', '#d5c7f4', '#f1c76b'][index]} icon={<PeopleAltRoundedIcon />} /></Grid>)}</Grid><SectionCard title="Customer profile" action={<StatusChip status={customer.status} />}><Grid container spacing={3}>{[['Email', customer.email], ['Phone', customer.phone], ['Address', customer.address], ['Registered', dateLabel(customer.registered)]].map(([label, value]) => <Grid key={label} size={{ xs: 6, md: 3 }}><Typography variant="caption" color="text.secondary">{label.toUpperCase()}</Typography><Typography sx={{ fontWeight: 700, mt: .5 }}>{value}</Typography></Grid>)}</Grid></SectionCard><Box sx={{ mt: 2 }}><SectionCard title="Purchase history"><Box sx={{ height: 310 }}><DataGrid rows={sales.map((sale) => ({ ...sale, product: store.products.find((p) => p.id === sale.productId)?.name }))} columns={[{ field: 'number', headerName: 'Sale', flex: 1 }, { field: 'date', headerName: 'Date', width: 130 }, { field: 'product', headerName: 'Product', flex: 1 }, { field: 'quantity', headerName: 'Units', width: 90 }, { field: 'total', headerName: 'Total', width: 130, valueFormatter: (value) => money(value) }]} hideFooter sx={{ border: 0 }} /></Box></SectionCard></Box></> }

function Reports({ store }) { const [range, setRange] = useState('All time'); const [category, setCategory] = useState('All'); const filteredExpenses = store.expenses.filter((expense) => category === 'All' || expense.category === category); const chartData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => ({ month, sales: Math.round(store.metrics.totalSales * (month === 'Mar' ? 1 : .7)), expenses: Math.round(store.metrics.totalExpenses * (month === 'Mar' ? 1 : .8)) })); const byCategory = expenseCategories.map((name) => ({ name, amount: filteredExpenses.filter((item) => item.category === name).reduce((sum, item) => sum + item.amount, 0) })).filter((item) => item.amount); return <><PageHeader eyebrow="ANALYTICS" title="Reports" subtitle="Turn your transaction history into a clearer business decision." action={<Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} onClick={() => { const csv = store.sales.map((sale) => `${sale.number},${sale.date},${sale.total}`).join('\n'); const blob = new Blob([`Sale,Date,Total\n${csv}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'sales-report.csv'; link.click(); URL.revokeObjectURL(url) }}>Export CSV</Button><Button variant="outlined" startIcon={<PrintRoundedIcon />} onClick={() => window.print()}>Print</Button></Stack>} /><SectionCard title="Report filters" sx={{ mb: 2 }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><FormControl size="small" sx={{ minWidth: 160 }}><InputLabel>Date range</InputLabel><Select value={range} label="Date range" onChange={(e) => setRange(e.target.value)}><MenuItem value="All time">All time</MenuItem><MenuItem value="This month">This month</MenuItem><MenuItem value="This quarter">This quarter</MenuItem></Select></FormControl><FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Expense category</InputLabel><Select value={category} label="Expense category" onChange={(e) => setCategory(e.target.value)}><MenuItem value="All">All categories</MenuItem>{expenseCategories.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl><Button onClick={() => { setRange('All time'); setCategory('All') }}>Clear filters</Button></Stack></SectionCard><Grid container spacing={2} sx={{ mb: 2 }}>{[['Total sales', money(store.metrics.totalSales)], ['Total expenses', money(store.metrics.totalExpenses)], ['Net income', money(store.metrics.netIncome)], ['Average sale', money(store.metrics.averageSale)]].map(([label, value], index) => <Grid key={label} size={{ xs: 6, md: 3 }}><StatCard label={label} value={value} detail={range} color={['#b7e45c', '#f1c76b', '#9bd3bd', '#d5c7f4'][index]} icon={<InsightsRoundedIcon />} /></Grid>)}</Grid><Grid container spacing={2}><Grid size={{ xs: 12, lg: 8 }}><SectionCard title="Sales, expenses & profit"><ResponsiveContainer width="100%" height={340}><LineChart data={chartData}><CartesianGrid stroke="#e7eee9" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><ChartTooltip formatter={(value) => money(value)} /><Legend /><Line type="monotone" dataKey="sales" stroke="#6b9634" strokeWidth={3} /><Line type="monotone" dataKey="expenses" stroke="#d19c3c" strokeWidth={2.5} /><Line type="monotone" dataKey="expenses" name="profit" stroke="#8cb8a1" strokeWidth={2.5} /></LineChart></ResponsiveContainer></SectionCard></Grid><Grid size={{ xs: 12, lg: 4 }}><SectionCard title="Expenses by category"><ResponsiveContainer width="100%" height={340}><BarChart data={byCategory} layout="vertical" margin={{ left: 20, right: 15 }}><CartesianGrid stroke="#e7eee9" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} /><ChartTooltip formatter={(value) => money(value)} /><Bar dataKey="amount" fill="#d19c3c" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></SectionCard></Grid></Grid></> }

export default App

