import { useEffect, useState } from 'react'
import { ShoppingCart, Search, Package, Star, ChevronLeft, ChevronRight, SlidersHorizontal, X, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import toast from 'react-hot-toast'

const PAGE_SIZE = 8

const SORT_OPTIONS = [
  { label: 'Newest First',       sortBy: 'id',    sortDir: 'desc' },
  { label: 'Price: Low → High',  sortBy: 'price', sortDir: 'asc'  },
  { label: 'Price: High → Low',  sortBy: 'price', sortDir: 'desc' },
  { label: 'Name: A → Z',        sortBy: 'name',  sortDir: 'asc'  },
  { label: 'Name: Z → A',        sortBy: 'name',  sortDir: 'desc' },
]

const CATEGORY_COLORS = {
  'Electronics':   'bg-blue-50 text-blue-700 border-blue-200',
  'Fashion':       'bg-pink-50 text-pink-700 border-pink-200',
  'Home & Kitchen':'bg-orange-50 text-orange-700 border-orange-200',
  'Beauty':        'bg-purple-50 text-purple-700 border-purple-200',
  'Books':         'bg-green-50 text-green-700 border-green-200',
  'Sports':        'bg-red-50 text-red-700 border-red-200',
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const { addToCart } = useCart()
  const { isWishlisted, toggle } = useWishlist()
  const navigate = useNavigate()

  // Category state
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  // Filter state
  const [showFilters, setShowFilters] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortIndex, setSortIndex] = useState(0)
  const [appliedMin, setAppliedMin] = useState('')
  const [appliedMax, setAppliedMax] = useState('')
  const [appliedSort, setAppliedSort] = useState(0)

  const activeFilters = appliedMin || appliedMax || appliedSort !== 0

  useEffect(() => {
    api.get('/api/products/categories').then(res => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const { sortBy, sortDir } = SORT_OPTIONS[appliedSort]
    const params = new URLSearchParams({ page, size: PAGE_SIZE, sortBy, sortDir })
    if (search)           params.append('search', search)
    if (appliedMin)       params.append('minPrice', appliedMin)
    if (appliedMax)       params.append('maxPrice', appliedMax)
    if (selectedCategory) params.append('category', selectedCategory)

    api.get(`/api/products?${params}`).then((res) => {
      const data = res.data
      if (data.content) {
        setProducts(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } else {
        setProducts(data)
        setTotalPages(1)
        setTotalElements(data.length)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page, search, appliedMin, appliedMax, appliedSort, selectedCategory])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setSearch(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(0)
  }

  const handleCategoryClick = (cat) => {
    setSelectedCategory(prev => prev === cat ? '' : cat)
    setPage(0)
  }

  const handleApplyFilters = () => {
    setPage(0)
    setAppliedMin(minPrice)
    setAppliedMax(maxPrice)
    setAppliedSort(sortIndex)
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    setMinPrice(''); setMaxPrice(''); setSortIndex(0)
    setAppliedMin(''); setAppliedMax(''); setAppliedSort(0)
    setPage(0)
  }

  const openFilters = () => {
    setMinPrice(appliedMin)
    setMaxPrice(appliedMax)
    setSortIndex(appliedSort)
    setShowFilters(true)
  }

  const handleAdd = (product) => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-sky-600 to-pink-500 rounded-3xl p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Shop Our Products</h1>
        <p className="text-sky-100 text-lg">Discover amazing products at great prices</p>
      </div>

      {/* Category Chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setSelectedCategory(''); setPage(0) }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              !selectedCategory
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                selectedCategory === cat
                  ? (CATEGORY_COLORS[cat] || 'bg-sky-50 text-sky-700 border-sky-200') + ' ring-2 ring-offset-1 ring-current'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Search + Filter Row */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <form onSubmit={handleSearch} className="relative flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              className="input pl-12 w-72"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary py-3 px-5 text-sm">Search</button>
          {search && (
            <button type="button" onClick={handleClearSearch} className="btn-secondary py-3 px-4 text-sm">Clear</button>
          )}
        </form>

        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            {search
              ? `Found ${totalElements} result${totalElements !== 1 ? 's' : ''} for "${search}"`
              : `Showing ${totalElements} products`}
          </p>
          <button
            onClick={openFilters}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              activeFilters
                ? 'bg-sky-600 text-white border-sky-600'
                : 'border-gray-200 text-gray-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilters && <span className="bg-white text-sky-600 rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">!</span>}
          </button>
          {activeFilters && (
            <button onClick={handleClearFilters} className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Active filter pills */}
      {activeFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {appliedSort !== 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-medium rounded-full border border-sky-200">
              {SORT_OPTIONS[appliedSort].label}
            </span>
          )}
          {appliedMin && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-medium rounded-full border border-sky-200">
              Min ₹{Number(appliedMin).toLocaleString('en-IN')}
            </span>
          )}
          {appliedMax && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-medium rounded-full border border-sky-200">
              Max ₹{Number(appliedMax).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      )}

      {/* Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowFilters(false)} />
          <div className="relative bg-white w-80 h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Filters & Sort</h2>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Sort By</h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((opt, i) => (
                    <label key={i} onClick={() => setSortIndex(i)} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${sortIndex === i ? 'border-sky-600 bg-sky-600' : 'border-gray-300 group-hover:border-sky-400'}`}>
                        {sortIndex === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm ${sortIndex === i ? 'font-semibold text-sky-600' : 'text-gray-600'}`}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Price Range (₹)</h3>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Min</label>
                    <input type="number" className="input w-full text-sm" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} min="0" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Max</label>
                    <input type="number" className="input w-full text-sm" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min="0" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { label: 'Under ₹1K', min: '', max: '1000' },
                    { label: '₹1K–₹10K', min: '1000', max: '10000' },
                    { label: '₹10K–₹50K', min: '10000', max: '50000' },
                    { label: 'Above ₹50K', min: '50000', max: '' },
                  ].map((preset) => (
                    <button key={preset.label} type="button" onClick={() => { setMinPrice(preset.min); setMaxPrice(preset.max) }}
                      className="px-3 py-1 text-xs rounded-full border border-gray-200 text-gray-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-all">
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); setSortIndex(0) }} className="flex-1 btn-secondary py-2.5 text-sm">Reset</button>
              <button type="button" onClick={handleApplyFilters} className="flex-1 btn-primary py-2.5 text-sm">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No products found</p>
          {(search || activeFilters || selectedCategory) && (
            <button onClick={() => { handleClearSearch(); handleClearFilters(); setSelectedCategory('') }} className="mt-4 btn-secondary text-sm">
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} onClick={() => navigate(`/products/${product.id}`)} className="card hover:shadow-md transition-all duration-200 group flex flex-col p-0 overflow-hidden cursor-pointer">
                <div className="w-full h-52 bg-gradient-to-br from-sky-50 to-pink-100 overflow-hidden relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                  ) : null}
                  <div className={`w-full h-full items-center justify-center ${product.imageUrl ? 'hidden' : 'flex'}`}>
                    <Package className="w-16 h-16 text-sky-300" />
                  </div>
                  {product.category && (
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[product.category] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {product.category}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggle(product) }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${isWishlisted(product.id) ? 'text-pink-500 fill-pink-500' : 'text-gray-300'}`} />
                  </button>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                      <span className="text-xs text-gray-400 ml-1">(4.5)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-xl font-bold text-sky-600">₹{Number(product.price).toLocaleString('en-IN')}</p>
                      <p className={`text-xs font-medium ${product.stockQuantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAdd(product) }}
                      disabled={product.stockQuantity === 0}
                      className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-pink-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${i === page ? 'bg-gradient-to-br from-sky-600 to-pink-500 text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-400 ml-2">Page {page + 1} of {totalPages}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
