import { Bell, ShoppingBag } from "lucide-react"
import { Link } from "react-router-dom"
import { useGetCartListQuery } from "../../config/redux/services/apiService"
import { useSelector } from "react-redux"

export default function CartInfo({ absolute = true }) {
  const { user: userData, token } = useSelector((state) => state.general)
  const { data: cartList } = useGetCartListQuery()
  const cartItems = cartList?.data || []
  return (
    <div
      className={
        absolute ? "absolute top-10 right-10" : " flex items-center gap-4"
      }
    >
      <Link to="/cart" className="flex-1 text-center py-3 relative">
        <ShoppingBag className="text-gray-600 text-3xl" />
        <div className="absolute top-[-1px] right-[-10px] bg-red-500 text-white text-xs px-[6px] py-[1px] rounded-full">
          {cartItems.length || 0}
        </div>
      </Link>
      {userData && (
        <Link to="/notifications" className="flex-1 text-center py-3 relative">
          <Bell className="text-gray-600 text-3xl" />
          {/* <div className="absolute top-[-1px] right-[-10px] bg-red-500 text-white text-xs px-[6px] py-[1px] rounded-full">
          {cartItems.length || 0}
        </div> */}
        </Link>
      )}
    </div>
  )
}
