import {
  AppstoreOutlined,
  ArrowRightOutlined,
  BellOutlined,
  CloseCircleFilled,
  HomeOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Empty, Input, Spin, Pagination } from "antd"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useSettings } from "../Context/SettingsContext"
import axiosInstance from "../services/axiosInstance"
import CartInfo from "../components/CartInfo"
import { useSelector } from "react-redux"

const MallPage = () => {
  const { user: userData, token } = useSelector((state) => state.general)
  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [isSearch, setIsSearch] = useState(false)
  const [listCategory, setListCategory] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  })

  const loadCategory = (url = "/api/mitra/list") => {
    setLoading(true)
    const params = {
      page: pagination.current,
      per_page: pagination.pageSize,
      search: search,
    }

    axiosInstance
      .get(url, { params })
      .then((res) => {
        setLoading(false)
        setListCategory(res?.data?.data || [])
        setPagination({
          ...pagination,
          total: res?.data?.total || 0,
        })
      })
      .catch((err) => setLoading(false))
  }

  useEffect(() => {
    loadCategory()
  }, [])

  const handleChangeSearch = () => {
    setIsSearch(true)
    loadCategory(`/api/product/category?search=${search}`)
  }

  const handleChangePage = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize,
    })
    loadCategory()
  }

  return (
    <div className="bg-white pb-20">
      {/* navbar */}
      <div className="p-4 sticky top-0 bg-gray-100">
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
      </div>
      {/* end navbar */}

      <div className="mx-4 mt-8">
        {listCategory && listCategory.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              {listCategory.map((item) => (
                <Link key={item?.id} to={`/store/${item.id}`}>
                  <div className="border border-white p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <img
                      src={item?.logo || item?.category_image}
                      alt={item?.shop_name || item?.category_name}
                      className="w-24 h-24 mb-2 rounded-full"
                    />
                    <p className="text-gray-600 text-sm">
                      {item?.shop_name || item?.category_name}
                    </p>
                    {item?.address && (
                      <p className="text-gray-500 text-xs mt-1">
                        {item.address}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {listCategory.length > 12 && (
              <Pagination
                className="mt-4 text-center"
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handleChangePage}
              />
            )}
          </>
        ) : (
          <div className="h-[80vh] flex items-center justify-center">
            {loading ? (
              <Spin />
            ) : (
              <Empty description="Tidak ada produk disini" />
            )}
          </div>
        )}
      </div>

      {/* bottom tab */}
      <div class="max-w-lg mx-auto fixed bottom-0 left-0 right-0 bg-gray-100 shadow">
        <div class="flex justify-between">
          <Link to="/" class="flex-1 text-center py-3 hover:bg-gray-100">
            <span>
              <HomeOutlined />
            </span>
            <br />
            <span class="text-sm">Home</span>
          </Link>
          <Link to="/mall" class="flex-1 text-center py-3 hover:bg-gray-100">
            <span>
              <AppstoreOutlined className="text-gray-800" />
            </span>
            <br />
            <span class="text-sm text-gray-800">Mall</span>
          </Link>

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

export default MallPage
