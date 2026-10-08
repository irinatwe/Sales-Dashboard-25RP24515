import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { departments, expenseCategories, money, dateLabel, paymentMethods, productStatus, saleStatuses } from './data'

const today = () => new Date().toISOString().slice(0, 10)
const defaults = {
  sales: () => ({ customerId: '', productId: '', quantity: 1, discount: 0, paymentMethod: 'Cash', date: today(), notes: '', status: 'Completed' }),
  products: () => ({ name: '', category: 'Electronics', description: '', unitPrice: '', costPrice: '', stock: '', reorderLevel: 5, supplier: '' }),
  expenses: () => ({ category: 'Rent', description: '', amount: '', paymentMethod: 'Bank Transfer', department: 'Operations', date: today(), notes: '' }),
  customers: () => ({ name: '', phone: '', email: '', address: '', type: 'Individual' }),
}

const fields = {
  sales: [
    { name: 'customerId', label: 'Customer', options: (store) => store.customers.map((item) => [item.id, item.name]) },
    { name: 'productId', label: 'Product', options: (store) => store.products.map((item) => [item.id, `${item.name} (${item.stock} in stock)`]) },
    { name: 'quantity', label: 'Quantity', type: 'number', min: 1 },
    { name: 'discount', label: 'Discount (RWF)', type: 'number', min: 0 },
    { name: 'paymentMethod', label: 'Payment method', options: () => paymentMethods.map((item) => [item, item]) },
    { name: 'date', label: 'Sale date', type: 'date' },
    { name: 'status', label: 'Status', options: () => saleStatuses.map((item) => [item, item]) },
    { name: 'notes', label: 'Notes', multiline: true },
  ],
  products: [
    { name: 'name', label: 'Product name' }, { name: 'category', label: 'Category' },
    { name: 'unitPrice', label: 'Selling price (RWF)', type: 'number', min: 0 },
    { name: 'costPrice', label: 'Cost price (RWF)', type: 'number', min: 0 },
    { name: 'stock', label: 'Stock quantity', type: 'number', min: 0 },
    { name: 'reorderLevel', label: 'Reorder level', type: 'number', min: 0 },
    { name: 'supplier', label: 'Supplier' }, { name: 'description', label: 'Description', multiline: true },
  ],
  expenses: [
    { name: 'category', label: 'Category', options: () => expenseCategories.map((item) => [item, item]) },
    { name: 'description', label: 'Description' }, { name: 'amount', label: 'Amount (RWF)', type: 'number', min: 1 },
    { name: 'department', label: 'Department', options: () => departments.map((item) => [item, item]) },
    { name: 'paymentMethod', label: 'Payment Methods', options: () => paymentMethods.map((item) => [item, item]) },
    { name: 'date', label: 'Date', type: 'date' }, { name: 'notes', label: 'Notes', multiline: true },
  ],
  customers: [
    { name: 'name', label: 'Full name or organization' }, { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email', type: 'email' }, { name: 'address', label: 'Address' },
    { name: 'type', label: 'Customer type', options: () => ['Individual', 'Business', 'Organization'].map((item) => [item, item]) },
  ],
}

const pageInfo = {
  sales: { title: 'Sales', eyebrow: 'TRANSACTIONS', subtitle: 'Record and manage customer transactions.' },
  products: { title: 'Products', eyebrow: 'CATALOG', subtitle: 'Manage stock, prices, and product details.' },
  expenses: { title: 'Expenses', eyebrow: 'OUTGOINGS', subtitle: 'Track and update business costs.' },
  customers: { title: 'Customers', eyebrow: 'RELATIONSHIPS', subtitle: 'Manage customer contacts and purchase history.' },
}

function Status({ value }) {
  return <Typography component="span" sx={{ color: value === 'Completed' || value === 'Active' || value === 'Paid' || value === 'In Stock' ? '#397044' : '#87621d', fontWeight: 700 }}>{value}</Typography>
}

function RecordDialog({ entity, store, record, onClose }) {
  const [form, setForm] = useState(() => record ? { ...defaults[entity](), ...record } : defaults[entity]())
  const editing = Boolean(record)
  const save = () => {
    const payload = Object.fromEntries(fields[entity].map(({ name }) => [name, form[name]]))
    if (entity === 'sales') {
      if (!payload.customerId || !payload.productId || Number(payload.quantity) < 1) return store.setNotice('Choose a customer, product, and quantity greater than zero.')
      const ok = editing ? store.updateSale(record.id, payload) : store.addSale({ ...payload, quantity: Number(payload.quantity), discount: Number(payload.discount) || 0 })
      if (ok) onClose()
      return
    }
    if (entity === 'products') {
      if (!payload.name.trim() || !Number.isFinite(Number(payload.unitPrice)) || Number(payload.unitPrice) <= 0) return store.setNotice('Product name and a valid selling price are required.')
      const product = { ...payload, unitPrice: Number(payload.unitPrice), costPrice: Number(payload.costPrice) || 0, stock: Number(payload.stock) || 0, reorderLevel: Number(payload.reorderLevel) || 0 }
      if (editing) store.updateProduct(record.id, product)
      else store.setProducts((current) => [{ ...product, id: `p-${Date.now()}`, code: `PRD-2026-${String(current.length + 1).padStart(4, '0')}`, discontinued: false }, ...current])
      if (!editing) store.setNotice('Product added successfully.')
    }
    if (entity === 'expenses') {
      if (!payload.description.trim() || Number(payload.amount) <= 0) return store.setNotice('Description and an amount greater than zero are required.')
      if (editing) store.updateExpense(record.id, payload)
      else store.addExpense(payload)
    }
    if (entity === 'customers') {
      if (!payload.name.trim() || !payload.phone.trim() || !payload.email.trim()) return store.setNotice('Name, phone, and email are required.')
      if (editing) store.updateCustomer(record.id, payload)
      else store.addCustomer(payload)
    }
    onClose()
  }
  return <Dialog open onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ fontWeight: 800 }}>{editing ? 'Edit' : 'Add'} {entity.slice(0, -1)}</DialogTitle>
    <DialogContent><Grid container spacing={2} sx={{ pt: 1 }}>
      {fields[entity].filter((field) => entity !== 'sales' || editing || field.name !== 'status').map((field) => <Grid key={field.name} size={{ xs: 12, sm: field.multiline ? 12 : 6 }}>
        {field.options ? <FormControl fullWidth><InputLabel>{field.label}</InputLabel><Select value={form[field.name] ?? ''} label={field.label} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}>{field.options(store).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</Select></FormControl> : <TextField fullWidth label={field.label} type={field.type || 'text'} value={form[field.name] ?? ''} multiline={field.multiline} minRows={field.multiline ? 2 : undefined} inputProps={field.min ? { min: field.min } : undefined} InputLabelProps={field.type === 'date' ? { shrink: true } : undefined} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} />}
      </Grid>)}
    </Grid></DialogContent>
    <DialogActions><Button onClick={onClose}>Cancel</Button><Button variant="contained" onClick={save} sx={{ bgcolor: '#264c3c' }}>{editing ? 'Save changes' : 'Add record'}</Button></DialogActions>
  </Dialog>
}

