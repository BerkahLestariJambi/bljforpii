import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseCircleFilled,
  HomeOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Empty, Input, Spin } from "antd"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useSettings } from "../Context/SettingsContext"
import axiosInstance from "../services/axiosInstance"
import CartInfo from "../components/CartInfo"

const CategoryPage = () => {
  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [isSearch, setIsSearch] = useState(false)
  const [listCategory, setListCategory] = useState([])

  const loadCategory = (url = "/api/product/category") => {
    setLoading(true)
    axiosInstance
      .get(`${url}`)
      .then((res) => {
        setLoading(false)
        setListCategory(res?.data?.data || [])
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

  return (
    <div className="bg-white pb-20">
      {/* navbar */}
      <div className="p-4 sticky top-0 bg-gray-100">
        <div className="flex justify-between">
          <Link to="/">
            <div className="flex items-center font-bold text-lg">
              <ArrowLeftOutlined className=" text-gray-600" />
              <p className="ml-3 text-gray-600">Daftar Kategori</p>
            </div>
          </Link>
          <CartInfo absolute={false} />
        </div>
      </div>
      {/* end navbar */}

      <div className="mx-4 mt-8">
        {listCategory && listCategory.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {listCategory.map((item) => (
              <Link key={item?.id} to={`/category/${item.id}`}>
                <div className="border border-white p-4 rounded-lg flex flex-col items-center justify-center text-center">
                  <img
                    src={item?.category_image}
                    alt={item?.category_name}
                    className="w-12 h-12 mb-2 rounded-full"
                  />
                  <p className="text-gray-600 text-sm">{item?.category_name}</p>
                </div>
              </Link>
            ))}
          </div>
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
      {/* <div class="max-w-lg mx-auto fixed bottom-0 left-0 right-0 bg-gray-100 shadow">
        <div class="flex justify-between">
          <Link to="/" class="flex-1 text-center py-3 hover:bg-gray-100">
            <span>
              <HomeOutlined />
            </span>
            <br />
            <span class="text-sm">Home</span>
          </Link>
          <Link
            to="/category"
            class="flex-1 text-center py-3 hover:bg-gray-100"
          >
            <span>
              <AppstoreOutlined className="text-white" />
            </span>
            <br />
            <span class="text-sm text-white">Category</span>
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
  )
}

export default CategoryPage
