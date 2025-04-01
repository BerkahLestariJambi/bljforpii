import {
  AppstoreOutlined,
  CloseCircleFilled,
  HomeOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MailOutlined,
  BellOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons"
import { Empty, Input, message, Pagination, Spin, Carousel } from "antd"
import axios from "axios"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import ProductItem, { ModalPembayaran } from "../components/ProductItem"
import { useSettings } from "../Context/SettingsContext"
import {
  createLog,
  fetchWalletAddress,
  getItem,
  onCancel,
  onError,
  onIncompletePaymentFound,
  onReadyForServerApproval,
  onReadyForServerCompletion,
  removeItem,
  setItem,
} from "../utils/helper"
import axiosInstance from "../services/axiosInstance"
import CartInfo from "../components/CartInfo"
import {
  useGetAddressQuery,
  useLoginMutation,
} from "../config/redux/services/apiService"
import { setToken, setUser } from "../config/redux/reducer/generalReducer"

function HomePage() {
  const dispatch = useDispatch()
  const { user: userData, token } = useSelector((state) => state.general)
  const { data: addressData } = useGetAddressQuery()
  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [isSearch, setIsSearch] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [login] = useLoginMutation()
  const loginBE = (body) => {
    setLoadingAuth(true)
    login(body)
      .then(({ error, data }) => {
        if (error) {
          setLoadingAuth(false)
          return
        }
        setLoadingAuth(false)
        const user = data?.data?.data?.user
        if (user) {
          dispatch(setToken(data?.data?.data?.access_token))
          dispatch(
            setUser({
              ...user,
              uid: body?.uid,
              foto: user?.profile_image_url,
            })
          )
          setItem("access_token", data?.data?.data?.access_token)
          setItem("userDataBe", JSON.stringify({ ...user, uid: body?.uid }))
        }
      })
      .catch((err) => {})
  }

  const signIn = async () => {
    setLoadingAuth(true)
    const scopes = ["username", "payments", "wallet_address"]
    const authResult = await window.Pi.authenticate(
      scopes,
      onIncompletePaymentFound
    )
    const authResult = { user: { username: "yudicandraa" } }
    setLoadingAuth(false)
    if (authResult) {
      loginBE(authResult?.user)
      createLog({ value: "Log Signin", body: JSON.stringify(authResult) })
      setItem("username", authResult?.user?.username || null)
      await fetchWalletAddress(authResult.accessToken)
    }
  }

  const loadProduct = (
    url = "/api/product/list",
    perpage = 25,
    params = { page: currentPage }
  ) => {
    setLoading(true)
    axiosInstance
      .post(`${url}`, {
        perpage,
        ...params,
      })
      .then((res) => {
        console.log(res, "res")
        setLoading(false)
        setTotal(res?.data?.data?.total)
        setCurrentPage(res?.data?.data?.current_page)
        setProducts(res?.data?.data?.data || [])
      })
      .catch((err) => setLoading(false))
  }

  const loadBanners = () => {
    axiosInstance.get("/api/banner/list").then((res) => {
      setBanners(res?.data?.data || [])
    })
  }

  const loadCategories = () => {
    axiosInstance.get("/api/product/category").then((res) => {
      setCategories(res?.data?.data || [])
    })
  }

  const handleChangeSearch = () => {
    setIsSearch(true)
    loadProduct(`/api/product/list`, 25, { search })
  }

  const handleChange = (page, pageSize = 25) => {
    loadProduct(`/api/product/list?page=${page}`, pageSize, {
      search,
      page,
    })
  }

  const orderProduct = async (memo, amount, paymentMetadata) => {
    const paymentData = {
      amount,
      memo,
      metadata: paymentMetadata,
    }
    const callbacks = {
      onReadyForServerApproval,
      onReadyForServerCompletion,
      onCancel,
      onError,
    }
    const payment = await window.Pi.createPayment(paymentData, callbacks)
    createLog({ value: "Create Order Payment", body: JSON.stringify(payment) })
  }

  useEffect(() => {
    if (!window.Pi) {
      return alert("Please open this app in the Pi Browser.")
    }

    loadProduct()
    loadBanners()
    loadCategories()
  }, [])

  const totalCategories = categories.length
  return (
    <div className="bg-white pb-20">
      <div className="p-4 sticky top-0 bg-gray-100 z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <img
              src={settings?.logo || require("../assets/img/logo.jpeg")}
              alt=""
              className="w-12 h-12 rounded-full"
            />
          </div>
          <div className="flex-1">
            <Input
              onPressEnter={() => handleChangeSearch()}
              suffix={
                isSearch ? (
                  <CloseCircleFilled
                    onClick={() => {
                      loadProduct()
                      setSearch(null)
                      setIsSearch(false)
                    }}
                  />
                ) : (
                  <SearchOutlined onClick={() => handleChangeSearch()} />
                )
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari di sini"
            />
          </div>
          <div className="flex gap-3 text-white flex-shrink-0">
            {/* <Link to="/messages">
              <MailOutlined style={{ fontSize: "20px" }} />
            </Link>
            <Link to="/notifications">
              <BellOutlined style={{ fontSize: "20px" }} />
            </Link> */}
            <CartInfo absolute={false} />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-white">
          <EnvironmentOutlined />
          <span>Dikirim ke : Pilih Pengiriman</span>
        </div> 

        <div className="flex justify-between items-center mb-4 mt-4">
          <div>
            <p className="text-gray-800">
              Hai, {userData?.username || "Pengunjung!"}
            </p>
            <p className="text-gray-800 text-sm">
              {userData ? "Selamat Datang Kembali" : "Akses semua fitur, yuk"}
            </p>
          </div>
          <ModalPembayaran
            isLogin={userData ? true : false}
            user={userData}
            isNew={userData?.profile_complete == 0}
            loading={loadingAuth}
            buttonOnly={true}
            onKlikOk={() => {
              if (userData) {
                removeItem("access_token")
                removeItem("userDataBe")
                dispatch(setToken(null))
                return dispatch(setUser(null))
              }
              return signIn()
            }}
          />
        </div>
      </div>
      {/* {userData && <p>{JSON.stringify(userData)}</p>} */}

      {/* Banner Carousel */}
      <div className="p-4 mb-6">
        <Carousel autoplay className="mb-4 rounded-lg">
          {banners.map((banner) => (
            <div key={banner.id}>
              <Link to={banner.banner_url}>
                <img
                  src={banner.banner_image}
                  alt={banner.banner_name}
                  className="w-full h-[200px] object-cover rounded-lg"
                />
              </Link>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Categories */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Kategori Pilihan</h2>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category, index) => {
            if (totalCategories < 7 && totalCategories >= 1) {
              if (index < 3) {
                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                      <img
                        src={category.category_image}
                        alt={category.category_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-xs">{category.category_name}</span>
                  </Link>
                )
              }
            }
            if (totalCategories >= 7) {
              if (index < 7) {
                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                      <img
                        src={category.category_image}
                        alt={category.category_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-xs">{category.category_name}</span>
                  </Link>
                )
              }
            }
          })}
          <Link
            to="/category"
            className="flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
              <AppstoreOutlined style={{ fontSize: "20px" }} />
            </div>
            <span className="text-xs">Semua Kategori</span>
          </Link>
        </div>
      </div>

      {products && products.length > 0 ? (
        <div className="mb-20">
          <div className="columns-2 gap-4 p-4 [&>div]:mb-4">
            {products &&
              products.map((item) => (
                <div key={item.id} className="break-inside-avoid">
                  <ProductItem
                    item={item}
                    onOrder={(value) => {
                      if (!userData) {
                        return message.error("Anda Belum Login")
                      }
                      const product_price = item?.product_price || 1
                      orderProduct(
                        item.product_name,
                        product_price * value?.qty +
                          value?.expeditions?.biaya_pengiriman,
                        {
                          items: [
                            {
                              name: item.product_name,
                              productId: item.id,
                              qty: value?.qty || 1,
                              price: product_price,
                            },
                          ],
                          expeditions: value?.expeditions,
                          address_id: value?.address_id,
                        }
                      )
                    }}
                    user={userData || getItem("userDataBe")}
                  />
                </div>
              ))}
          </div>
          {total > 25 && (
            <div className="mt-6 w-full mx-auto text-center">
              <Pagination
                align="center"
                current={currentPage}
                total={total}
                pageSize={25}
                onChange={handleChange}
                className="text-gray-200"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="h-[80vh] flex items-center justify-center">
          {loading ? <Spin /> : <Empty description="Tidak ada produk disini" />}
        </div>
      )}

      {/* bottom tab */}
      <div className="max-w-lg mx-auto fixed bottom-0 left-0 right-0 bg-white shadow bg-gray-100">
        <div className="flex justify-between  bg-gray-100">
          <Link to="/" className="flex-1 text-center py-3 hover:bg-gray-100">
            <span>
              <HomeOutlined className="text-gray-800" />
            </span>
            <br />
            <span className="text-sm text-gray-800">Home</span>
          </Link>
          <Link
            to="/mall"
            className="flex-1 text-center py-3 hover:bg-gray-100"
          >
            <span>
              <AppstoreOutlined />
            </span>
            <br />
            <span className="text-sm">Mall</span>
          </Link>

          {/* Notification */}
          {/* {userData && (
            <Link
              to="/notifications"
              className="flex-1 text-center py-3 hover:bg-gray-100"
            >
              <span>
                <BellOutlined />
              </span>
              <br />
              <span className="text-sm">Notification</span>
            </Link>
          )} */}

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
      </div>
    </div>
  )
}

export default HomePage
