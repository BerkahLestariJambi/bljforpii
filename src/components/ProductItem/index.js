import {
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Select,
  Spin,
} from "antd"
import axios from "axios"
import { MapPin, Plus, ShoppingCart } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setUser } from "../../config/redux/reducer/generalReducer"
import {
  useAddCartMutation,
  useGetAddressQuery,
  useGetShippingMethodQuery,
  useSaveAddressMutation,
  useUpdateProfileMutation,
} from "../../config/redux/services/apiService"
import { BASE_URL } from "../../utils/constants"
import { getItem } from "../../utils/helper"

const ProductItem = ({ onOrder, item, user }) => {
  return (
    <div className="border rounded-lg bg-white p-4 hover:shadow-lg transition-shadow">
      <img
        src={
          item.product_image_url ||
          "https://www.southernliving.com/thmb/_Msu9OCpvE-OUTRvfYxCIJyPbhE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/27196_AdaptiveCottage00006-2000-7702094217044ce4830a8adb0a69b6da.jpg"
        }
        alt=""
        className="h-40 w-full object-cover rounded-lg mb-3"
      />
      <div className="text-gray-800">
        <p className="font-bold text-sm line-clamp-2 min-h-[40px]">
          {item.product_name}
        </p>
        <p className="text-gray-600 font-bold text-lg mt-2">
          {item.product_price} π
        </p>
        <div className="mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-1 mb-1">
            <MapPin />
            <p>{item?.kabupaten?.nama || "Jakarta Utara"}</p>
          </div>
          <div className="flex items-center justify-between">
            <p>Stock: {item?.product_stock}</p>
            {/* <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span>5.0</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">2 terjual</span>
            </div> */}
          </div>
        </div>
        <ModalDetail onOrder={onOrder} item={item} user={user} />
      </div>
    </div>
  )
}

