import { ArrowLeftOutlined } from "@ant-design/icons"
import {
  Button,
  Form,
  Input,
  message,
  Select,
  Upload,
  Modal,
  Checkbox,
} from "antd"
import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from "../services/axiosInstance"
import { useDispatch, useSelector } from "react-redux"
import { setUser } from "../config/redux/reducer/generalReducer"
import { useSettings } from "../Context/SettingsContext"
import { createLog } from "../utils/helper"

function DaftarMitra() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user: userData, token } = useSelector((state) => state.general)
  const { settings } = useSettings()
  const [form] = Form.useForm()
  const isPending = userData?.mitra?.status === "pending"
  const isRejected = userData?.mitra?.status === "rejected"

  // const [provinsiData, setProvinsiData] = useState([])
  // const [kabupatenData, setKabupatenData] = useState([])
  // const [kecamatanData, setKecamatanData] = useState([])
  // const [kelurahanData, setKelurahanData] = useState([])

  // const [provinsiLoading, setProvinsiLoading] = useState(false)
  // const [kabupatenLoading, setKabupatenLoading] = useState(false)
  // const [kecamatanLoading, setKecamatanLoading] = useState(false)
  // const [kelurahanLoading, setKelurahanLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCategory, setLoadingCategory] = useState(false)
  const [listCategory, setListCategory] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)
  const [statementContent, setStatementContent] = useState("")

  console.log(settings, "settings")

  const generateStatement = (values) => {
    let template =
      settings?.statement_template ||
      `SURAT PERNYATAAN

Yang bertanda tangan:

Nama : {name}
Jabatan : Pemilik (Partnership)
Perusahaan : {shop_name}
Alamat : {address}

Dengan ini menyatakan bahwa Surat Keterangan informasi Produk yang keluarkan oleh saya dijamin untuk kualitas kehalalan dan kuantitas, saya menjamin sepenuhnya dan menjaga produk saya yang saya perjual belikan mengunakan platform BLJ FOR PI milik PT BERKAH KESTARI JAMBI dan siap mengikuti SOP PT BERKAH LESTARI JAMBI.

Kategori Produk: {category}

Demikian surat pernyataan ini buat dengan sebenarnya dan agar dapat dipergunakan mestinya

{date}

Yang Membuat Pernyataan


Materai 10.000


({name})`

    const selectedCategory = listCategory.find(
      (cat) => cat.id == values.category_id
    )

    const replacements = {
      "{name}": userData?.name || ".........................",
      "{shop_name}": values.shop_name || ".........................",
      "{address}": values.address || ".........................",
      "{category}":
        selectedCategory?.category_name || ".........................",
      "{date}": new Date().toLocaleDateString("id-ID"),
    }

    Object.keys(replacements).forEach((key) => {
      template = template.replace(new RegExp(key, "g"), replacements[key])
    })

    return template
  }

  const handleSubmit = (values) => {
    const statement = generateStatement(values)
    setStatementContent(statement)
    setIsModalVisible(true)
  }

  const handleFinalSubmit = () => {
    const values = form.getFieldsValue()
    setIsLoading(true)
    const formData = new FormData()
    formData.append("shop_name", values.shop_name)
    formData.append("category_id", values.category_id)
    formData.append("address", values.address)
    formData.append("ktp", values.ktp.file)
    formData.append("siup", values.siup.file)
    formData.append("mitra_logo", values.mitra_logo.file)
    if (userData?.mitra?.mitra_id) {
      formData.append("mitra_id", userData?.mitra?.mitra_id)
    }
    axiosInstance
      .post("/api/mitra/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        message.success("Pendaftaran Mitra Berhasil")
        dispatch(setUser({ ...userData, ...res?.data?.data }))
        navigate("/")
      })
      .catch((err) => {
        createLog({
          value: "Mitra Register Failed",
          body: JSON.stringify(err.response),
        })
        message.error("Pendaftaran Mitra Gagal")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const loadCategory = (url = "/api/product/category") => {
    setLoadingCategory(true)
    axiosInstance
      .get(`${url}`)
      .then((res) => {
        setLoadingCategory(false)
        setListCategory(res?.data?.data || [])
      })
      .catch((err) => setLoadingCategory(false))
  }

  useEffect(() => {
    loadCategory()
  }, [])

  useEffect(() => {
    if (isRejected) {
      form.setFieldsValue({
        shop_name: userData?.mitra?.shop_name,
        category_id: userData?.mitra?.category_id,
        address: userData?.mitra?.address,
      })
    }
  }, [isRejected, form, userData?.mitra])

  // Reuse the same address API calls
  // const getProvinsi = () => {
  //   setProvinsiLoading(true)
  //   axiosInstance
  //     .get("/api/address/master/provinsi")
  //     .then((res) => {
  //       setProvinsiData(res.data.data)
  //     })
  //     .catch((err) => {
  //       message.error("Gagal mengambil data provinsi")
  //     })
  //     .finally(() => {
  //       setProvinsiLoading(false)
  //     })
  // }

  // const getKabupaten = (prov_id) => {
  //   setKabupatenLoading(true)
  //   axiosInstance
  //     .get("/api/address/master/kabupaten/" + prov_id)
  //     .then((res) => {
  //       setKabupatenData(res.data.data)
  //     })
  //     .finally(() => {
  //       setKabupatenLoading(false)
  //     })
  // }

  // const getKecamatan = (kab_id) => {
  //   setKecamatanLoading(true)
  //   axiosInstance
  //     .get("/api/address/master/kecamatan/" + kab_id)
  //     .then((res) => {
  //       setKecamatanData(res.data.data)
  //     })
  //     .finally(() => {
  //       setKecamatanLoading(false)
  //     })
  // }

  // const getKelurahan = (kec_id) => {
  //   setKelurahanLoading(true)
  //   axiosInstance
  //     .get("/api/address/master/kelurahan/" + kec_id)
  //     .then((res) => {
  //       setKelurahanData(res.data.data)
  //     })
  //     .finally(() => {
  //       setKelurahanLoading(false)
  //     })
  // }

  // useEffect(() => {
  //   getProvinsi()
  // }, [])

  return (
    <div className="bg-white">
      <div className="px-4">
        <div className="border-b border-gray-200 py-4  sticky top-0 bg-white z-10">
          <Link to="/">
            <div className="flex items-center font-bold text-lg">
              <ArrowLeftOutlined className="text-gray-600" />
              <p className="ml-3 text-gray-600">Daftar Mitra</p>
            </div>
          </Link>
        </div>

        {isPending ? (
          <div className="p-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700">
                Pendaftaran Sedang Diproses
              </h3>
              <p className="text-blue-600 mt-2">
                Mohon tunggu, pendaftaran Anda sedang dalam proses verifikasi.
                Kami akan menghubungi Anda segera setelah proses verifikasi
                selesai.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {isRejected && (
              <div className="mb-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-700">
                    Pendaftaran Ditolak
                  </h3>
                  <p className="text-red-600 mt-2">
                    Catatan: {userData?.mitra?.note || "Tidak ada catatan"}
                  </p>
                </div>
              </div>
            )}
            <div className="mt-4">
              <span className="text-sm font-bold">Informasi Mitra</span>
              <Form
                form={form}
                layout="vertical"
                className="mt-4"
                onFinish={handleSubmit}
              >
                <Form.Item
                  label="Nama Toko/Usaha"
                  name="shop_name"
                  rules={[{ required: true, message: "Nama Toko Wajib Diisi" }]}
                >
                  <Input placeholder="Masukkan Nama Toko/Usaha" />
                </Form.Item>

                <Form.Item
                  label="Kategori Usaha"
                  name="category_id"
                  rules={[
                    { required: true, message: "Kategori Usaha Wajib Diisi" },
                  ]}
                >
                  <Select
                    placeholder="Pilih Kategori Usaha"
                    loading={loadingCategory}
                  >
                    {listCategory?.map((item) => (
                      <Select.Option key={item.id} value={`${item.id}`}>
                        {item.category_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* <Form.Item
                  label="No. Telepon"
                  name="phone"
                  rules={[{ required: true, message: "No. Telepon Wajib Diisi" }]}
                >
                  <Input placeholder="Masukkan No. Telepon" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Email Wajib Diisi" },
                    { type: "email", message: "Format Email Tidak Valid" },
                  ]}
                >
                  <Input placeholder="Masukkan Email" />
                </Form.Item> */}

                <Form.Item
                  label="Alamat Lengkap"
                  name="address"
                  rules={[{ required: true, message: "Alamat Wajib Diisi" }]}
                >
                  <Input.TextArea placeholder="Masukkan Alamat Lengkap" />
                </Form.Item>

                {/* Reuse the same address selection components */}
                {/* <Form.Item
                  label="Provinsi"
                  name="provinsi_id"
                  rules={[{ required: true, message: "Provinsi Wajib Dipilih" }]}
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
                    onChange={(val) => {
                      getKabupaten(val)
                      form.setFieldsValue({
                        kabupaten_id: undefined,
                        kecamatan_id: undefined,
                        kelurahan_id: undefined,
                      })
                    }}
                  >
                    {provinsiData?.map((item) => (
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
                    { required: true, message: "Kota/Kabupaten Wajib Dipilih" },
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
                    onChange={(val) => {
                      getKecamatan(val)
                      form.setFieldsValue({
                        kecamatan_id: undefined,
                        kelurahan_id: undefined,
                      })
                    }}
                  >
                    {kabupatenData?.map((item) => (
                      <Select.Option key={item.pid} value={item.pid}>
                        {item.nama}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Kecamatan"
                  name="kecamatan_id"
                  rules={[{ required: true, message: "Kecamatan Wajib Dipilih" }]}
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
                    onChange={(val) => {
                      getKelurahan(val)
                      form.setFieldsValue({
                        kelurahan_id: undefined,
                      })
                    }}
                  >
                    {kecamatanData?.map((item) => (
                      <Select.Option key={item.pid} value={item.pid}>
                        {item.nama}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Kelurahan"
                  name="kelurahan_id"
                  rules={[{ required: true, message: "Kelurahan Wajib Dipilih" }]}
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
                    {kelurahanData?.map((item) => (
                      <Select.Option key={item.pid} value={item.pid}>
                        {item.nama}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item> */}

                <Form.Item
                  label="Upload Logo Toko"
                  name="mitra_logo"
                  rules={[
                    { required: true, message: "Logo Toko Wajib Diupload" },
                  ]}
                  className="w-full"
                >
                  <Upload.Dragger
                    accept="image/*"
                    maxCount={1}
                    beforeUpload={() => false}
                    className="w-full"
                    listType="picture"
                  >
                    <p className="ant-upload-text">
                      Klik atau seret file ke area ini untuk upload
                    </p>
                    <p className="ant-upload-hint text-xs text-gray-400">
                      Format: JPG, PNG (Max: 2MB)
                    </p>
                  </Upload.Dragger>
                </Form.Item>

                <Form.Item
                  label="Upload KTP"
                  name="ktp"
                  rules={[{ required: true, message: "KTP Wajib Diupload" }]}
                  className="w-full"
                >
                  <Upload.Dragger
                    accept="image/*"
                    maxCount={1}
                    beforeUpload={() => false}
                    className="w-full"
                    listType="picture"
                  >
                    <p className="ant-upload-text">
                      Klik atau seret file ke area ini untuk upload
                    </p>
                    <p className="ant-upload-hint text-xs text-gray-400">
                      Format: JPG, PNG (Max: 2MB)
                    </p>
                  </Upload.Dragger>
                </Form.Item>

                <Form.Item
                  label="Upload SIUP/NIB"
                  name="siup"
                  rules={[
                    { required: true, message: "SIUP/NIB Wajib Diupload" },
                  ]}
                  className="w-full"
                >
                  <Upload.Dragger
                    accept="image/*,application/pdf"
                    maxCount={1}
                    beforeUpload={() => false}
                    className="w-full"
                    listType="picture"
                  >
                    <p className="ant-upload-text">
                      Klik atau seret file ke area ini untuk upload
                    </p>
                    <p className="ant-upload-hint text-xs text-gray-400">
                      Format: JPG, PNG, PDF (Max: 2MB)
                    </p>
                  </Upload.Dragger>
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-gray-100 text-white mt-4 w-full"
                  loading={isLoading}
                >
                  Lanjutkan Pendaftaran
                </Button>
              </Form>
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Surat Pernyataan"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Kembali
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={!isAgreed}
            onClick={handleFinalSubmit}
            loading={isLoading}
            className="bg-gray-100"
          >
            Daftar Mitra
          </Button>,
        ]}
        width={800}
      >
        <div
          className="space-y-4 text-gray-900 whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: statementContent }}
        />
        <div className="mt-4">
          <Checkbox
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          >
            Saya menyetujui semua ketentuan yang tertera pada surat pernyataan
            di atas
          </Checkbox>
        </div>
      </Modal>
    </div>
  )
}

export default DaftarMitra
