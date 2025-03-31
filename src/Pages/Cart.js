import {
  AppstoreOutlined,
  DeleteOutlined,
  HomeOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Button, Empty, message, Spin, Modal, Radio, Drawer } from "antd"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import {
  useGetCartListQuery,
  useGetShippingMethodQuery,
  useRemoveCartMutation,
  useUpdateCartMutation,
  useGetAddressQuery,
} from "../config/redux/services/apiService"
import { useSettings } from "../Context/SettingsContext"
import {
  createLog,
  onCancel,
  onError,
  onReadyForServerApproval,
  onReadyForServerCompletion,
} from "../utils/helper"
import { useEffect, useState } from "react"

function CartPage() {
  const { user: userData } = useSelector((state) => state.general)
  const { settings } = useSettings()
  const [selectedItem, setSelectedItem] = useState(null)
  const [addressModal, setAddressModal] = useState(false)
  const [shippingModal, setShippingModal] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("pickup")
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [shippingCost, setShippingCost] = useState(0)

  const { data: cartList, isLoading, isFetching } = useGetCartListQuery()
  const [removeCart] = useRemoveCartMutation()
  const [updateCart] = useUpdateCartMutation()
  const { data: shippingData, isLoading: isLoadingShippingOptions } =
    useGetShippingMethodQuery()
  const { data: addressData } = useGetAddressQuery()

  const shippingOptions = shippingData?.data || []
  const addresses = addressData?.data || []
  console.log(shippingOptions, "shippingOptions")
  useEffect(() => {
    const cart = cartList?.data?.find((item) => item.id === selectedItem?.id)
    if (cart) {
      setSelectedItem(cart)
    }
  }, [cartList?.data, selectedItem])

  const loading = isLoading || isFetching
  const cartItems = cartList?.data || []

  const subtotal = cartItems?.reduce(
    (acc, item) => acc + item?.product?.product_price * item?.qty,
    0
  )

  const total = subtotal + shippingCost

  const updateQuantity = (id, type) => {
    updateCart({
      id: id,
      type,
    })
      .then((res) => {
        message.success("Cart updated successfully")
      })
      .catch((err) => {
        message.error("Failed to update cart")
      })
  }

  const removeItem = (itemId) => {
    removeCart({
      id: itemId,
    })
      .then((res) => {
        message.success("Cart removed successfully")
      })
      .catch((err) => {
        message.error("Failed to remove cart")
      })
  }

  const handleCheckout = () => {
    if (!userData) {
      return message.error("Please login first")
    }
    setAddressModal(true)
  }

  const handleAddressSelected = () => {
    setAddressModal(false)
    setShippingModal(true)
  }

  const handleShippingSelected = () => {
    checkout()
  }

  const handleShippingMethodChange = (e) => {
    const selectedOption = shippingOptions.find(
      (option) => option.kode === e.target.value
    )
    setShippingMethod(e.target.value)
    setShippingCost(selectedOption?.biaya_pengiriman || 0)
  }

  const checkout = async () => {
    if (!selectedAddress) {
      return message.error("Please select a delivery address")
    }

    setShippingModal(false)

    const selectedShipping = shippingOptions.find(
      (option) => option.kode === shippingMethod
    )

    const paymentData = {
      amount: total,
      memo: `Payment for cart items`,
      metadata: {
        items: cartItems
          .filter((item) => item?.product?.product_stock > 0)
          .map((item) => ({
            name: item?.product?.product_name,
            productId: item?.product?.id,
            qty: item?.qty,
            price: item?.product?.product_price,
          })),
        expeditions: {
          ...selectedShipping,
          cost: shippingCost,
        },
        address_id: selectedAddress,
      },
    }

    const callbacks = {
      onReadyForServerApproval,
      onReadyForServerCompletion,
      onCancel,
      onError,
    }

    try {
      const payment = await window.Pi.createPayment(paymentData, callbacks)
      createLog({ value: "Create Cart Payment", body: JSON.stringify(payment) })
    } catch (error) {
      message.error("Payment failed")
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      <div className="p-4 sticky top-0 bg-gray-100 z-10">
        <div className="text-center font-bold text-lg">
          <div className={"absolute top-10 left-10"}>
            <Link to="/" className="flex-1 text-center py-3 relative">
              <HomeOutlined className="text-white text-3xl" />
            </Link>
          </div>
          <div>
            <img
              src={settings?.logo || require("../assets/img/logo.jpeg")}
              alt=""
              className="w-10 h-10 rounded-full mx-auto"
            />
            <p className="ml-3 text-white">
              {settings?.app_name || "Berkah Lestari Jaya"}
            </p>
          </div>
        </div>

        {cartItems && cartItems.length > 0 ? (
          <div className="p-4">
            {/* <div className="mb-4 text-white text-center">
              {!selectedItem ? (
                <p className="bg-gray-700 p-2 rounded-lg">
                  👆 Select an item to checkout
                </p>
              ) : (
                <p className="bg-green-600 p-2 rounded-lg">
                  ✅ Item selected for checkout
                </p>
              )}
            </div> */}
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg p-4 shadow cursor-pointer relative ${
                  selectedItem?.id === item.id ? "border-2 border-gray-600" : ""
                } ${index === cartItems.length - 1 ? "mb-16" : "mb-4"}`}
                // onClick={() =>
                //   setSelectedItem(selectedItem?.id === item.id ? null : item)
                // }
              >
                {selectedItem?.id === item.id && (
                  <div className="absolute -top-2 -right-2 bg-gray-100 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    ✓
                  </div>
                )}
                <div className="flex items-center">
                  <img
                    src={item?.product?.product_image_url}
                    alt={item?.product?.product_name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold">
                      {item?.product?.product_name}
                    </h3>
                    <p className="text-gray-600">
                      {item?.product?.product_price * item?.qty} π
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center gap-2 border border-gray-600 rounded-md p-1 px-2">
                        <MinusOutlined
                          onClick={(e) => {
                            e.stopPropagation()
                            updateQuantity(item.id, "decrement")
                          }}
                          className="cursor-pointer text-sm"
                          disabled={item?.qty <= 1}
                        />
                        <p className="text-gray-600 mx-2">{item.qty}</p>
                        <PlusOutlined
                          onClick={(e) => {
                            e.stopPropagation()
                            updateQuantity(item.id, "increment")
                          }}
                          className="cursor-pointer text-sm"
                          disabled={item?.product?.product_stock === 0}
                        />
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                          removeItem(item.id)
                        }}
                        className="ml-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="fixed bottom-0 left-0 right-0 p-4 px-4">
              <div className="max-w-lg mx-auto rounded-lg p-4 mx-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-gray-600">{total} π</span>
                  </div>
                  <Button
                    type="primary"
                    block
                    onClick={handleCheckout}
                    className="bg-blue-500"
                    icon={<ShoppingCartOutlined />}
                    disabled={cartItems.length === 0}
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[60vh] flex items-center justify-center">
            {loading ? <Spin /> : <Empty description="Your cart is empty" />}
          </div>
        )}

        {/* Address Selection Drawer */}
        <Drawer
          title="Select Delivery Address"
          open={addressModal}
          onClose={() => setAddressModal(false)}
          placement="bottom"
          height="90vh"
          className="rounded-t-[20px]"
        >
          <div className="space-y-4">
            {addresses.length > 0 ? (
              <Radio.Group
                className="w-full"
                onChange={(e) => setSelectedAddress(e.target.value)}
                value={selectedAddress}
              >
                {addresses.map((address) => (
                  <Radio
                    key={address.id}
                    value={address.id}
                    className="w-full mb-4"
                  >
                    <div className="p-4 border rounded-lg hover:border-gray-600">
                      <div className="font-medium text-lg">{address.nama}</div>
                      <div className="text-gray-600">{address.telepon}</div>
                      <div className="mt-1 text-sm text-gray-600">
                        {address.alamat}, {address.kelurahan?.nama},{" "}
                        {address.kecamatan?.nama}, {address.kabupaten?.nama},{" "}
                        {address.provinsi?.nama}
                        {address.kodepos && ` - ${address.kodepos}`}
                      </div>
                    </div>
                  </Radio>
                ))}
              </Radio.Group>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No addresses found</p>
                <Link to="/address-list">
                  <Button type="primary" className="bg-blue-500">
                    Add New Address
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <Button
              type="primary"
              block
              className="bg-blue-500"
              onClick={handleAddressSelected}
              disabled={!selectedAddress}
            >
              Continue to Shipping
            </Button>
          </div>
        </Drawer>

        {/* Shipping Method Drawer */}
        <Drawer
          title="Select Shipping Method"
          open={shippingModal}
          onClose={() => setShippingModal(false)}
          placement="bottom"
          height="90vh"
          className="rounded-t-[20px]"
        >
          <div className="space-y-4">
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-600">Order Summary</div>
              <div className="flex justify-between mt-2">
                <span>Subtotal</span>
                <span>{subtotal} π</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Shipping Cost</span>
                <span>{shippingCost} π</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t font-medium">
                <span>Total</span>
                <span className="text-gray-600">{total} π</span>
              </div>
            </div>

            <Radio.Group
              className="w-full"
              onChange={handleShippingMethodChange}
              value={shippingMethod}
            >
              {shippingOptions.map((option) => (
                <Radio
                  key={option.id}
                  value={option.kode}
                  className="w-full mb-4"
                >
                  <div className="p-4 border rounded-lg hover:border-gray-600">
                    <div className="flex items-center gap-4">
                      <img
                        src={option.logo}
                        alt={option.name}
                        className="w-16 h-16 object-contain"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-lg">{option.name}</div>
                        <div className="text-sm text-gray-600">
                          Estimated delivery: {option.estimasi_pengiriman}
                        </div>
                        <div className="text-gray-600 font-medium mt-1">
                          {option.biaya_pengiriman} π
                        </div>
                      </div>
                    </div>
                  </div>
                </Radio>
              ))}
            </Radio.Group>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <div className="mb-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Selected Address:</span>
                <span className="font-medium">
                  {addresses.find((addr) => addr.id === selectedAddress)?.nama}
                </span>
              </div>
              <div className="flex justify-between items-center font-medium">
                <span>Total Payment:</span>
                <span className="text-gray-600 text-lg">{total} π</span>
              </div>
            </div>
            <Button
              type="primary"
              block
              className="bg-blue-500"
              onClick={handleShippingSelected}
              disabled={!shippingMethod}
            >
              Proceed to Payment
            </Button>
          </div>
        </Drawer>

        {/* bottom tab */}
        {/* <div className="max-w-lg mx-auto fixed bottom-0 left-0 right-0 bg-white shadow bg-gray-100">
        <div className="flex justify-between bg-gray-100">
          <Link to="/" className="flex-1 text-center py-3 hover:bg-gray-100">
            <span>
              <HomeOutlined />
            </span>
            <br />
            <span className="text-sm">Home</span>
          </Link>
          <Link
            to="/category"
            className="flex-1 text-center py-3 hover:bg-gray-100"
          >
            <span>
              <AppstoreOutlined />
            </span>
            <br />
            <span className="text-sm">Category</span>
          </Link>
          <Link
            to="/cart"
            className="flex-1 text-center py-3 hover:bg-gray-100"
          >
            <span>
              <ShoppingCartOutlined className="text-white" />
            </span>
            <br />
            <span className="text-sm text-white">Cart</span>
          </Link>
          <Link
            to="/profile"
            className="flex-1 text-center py-3 hover:bg-gray-100"
          >
            <span>
              <UserOutlined />
            </span>
            <br />
            <span className="text-sm">Profile</span>
          </Link>
        </div>
      </div> */}
      </div>
    </div>
  )
}

export default CartPage