const ModalDetail = ({ onOrder, item, user }) => {
  const { token } = useSelector((state) => state.general)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [qty, setQty] = useState(1)
  const [addCart, { isLoading: isAddLoading }] = useAddCartMutation()
  const { data: shippingData, isLoading: isLoadingShippingOptions } =
    useGetShippingMethodQuery()
  const {
    data: addressData,
    isLoading: isLoadingAddress,
    refetch,
  } = useGetAddressQuery()
  const [addressModal, setAddressModal] = useState(false)
  const [shippingModal, setShippingModal] = useState(false)
  const [shippingMethod, setShippingMethod] = useState("pickup")
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [shippingCost, setShippingCost] = useState(0)
  const [addressForm] = Form.useForm()
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [saveAddress] = useSaveAddressMutation()

  const [provinsiData, setProvinsiData] = useState([])
  const [kabupatenData, setKabupatenData] = useState([])
  const [kecamatanData, setKecamatanData] = useState([])
  const [kelurahanData, setKelurahanData] = useState([])

  const [provinsiLoading, setProvinsiLoading] = useState(false)
  const [kabupatenLoading, setKabupatenLoading] = useState(false)
  const [kecamatanLoading, setKecamatanLoading] = useState(false)
  const [kelurahanLoading, setKelurahanLoading] = useState(false)

  const shippingOptions = shippingData?.data || []
  const addresses = addressData?.data || []

  const total = item.product_price * qty + shippingCost

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleIncrement = () => {
    if (qty < item.product_stock) {
      setQty(qty + 1)
    }
  }

  const handleDecrement = () => {
    if (qty > 1) {
      setQty(qty - 1)
    }
  }

  const handleShippingMethodChange = (option) => {
    setShippingMethod(option.kode)
    setShippingCost(option?.biaya_pengiriman || 0)
  }

  const handleBuyNow = () => {
    setAddressModal(true)
  }

  const handleAddressSelected = () => {
    setAddressModal(false)
    setShippingModal(true)
  }

  const handleShippingSelected = () => {
    setShippingModal(false)
    setIsModalOpen(false)
    const selectedShipping = shippingOptions.find(
      (option) => option.kode === shippingMethod
    )

    onOrder({
      ...user,
      qty,
      expeditions: {
        ...selectedShipping,
        cost: shippingCost,
      },
      address_id: selectedAddress,
      total,
    })
  }

  const getProvinsi = () => {
    setProvinsiLoading(true)
    axios
      .get(`${BASE_URL}/api/address/master/provinsi`)
      .then((res) => {
        setProvinsiLoading(false)
        setProvinsiData(res.data.data)
      })
      .catch(() => setProvinsiLoading(false))
  }

  const getKabupaten = (prov_id) => {
    setKabupatenLoading(true)
    axios
      .get(`${BASE_URL}/api/address/master/kabupaten/${prov_id}`)
      .then((res) => {
        setKabupatenLoading(false)
        setKabupatenData(res.data.data)
      })
      .catch(() => setKabupatenLoading(false))
  }

  const getKecamatan = (kab_id) => {
    setKecamatanLoading(true)
    axios
      .get(`${BASE_URL}/api/address/master/kecamatan/${kab_id}`)
      .then((res) => {
        setKecamatanLoading(false)
        setKecamatanData(res.data.data)
      })
      .catch(() => setKecamatanLoading(false))
  }

  const getKelurahan = (kec_id) => {
    setKelurahanLoading(true)
    axios
      .get(`${BASE_URL}/api/address/master/kelurahan/${kec_id}`)
      .then((res) => {
        setKelurahanLoading(false)
        setKelurahanData(res.data.data)
      })
      .catch(() => setKelurahanLoading(false))
  }

  const handleAddAddress = (values) => {
    saveAddress(values)
      .then((res) => {
        if (res?.error) {
          return message.error("Gagal menambahkan alamat")
        }
        message.success("Alamat berhasil ditambahkan")
        setIsAddingAddress(false)
        addressForm.resetFields()
        refetch()
      })
      .catch(() => message.error("Gagal menambahkan alamat"))
  }

  useEffect(() => {
    if (isAddingAddress) {
      getProvinsi()
    }
  }, [isAddingAddress])

  useEffect(() => {
    if (isModalOpen) {
      addressForm.setFieldsValue(getItem("userDataBe"))
      refetch()
    }
  }, [isModalOpen])

  useEffect(() => {
    if (user) {
      getKabupaten(user?.provinsi_id)
      getKecamatan(user?.kabupaten_id)
      getKelurahan(user?.kecamatan_id)
      addressForm.setFieldsValue(user)
    }
  }, [user])

  return (
    <>
      <Button
        className="text-gray-600 hover:bg-gray-700 mt-4 w-full"
        onClick={() => showModal()}
      >
        Lihat Detail
      </Button>
      {token && (
        <Button
          className="bg-white text-gray-600 mt-4 w-full disabled:bg-gray-400 border border-gray-600"
          onClick={() => {
            addCart({
              product_id: item.id,
              qty,
            })
              .then((res) => {
                message.success("Berhasil menambahkan ke keranjang")
              })
              .catch((err) => {
                message.error("Gagal menambahkan ke keranjang")
              })
          }}
          disabled={item.product_stock === 0}
        >
          <ShoppingCart size={16} />
          Add to Cart
        </Button>
      )}
      <Drawer
        title={
          <div>
            <div>{item.product_name}</div>
          </div>
        }
        open={isModalOpen}
        onClose={handleCancel}
        placement="bottom"
        height="90vh"
        className="rounded-t-[20px]"
      >
        <div>
          <img
            src={
              item.product_image_url ||
              "https://www.southernliving.com/thmb/_Msu9OCpvE-OUTRvfYxCIJyPbhE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/27196_AdaptiveCottage00006-2000-7702094217044ce4830a8adb0a69b6da.jpg"
            }
            alt=""
            className="h-50 w-full object-cover rounded-lg"
          />

          {/* detail */}
          <div className="mt-4">
            <div className="text-gray-600 font-bold text-lg">
              {item.product_price} π
            </div>
            <div className="">
              <p className="text-lg font-bold ">Deskripsi</p>
              <div
                className=" "
                dangerouslySetInnerHTML={{ __html: item.product_description }}
              ></div>
            </div>
          </div>
          {/* input qty */}

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <div className="mt-4 mb-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">Jumlah</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDecrement}
                    className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100"
                    disabled={qty <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{qty}</span>
                  <button
                    onClick={handleIncrement}
                    className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100"
                    disabled={qty >= item.product_stock}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 max-w-lg mx-auto">
              <Button
                type="primary"
                className="flex-1 text-gray-600  disabled:bg-gray-400"
                onClick={handleBuyNow}
                disabled={item.product_stock === 0}
              >
                {item.product_stock === 0 ? "Out of Stock" : "Buy Now"}
              </Button>
              {/* {token && ( */}
              <Button
                type="default"
                className="flex-1 border-gray-600 text-gray-600 hover:bg-gray-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400"
                onClick={() => {
                  addCart({
                    product_id: item.id,
                    qty,
                  })
                    .then((res) => {
                      message.success("Berhasil menambahkan ke keranjang")
                    })
                    .catch((err) => {
                      message.error("Gagal menambahkan ke keranjang")
                    })
                }}
                disabled={item.product_stock === 0}
              >
                <ShoppingCart size={16} />
                Add to Cart
              </Button>
              {/* )} */}
            </div>
          </div>
        </div>
      </Drawer>

      <Drawer
        title="Select Delivery Address"
        open={addressModal}
        onClose={() => setAddressModal(false)}
        placement="bottom"
        height="90vh"
        className="rounded-t-[20px]"
      >
        <div className="space-y-4">
          {!isAddingAddress ? (
            <>
              <Button
                type="dashed"
                icon={<Plus />}
                onClick={() => setIsAddingAddress(true)}
                className="w-full mb-4"
              >
                Add New Address
              </Button>
              {isLoadingAddress ? (
                <div className="text-center py-8 flex justify-center items-center">
                  <Spin />
                </div>
              ) : addresses.length > 0 ? (
                <div>
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 border rounded-lg hover:border-gray-600 cursor-pointer ${
                        selectedAddress === address.id ? "border-gray-600" : ""
                      }`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <div className="font-medium text-lg">{address.nama}</div>
                      <div className="text-gray-600">{address.telepon}</div>
                      <div className="mt-1 text-sm text-gray-600">
                        {address.alamat}, {address.kelurahan?.nama},{" "}
                        {address.kecamatan?.nama},{address.kabupaten?.nama},{" "}
                        {address.provinsi?.nama}
                        {address.kodepos && ` - ${address.kodepos}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No addresses found</p>
                  <Empty />
                </div>
              )}
            </>
          ) : (
            <Form
              form={addressForm}
              layout="vertical"
              onFinish={handleAddAddress}
              className="mt-4"
            >
              <Form.Item
                label="Nama Penerima"
                name="nama"
                rules={[
                  { required: true, message: "Nama penerima wajib diisi" },
                ]}
              >
                <Input placeholder="Masukkan nama penerima" />
              </Form.Item>

              <Form.Item
                label="Telepon/No. hp"
                name="telepon"
                rules={[
                  {
                    required: true,
                    message: "Telepon Tidak Boleh Kosong",
                  },
                ]}
              >
                <Input placeholder="Input Telepon/No. hp" />
              </Form.Item>

              <Form.Item
                label="Alamat"
                name="alamat"
                rules={[
                  {
                    required: true,
                    message: "Alamat Tidak Boleh Kosong",
                  },
                ]}
              >
                <Input placeholder="Input alamat" />
              </Form.Item>

              <Form.Item
                label="Provinsi"
                name="provinsi_id"
                rules={[
                  {
                    required: true,
                    message: "Provinsi Tidak Boleh Kosong",
                  },
                ]}
              >
                <Select
                  placeholder="Pilih Provinsi"
                  loading={provinsiLoading}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children?.toLowerCase() ?? "").includes(
                      input.toLowerCase()
                    )
                  }
                  onChange={(val) => getKabupaten(val)}
                >
                  {provinsiData &&
                    provinsiData.map((item) => (
                      <Select.Option key={item.pid} value={item.pid}>
                        {item.nama}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Kota/Kabupaten"
                name="kabupaten_id"
                rules={[
                  {
                    required: true,
                    message: "Kota/Kabupaten Tidak Boleh Kosong",
                  },
                ]}
              >
                <Select
                  placeholder="Pilih Kota/Kabupaten"
                  loading={kabupatenLoading}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children?.toLowerCase() ?? "").includes(
                      input.toLowerCase()
                    )
                  }
                  onChange={(val) => getKecamatan(val)}
                >
                  {kabupatenData &&
                    kabupatenData.map((item) => (
                      <Select.Option key={item.pid} value={item.pid}>
                        {item.nama}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Kecamatan"
                name="kecamatan_id"
                rules={[
                  {
                    required: true,
                    message: "Kecamatan Tidak Boleh Kosong",
                  },
                ]}
              >
                <Select
                  placeholder="Pilih Kecamatan"
                  loading={kecamatanLoading}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children?.toLowerCase() ?? "").includes(
                      input.toLowerCase()
                    )
                  }
                  onChange={(val) => getKelurahan(val)}
                >
                  {kecamatanData &&
                    kecamatanData.map((item) => (
                      <Select.Option key={item.pid} value={item.pid}>
                        {item.nama}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Kelurahan"
                name="kelurahan_id"
                rules={[
                  {
                    required: true,
                    message: "Kelurahan Tidak Boleh Kosong",
                  },
                ]}
              >
                <Select
                  placeholder="Pilih Kelurahan"
                  loading={kelurahanLoading}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children?.toLowerCase() ?? "").includes(
                      input.toLowerCase()
                    )
                  }
                >
                  {kelurahanData &&
                    kelurahanData.map((item) => (
                      <Select.Option key={item.pid} value={item.pid}>
                        {item.nama}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                <div className="flex gap-2">
                  <Button
                    block
                    onClick={() => {
                      setIsAddingAddress(false)
                      addressForm.resetFields()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="bg-blue-500"
                  >
                    Save Address
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </div>

        {!isAddingAddress && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <Button
              type="primary"
              className="bg-blue-500"
              block
              onClick={handleAddressSelected}
              disabled={!selectedAddress}
            >
              Continue to Shipping
            </Button>
          </div>
        )}
      </Drawer>

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
              <span>{item.product_price * qty} π</span>
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

          {shippingOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleShippingMethodChange(option)}
              className={`p-2 border rounded-lg hover:border-gray-600 w-full cursor-pointer ${
                shippingMethod === option.kode ? "border-gray-600" : ""
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="w-12 h-12 flex-shrink-0">
                  <img
                    src={option.logo}
                    alt={option.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs text-gray-600">
                    Estimated delivery: {option.estimasi_pengiriman}
                  </div>
                </div>
                <div className="flex-1 min-w-0"></div>
                <div>
                  <div className="text-gray-600 font-medium">
                    {option.biaya_pengiriman} π
                  </div>
                </div>
              </div>
            </div>
          ))}
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
    </>
  )
}

export const ModalPembayaran = ({
  isLogin = false,
  loading = false,
  isNew = false,
  user,
  onKlikOk,
  buttonOnly = false,
}) => {
  const dispatch = useDispatch()
  const { user: userData, token } = useSelector((state) => state.general)
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()
  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [provinsiData, setProvinsiData] = useState([])
  const [kabupatenData, setKabupatenData] = useState([])
  const [kecamatanData, setKecamatanData] = useState([])
  const [kelurahanData, setKelurahanData] = useState([])

  const [provinsiLoading, setProvinsiLoading] = useState(false)
  const [kabupatenLoading, setKabupatenLoading] = useState(false)
  const [kecamatanLoading, setKecamatanLoading] = useState(false)
  const [kelurahanLoading, setKelurahanLoading] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = (value) => {
    updateProfile({ ...userData, ...value })
      .then((res) => {
        if (res?.error) {
          return message.error("Profile Gagal Disimpan")
        }
        setIsModalOpen(false)
        message.success("Profile Berhasil Disimpan")
        dispatch(setUser({ ...userData, ...res?.data?.data }))
      })
      .catch((err) => {
        message.error("Profile Gagal Disimpan")
      })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const getProvinsi = () => {
    setProvinsiLoading(true)
    axios
      .get(`${BASE_URL}/api/address/master/provinsi`)
      .then((res) => {
        setProvinsiLoading(false)
        setProvinsiData(res.data.data)
      })
      .catch((err) => {
        setProvinsiLoading(false)
      })
  }

  const getKabupaten = (prov_id) => {
    setKabupatenLoading(true)
    axios
      .get(`${BASE_URL}/api/address/master/kabupaten/${prov_id}`)
      .then((res) => {
        setKabupatenLoading(false)
        setKabupatenData(res.data.data)
      })
      .catch((err) => {
        setKabupatenLoading(false)
      })
  }

  const getKecamatan = (kab_id) => {
    setKecamatanLoading(true)
    axios
      .get(`${BASE_URL}/api/address/master/kecamatan/${kab_id}`)
      .then((res) => {
        setKecamatanLoading(false)
        setKecamatanData(res.data.data)
      })
      .catch((err) => {
        setKecamatanLoading(false)
      })
  }

  const getKelurahan = (kec_id) => {
    setKelurahanLoading(true)
    axios
      .get(`${BASE_URL}/api/address/master/kelurahan/${kec_id}`)
      .then((res) => {
        setKelurahanLoading(false)
        setKelurahanData(res.data.data)
      })
      .catch((err) => {
        setKelurahanLoading(false)
      })
  }

  useEffect(() => {
    if (isNew) {
      showModal()
      form.setFieldsValue(getItem("userDataBe"))
    }
  }, [isNew])

  useEffect(() => {
    getProvinsi()
  }, [])

  useEffect(() => {
    if (user) {
      getKabupaten(user?.provinsi_id)
      getKecamatan(user?.kabupaten_id)
      getKelurahan(user?.kecamatan_id)
      form.setFieldsValue(user)
    }
  }, [user])

  return (
    <>
      {!isLogin ? (
        buttonOnly ? (
          <Button
            type="primary"
            className="bg-white text-gray-600"
            onClick={() => {
              if (loading) return null
              onKlikOk()
            }}
          >
            {loading ? <Spin className="text-gray-600" /> : "Login"}
          </Button>
        ) : (
          <div className="flex items-center justify-between border border-gray-800 rounded-lg mt-8 p-4">
            <p className="font-bold text-gray-800 text-md">
              Silahkan Login Terlebih Dahulu
            </p>
            <Button
              type="primary"
              className="text-gray-600"
              onClick={() => {
                if (loading) return null
                onKlikOk()
              }}
            >
              {loading ? <Spin className="text-gray-600" /> : "Login"}
            </Button>
          </div>
        )
      ) : buttonOnly ? (
        <Button
          type="primary"
          className="bg-white text-gray-600"
          onClick={() => {
            if (loading) return null
            onKlikOk()
          }}
        >
          {loading ? <Spin className="text-gray-600" /> : "Logout"}
        </Button>
      ) : (
        <div className="flex items-center justify-between border border-gray-800 rounded-lg mt-8 p-4">
          <p className="font-bold text-gray-800 text-md">
            {userData?.username}
          </p>
          <Button
            type="primary"
            className="bg-white text-gray-600"
            onClick={() => onKlikOk()}
          >
            Logout
          </Button>
        </div>
      )}

     // <Modal
      //  title={"Detail Pembelian"}
      //  open={isModalOpen}
      //  onOk={handleOk}
      //  onCancel={handleCancel}
      //  footer={null}
     // >
       // <div>
        //  <div className="mt-4">
         //   <span className="text-sm font-bold">Informasi Pengguna</span>
         //   <Form
            //  form={form}
           //   layout="vertical"
              // initialValues={user}
            //  className="mt-4"
           //   onFinish={(value) => handleOk(value)}
           // >
            //  <Form.Item label="Username" name={"username"}>
            //    <Input placeholder="Input username" readOnly />
            //  </Form.Item>
           //   <Form.Item
             //   label="Nama Lengkap"
              //  name={"name"}
              //  rules={[
               //   {
                //    required: true,
                //    message: "Nama Lengkap Tidak Boleh Kosong",
               //   },
              //  ]}
             // >
              //  <Input placeholder="Input Nama Lengkap" />
             // </Form.Item>
             // <Form.Item
               // label="Telepon/No. hp"
               // name={"telepon"}
               // rules={[
               //   {
               //     required: true,
               //     message: "Telepon Tidak Boleh Kosong",
              //    },
             //   ]}
            //  >
            //    <Input placeholder="Input Telepon/No. hp" />
             // </Form.Item>
             // <Form.Item
              //  label="Email"
             //   name={"email"}
              //  rules={[
              //    {
              //      required: true,
              //      message: "Email Tidak Boleh Kosong",
             //     },
            //    ]}
           //   >
             //   <Input placeholder="Input email" />
             // </Form.Item>
             // <Form.Item
              //  label="Alamat"
              //  name={"alamat"}
               // rules={[
               //   {
                //    required: true,
                 //   message: "Alamat Tidak Boleh Kosong",
              //    },
             //   ]}
           //   >
             //   <Input placeholder="Input alamat" />
            //  </Form.Item>
             // <Form.Item
              //  label="Provinsi"
              //  name={"provinsi_id"}
              //  rules={[
              //    {
                //    required: true,
               //     message: "Provinsi Tidak Boleh Kosong",
               //   },
              //  ]}
             // >
               // <Select
                //  placeholder="Pilih Provinsi"
                //  loading={provinsiLoading}
                //  showSearch
                 // optionFilterProp="children"
                  //filterOption={(input, option) =>
                  //  (option?.children?.toLowerCase() ?? "").includes(
                    //  input.toLowerCase()
                //    )
                //  }
                //  onChange={(val) => getKabupaten(val)}
               // >
                //  {provinsiData &&
                   // provinsiData.map((item) => (
                    //  <Select.Option key={item.pid} value={item.pid}>
                    //    {item.nama}
                  //    </Select.Option>
                //    ))}
             //   </Select>
            //  </Form.Item>
             // <Form.Item
              //  label="Kota/Kabupaten"
              //  name={"kabupaten_id"}
               // rules={[
                 // {
                  //  required: true,
                  //  message: "Kota/Kabupaten Tidak Boleh Kosong",
               //   },
              //  ]}
             // >
              //  <Select
               //   placeholder="Pilih Kota/Kabupaten"
               //   loading={kabupatenLoading}
               //   showSearch
              //    optionFilterProp="children"
                  //filterOption={(input, option) =>
                  //  (option?.children?.toLowerCase() ?? "").includes(
                   //   input.toLowerCase()
                  //  )
                //  }
                 // onChange={(val) => getKecamatan(val)}
              //  >
                //  {kabupatenData &&
                   // kabupatenData.map((item) => (
                   //   <Select.Option key={item.pid} value={item.pid}>
                    //    {item.nama}
                   //   </Select.Option>
                  //  ))}
              //  </Select>
             // </Form.Item>
             // <Form.Item
              //  label="Kecamatan"
               // name={"kecamatan_id"}
               // rules={[
                //  {
                //    required: true,
                //    message: "Kecamatan Tidak Boleh Kosong",
              //    },
            //    ]}
         //     >
               // <Select
                //  placeholder="Pilih Kecamatan"
                 // loading={kecamatanLoading}
                 // showSearch
                //  optionFilterProp="children"
                //  filterOption={(input, option) =>
                   // (option?.children?.toLowerCase() ?? "").includes(
                   //   input.toLowerCase()
                   // )
                 // }
                 // onChange={(val) => getKelurahan(val)}
                //>
                //  {kecamatanData &&
                  //  kecamatanData.map((item) => (
                  //    <Select.Option key={item.pid} value={item.pid}>
                  //      {item.nama}
                  //    </Select.Option>
               //     ))}
               // </Select>
            //  </Form.Item>
             // <Form.Item
              //  label="Kelurahan"
              //  name={"kelurahan_id"}
              //  rules={[
                //  {
                 //   required: true,
                 //   message: "Kelurahan Tidak Boleh Kosong",
                //  },
               // ]}
             // >
               // <Select
                 // placeholder="Pilih Kelurahan"
                 // loading={kelurahanLoading}
                 // showSearch
                 // optionFilterProp="children"
                 // filterOption={(input, option) =>
                   // (option?.children?.toLowerCase() ?? "").includes(
                  //    input.toLowerCase()
                  //  )
                //  }
              //  >
               //   {kelurahanData &&
                 //   kelurahanData.map((item) => (
                  //    <Select.Option key={item.pid} value={item.pid}>
                 //       {item.nama}
                 //     </Select.Option>
             //       ))}
            //    </Select>
          //    </Form.Item>
        //    </Form>
       //   </div>

        //  <Button
           // type="primary"
           // className="bg-blue-500 mt-4 w-full"
          //  onClick={() => form.submit()}
          //  loading={isLoading}
        //  >
         //   Simpan Profile
       //   </Button>
     //   </div>
     // </Modal>
  //  </>
  )
}

export default ProductItem