function RecordPreview({ entity, record, store, onClose }) {
  if (!record) return null
  const values = entity === 'expenses' ? record : entity === 'sales' ? {
    ...record,
    customer: store.customers.find((item) => item.id === record.customerId)?.name || 'Unknown',
    product: store.products.find((item) => item.id === record.productId)?.name || 'Unknown',
  } : record
  return <Dialog open onClose={onClose} fullWidth maxWidth="sm"><DialogTitle sx={{ fontWeight: 800 }}>Expense details</DialogTitle><DialogContent><Stack spacing={1.5} sx={{ pt: 1 }}>{Object.entries(values).filter(([key, value]) => value !== undefined && !['id', 'customerId', 'productId'].includes(key)).map(([key, value]) => <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, borderBottom: '1px solid #e5ece7', pb: 1 }}><Typography color="text.secondary">{key.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase())}</Typography><Typography sx={{ textAlign: 'right', fontWeight: 700 }}>{key === 'amount' || key === 'total' || key === 'unitPrice' ? money(value) : key === 'date' ? dateLabel(value) : String(value ?? '-')}</Typography></Box>)}</Stack></DialogContent><DialogActions><Button onClick={onClose}>Close</Button></DialogActions></Dialog>
}

export function ManagementPage({ entity, store }) {
  const isMobile = useMediaQuery('(max-width:600px)')
  const [query, setQuery] = useState('')
  const [recordToEdit, setRecordToEdit] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [preview, setPreview] = useState(null)
  const title = pageInfo[entity].title
  const records = store[entity]
  const rows = useMemo(() => records.filter((record) => JSON.stringify(record).toLowerCase().includes(query.toLowerCase())).map((record) => ({
    ...record,
    customer: entity === 'sales' ? store.customers.find((item) => item.id === record.customerId)?.name || 'Unknown' : undefined,
    product: entity === 'sales' ? store.products.find((item) => item.id === record.productId)?.name || 'Unknown' : undefined,
    status: entity === 'products' ? productStatus(record) : record.status,
  })), [entity, query, records, store.customers, store.products])

  const columns = entity === 'sales' ? [
    { field: 'number', headerName: 'Sale no.', flex: 1, minWidth: 140 }, { field: 'date', headerName: 'Date', width: 120, valueFormatter: (value) => dateLabel(value) },
    { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 140 }, { field: 'product', headerName: 'Product', flex: 1, minWidth: 140 },
    { field: 'quantity', headerName: 'Qty', width: 70 }, { field: 'total', headerName: 'Total (RWF)', width: 130, valueFormatter: (value) => money(value) },
    { field: 'status', headerName: 'Status', width: 115, renderCell: ({ value }) => <Status value={value} /> },
  ] : entity === 'products' ? [
    { field: 'code', headerName: 'Product no.', flex: 1, minWidth: 140 }, { field: 'name', headerName: 'Product', flex: 1.2, minWidth: 160 },
    { field: 'category', headerName: 'Category', width: 135 }, { field: 'unitPrice', headerName: 'Price (RWF)', width: 130, valueFormatter: (value) => money(value) },
    { field: 'stock', headerName: 'Stock', width: 85 }, { field: 'status', headerName: 'Status', width: 130, renderCell: ({ value }) => <Status value={value} /> },
  ] : entity === 'expenses' ? [
    { field: 'number', headerName: 'Expense no.', flex: 1, minWidth: 140 }, { field: 'date', headerName: 'Date', width: 120, valueFormatter: (value) => dateLabel(value) },
    { field: 'category', headerName: 'Category', width: 140 }, { field: 'description', headerName: 'Description', flex: 1.3, minWidth: 180 },
    { field: 'department', headerName: 'Department', width: 145 }, { field: 'amount', headerName: 'Amount (RWF)', width: 145, valueFormatter: (value) => money(value) },
  ] : [
    { field: 'number', headerName: 'Customer no.', flex: 1, minWidth: 140 }, { field: 'name', headerName: 'Customer', flex: 1.2, minWidth: 160 },
    { field: 'type', headerName: 'Type', width: 125 }, { field: 'phone', headerName: 'Phone', width: 155 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 }, { field: 'status', headerName: 'Status', width: 100 },
  ]

  const mobileColumns = {
    sales: [{ field: 'number', headerName: 'Sale', width: 120 }, { field: 'total', headerName: 'Total', width: 95, valueFormatter: (value) => money(value) }],
    products: [{ field: 'name', headerName: 'Product', width: 120 }, { field: 'unitPrice', headerName: 'Price', width: 95, valueFormatter: (value) => money(value) }],
    expenses: [{ field: 'description', headerName: 'Expense', width: 120 }, { field: 'amount', headerName: 'Amount', width: 95, valueFormatter: (value) => money(value) }],
    customers: [{ field: 'name', headerName: 'Customer', width: 120 }, { field: 'phone', headerName: 'Phone', width: 95 }],
  }
  const actionsColumn = { field: 'actions', headerName: 'Actions', width: isMobile ? 108 : 132, sortable: false, filterable: false, renderCell: ({ row }) => <Stack direction="row" spacing={0}>
    {entity === 'expenses' ? <Tooltip title="View"><IconButton size="small" onClick={() => setPreview(row)}><VisibilityRoundedIcon fontSize="small" /></IconButton></Tooltip> : <Tooltip title="View"><IconButton size="small" component={Link} to={`/${entity}/${row.id}`}><VisibilityRoundedIcon fontSize="small" /></IconButton></Tooltip>}
    <Tooltip title="Edit"><IconButton size="small" onClick={() => setRecordToEdit(row)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (window.confirm(`Delete this ${entity.slice(0, -1)}?`)) store[`remove${entity.slice(0, -1).replace(/^./, (letter) => letter.toUpperCase())}`]?.(row.id) }}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Tooltip>
  </Stack> }
  const visibleColumns = [...(isMobile ? mobileColumns[entity] : columns), actionsColumn]

  const create = () => {
    if (entity === 'sales') setRecordToEdit(null)
    setShowCreate(true)
  }
  return <>
    <Box sx={{ mb: 3 }}><Typography variant="overline" sx={{ color: '#6f877b', fontWeight: 800, letterSpacing: '.13em' }}>{pageInfo[entity].eyebrow}</Typography><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}><Box><Typography variant="h4" sx={{ fontWeight: 800, color: '#10251f' }}>{title}</Typography><Typography sx={{ color: '#72877e', mt: .5 }}>{pageInfo[entity].subtitle}</Typography></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><TextField size="small" placeholder={`Search ${title.toLowerCase()}`} value={query} onChange={(event) => setQuery(event.target.value)} InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: '#8ba096' }} /> }} /><Button onClick={create} variant="contained" startIcon={<AddRoundedIcon />} sx={{ bgcolor: '#b7e45c', color: '#10251f', whiteSpace: 'nowrap' }}>Add {entity.slice(0, -1)}</Button></Stack></Stack></Box>
    <Box sx={{ height: 560, bgcolor: '#fff', border: '1px solid #e0e9e3', borderRadius: 1, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f7faf8' } }}><DataGrid rows={rows} columns={visibleColumns} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick /></Box>
    {(showCreate || recordToEdit) && <RecordDialog key={`${entity}-${recordToEdit?.id || 'new'}`} entity={entity} store={store} record={recordToEdit} onClose={() => { setShowCreate(false); setRecordToEdit(null) }} />}
    {entity === 'expenses' && preview && <RecordPreview entity={entity} record={preview} store={store} onClose={() => setPreview(null)} />}
  </>
}
