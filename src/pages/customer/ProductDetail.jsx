import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Package, Star, Send, Minus, Plus } from 'lucide-react'
import api from '../../api/axios'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0)
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} transition-colors cursor-${readonly ? 'default' : 'pointer'} ${
            i <= (readonly ? value : (hovered || value))
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={() => !readonly && onChange && onChange(i)}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
        />
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewPage, setReviewPage] = useState(0)
  const [totalReviewPages, setTotalReviewPages] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/api/products/${id}`).then((res) => {
      setProduct(res.data)
      setLoading(false)
    }).catch(() => { setLoading(false) })

    api.get(`/api/products/${id}/reviews/summary`).then((res) => {
      setAvgRating(res.data.averageRating)
      setReviewCount(res.data.reviewCount)
    }).catch(() => {})
  }, [id])

  useEffect(() => {
    api.get(`/api/products/${id}/reviews?page=${reviewPage}&size=5`).then((res) => {
      setReviews(res.data.content)
      setTotalReviewPages(res.data.totalPages)
    }).catch(() => {})
  }, [id, reviewPage])

  const handleAdd = () => {
    if (!product) return
    addToCart(product, quantity)
    toast.success(`${product.name} (×${quantity}) added to cart!`)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!myRating) return toast.error('Please select a rating')
    setSubmitting(true)
    try {
      await api.post(`/api/products/${id}/reviews`, { rating: myRating, comment: myComment })
      toast.success('Review submitted!')
      setMyRating(0)
      setMyComment('')
      // Refresh reviews + summary
      const [reviewsRes, summaryRes] = await Promise.all([
        api.get(`/api/products/${id}/reviews?page=0&size=5`),
        api.get(`/api/products/${id}/reviews/summary`),
      ])
      setReviews(reviewsRes.data.content)
      setTotalReviewPages(reviewsRes.data.totalPages)
      setReviewPage(0)
      setAvgRating(summaryRes.data.averageRating)
      setReviewCount(summaryRes.data.reviewCount)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!product) return (
    <div className="text-center py-20 text-gray-400">Product not found</div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-gray-500 hover:text-sky-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      {/* Product Section */}
      <div className="card p-0 overflow-hidden mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="h-80 md:h-auto bg-gradient-to-br from-sky-50 to-pink-100 flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              />
            ) : null}
            <div className={`w-full h-full items-center justify-center ${product.imageUrl ? 'hidden' : 'flex'}`}>
              <Package className="w-24 h-24 text-sky-300" />
            </div>
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {/* Rating summary */}
              <div className="flex items-center gap-3 mb-4">
                <StarRating value={Math.round(avgRating)} readonly size="sm" />
                <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

              <div className="flex items-center gap-4 mb-6">
                <p className="text-3xl font-bold text-sky-600">₹{Number(product.price).toLocaleString('en-IN')}</p>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  product.stockQuantity > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.stockQuantity > 0
                    ? product.stockQuantity <= 5 ? `Only ${product.stockQuantity} left!` : `${product.stockQuantity} in stock`
                    : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Quantity + Add */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={product.stockQuantity === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Ratings & Reviews
          {reviewCount > 0 && (
            <span className="ml-3 text-sm font-normal text-gray-400">
              {avgRating.toFixed(1)} / 5 · {reviewCount} review{reviewCount !== 1 ? 's' : ''}
            </span>
          )}
        </h2>

        {/* Write a Review */}
        <form onSubmit={handleSubmitReview} className="bg-sky-50 rounded-2xl p-5 mb-8 border border-sky-100">
          <h3 className="font-semibold text-gray-800 mb-3">Write a Review</h3>
          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-1">Your Rating</p>
            <StarRating value={myRating} onChange={setMyRating} />
          </div>
          <textarea
            className="input w-full resize-none text-sm"
            placeholder="Share your experience (optional)..."
            rows={3}
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting || !myRating}
            className="mt-3 flex items-center gap-2 btn-primary py-2 px-5 text-sm disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        {/* Review List */}
        {reviews.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {review.username[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800">{review.username}</span>
                  </div>
                  <StarRating value={review.rating} readonly size="sm" />
                </div>
                {review.comment && <p className="text-gray-600 text-sm ml-11">{review.comment}</p>}
                <p className="text-xs text-gray-400 ml-11 mt-1">
                  {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}

            {/* Review Pagination */}
            {totalReviewPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setReviewPage(p => Math.max(0, p - 1))}
                  disabled={reviewPage === 0}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-sky-50 disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-500">Page {reviewPage + 1} of {totalReviewPages}</span>
                <button
                  onClick={() => setReviewPage(p => Math.min(totalReviewPages - 1, p + 1))}
                  disabled={reviewPage === totalReviewPages - 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-sky-50 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
