import {
  ArrowLeftOutlined,
  PlusOutlined,
  MoreOutlined,
} from "@ant-design/icons"
import {
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  message,
  Dropdown,
  Drawer,
} from "antd"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  useDeleteAddressMutation,
  useGetAddressQuery,
  useSaveAddressMutation,
} from "../config/redux/services/apiService"
import axiosInstance from "../services/axiosInstance"

function AddressList() {
  const { data: addressData, isLoading, refetch } = useGetAddressQuery()
  const [saveAddress] = useSaveAddressMutation()
  const [deleteAddress] = useDeleteAddressMutation()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [form] = Form.useForm()
  console.log(addressData, "addressData")
  // State for address form
  const [provinsiData, setProvinsiData] = useState([])
  const [kabupatenData, setKabupatenData] = useState([])
  const [kecamatanData, setKecamatanData] = useState([])
  const [kelurahanData, setKelurahanData] = useState([])

  const [provinsiLoading, setProvinsiLoading] = useState(false)
  const [kabupatenLoading, setKabupatenLoading] = useState(false)
  const [kecamatanLoading, setKecamatanLoading] = useState(false)
  const [kelurahanLoading, setKelurahanLoading] = useState(false)

  const addresses = addressData?.data || []

  const handleAddAddress = (values) => {
    const action = saveAddress
    action(isEditing ? { ...values, id: selectedAddress.id } : values)
      .then((res) => {
        if (res?.error) {
          return message.error(
            isEditing ? "Gagal mengubah alamat" : "Gagal menambahkan alamat"
          )
        }
        message.success(
          isEditing ? "Alamat berhasil diubah" : "Alamat berhasil ditambahkan"
        )
        setIsModalVisible(false)
        setIsEditing(false)
        setSelectedAddress(null)
        form.resetFields()
        refetch()
      })
      .catch((err) => {
        message.error(
          isEditing ? "Gagal mengubah alamat" : "Gagal menambahkan alamat"
        )
      })
  }

  const handleEdit = (address) => {
    setIsEditing(true)
    setSelectedAddress(address)
    setIsModalVisible(true)
    form.setFieldsValue({
      nama: address.nama,
      telepon: address.telepon,
      alamat: address.alamat,
      provinsi_id: address.provinsi?.pid,
      kabupaten_id: address.kabupaten?.pid,
      kecamatan_id: address.kecamatan?.pid,
      kelurahan_id: address.kelurahan?.pid,
      kodepos: address.kodepos,
    })
    // Load dependent dropdowns
    getKabupaten(address.provinsi?.pid)
    getKecamatan(address.kabupaten?.pid)
    getKelurahan(address.kecamatan?.pid)
  }

  const handleDelete = (addressId) => {
    Modal.confirm({
      title: "Hapus Alamat",
      content: "Apakah Anda yakin ingin menghapus alamat ini?",
      okText: "Ya",
      cancelText: "Tidak",
      okButtonProps: { className: "bg-red-600" },
      onOk: () => {
        deleteAddress({ id: addressId })
          .then(() => {
            message.success("Alamat berhasil dihapus")
            refetch()
          })
          .catch(() => {
            message.error("Gagal menghapus alamat")
          })
      },
    })
  }

  // Address form handlers
  const getProvinsi = () => {
    setProvinsiLoading(true)
    axiosInstance
      .get("/api/address/master/provinsi")
      .then((res) => {
        setProvinsiLoading(false)
        setProvinsiData(res.data.data)
      })
      .catch(() => {
        setProvinsiLoading(false)
      })
  }

  const getKabupaten = (prov_id) => {
    setKabupatenLoading(true)
    axiosInstance
      .get("/api/address/master/kabupaten/" + prov_id)
      .then((res) => {
        setKabupatenLoading(false)
        setKabupatenData(res.data.data)
      })
      .catch(() => {
        setKabupatenLoading(false)
      })
  }

  const getKecamatan = (kab_id) => {
    setKecamatanLoading(true)
    axiosInstance
      .get("/api/address/master/kecamatan/" + kab_id)
      .then((res) => {
        setKecamatanLoading(false)
        setKecamatanData(res.data.data)
      })
      .catch(() => {
        setKecamatanLoading(false)
      })
  }

  const getKelurahan = (kec_id) => {
    setKelurahanLoading(true)
    axiosInstance
      .get("/api/address/master/kelurahan/" + kec_id)
      .then((res) => {
        setKelurahanLoading(false)
        setKelurahanData(res.data.data)
      })
      .catch(() => {
        setKelurahanLoading(false)
      })
  }

  useEffect(() => {
    getProvinsi()
  }, [])

  return (
    <div className="bg-white min-h-screen">
      <div className="p-4 border-b sticky top-0 bg-white">
        <Link to="/profile">
          <div className="flex items-center font-bold text-lg">
            <ArrowLeftOutlined className="text-gray-600" />
            <p className="ml-3 text-gray-600">Daftar Alamat</p>
          </div>
        </Link>
      </div>

      <div className="p-4">
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="w-full mb-4"
        >
          Tambah Alamat Baru
        </Button>

        {isLoading ? (
          <div className="flex justify-center">
            <Spin />
          </div>
        ) : addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address.id}
              className="border rounded-lg p-4 mb-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{address.nama}</h3>
                  <p className="text-sm text-gray-600">{address.telepon}</p>
                  <p className="text-sm mt-2">
                    {address.alamat}, {address.kelurahan?.nama},{" "}
                    {address.kecamatan?.nama}, {address.kabupaten?.nama},{" "}
                    {address.provinsi?.nama}
                    {address.kodepos && ` - ${address.kodepos}`}
                  </p>
                </div>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "edit",
                        label: "Edit",
                        onClick: () => handleEdit(address),
                      },
                      {
                        key: "delete",
                        label: "Hapus",
                        danger: true,
                        onClick: () => handleDelete(address.id),
                      },
                    ],
                  }}
                  placement="bottomRight"
                >
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              </div>
            </div>
          ))
        ) : (
          <Empty description="Belum ada alamat tersimpan" />
        )}
      </div>

      <Drawer
        title={isEditing ? "Edit Alamat" : "Tambah Alamat Baru"}
        open={isModalVisible}
        onClose={() => {
          setIsModalVisible(false)
          setIsEditing(false)
          setSelectedAddress(null)
          form.resetFields()
        }}
        placement="bottom"
        height="90vh"
        className="rounded-t-[20px]"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddAddress}
          className="mt-4"
        >
          <Form.Item
            label="Nama Penerima"
            name="nama"
            rules={[{ required: true, message: "Nama penerima wajib diisi" }]}
          >
            <Input placeholder="Masukkan nama penerima" />
          </Form.Item>

          <Form.Item
            label="Nomor Telepon"
            name="telepon"
            rules={[{ required: true, message: "Nomor telepon wajib diisi" }]}
          >
            <Input placeholder="Masukkan nomor telepon" />
          </Form.Item>

          <Form.Item
            label="Alamat Lengkap"
            name="alamat"
            rules={[{ required: true, message: "Alamat wajib diisi" }]}
          >
            <Input.TextArea placeholder="Masukkan alamat lengkap" rows={3} />
          </Form.Item>

          {/* Provinsi */}
          <Form.Item
            label="Provinsi"
            name="provinsi_id"
            rules={[{ required: true, message: "Provinsi wajib dipilih" }]}
          >
            <Select
              placeholder="Pilih Provinsi"
              loading={provinsiLoading}
              showSearch
              optionFilterProp="children"
              onChange={(val) => getKabupaten(val)}
            >
              {provinsiData.map((item) => (
                <Select.Option key={item.pid} value={item.pid}>
                  {item.nama}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Kabupaten */}
          <Form.Item
            label="Kota/Kabupaten"
            name="kabupaten_id"
            rules={[
              { required: true, message: "Kota/Kabupaten wajib dipilih" },
            ]}
          >
            <Select
              placeholder="Pilih Kota/Kabupaten"
              loading={kabupatenLoading}
              showSearch
              optionFilterProp="children"
              onChange={(val) => getKecamatan(val)}
            >
              {kabupatenData.map((item) => (
                <Select.Option key={item.pid} value={item.pid}>
                  {item.nama}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Kecamatan */}
          <Form.Item
            label="Kecamatan"
            name="kecamatan_id"
            rules={[{ required: true, message: "Kecamatan wajib dipilih" }]}
          >
            <Select
              placeholder="Pilih Kecamatan"
              loading={kecamatanLoading}
              showSearch
              optionFilterProp="children"
              onChange={(val) => getKelurahan(val)}
            >
              {kecamatanData.map((item) => (
                <Select.Option key={item.pid} value={item.pid}>
                  {item.nama}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Kelurahan */}
          <Form.Item
            label="Kelurahan"
            name="kelurahan_id"
            rules={[{ required: true, message: "Kelurahan wajib dipilih" }]}
          >
            <Select
              placeholder="Pilih Kelurahan"
              loading={kelurahanLoading}
              showSearch
              optionFilterProp="children"
            >
              {kelurahanData.map((item) => (
                <Select.Option key={item.pid} value={item.pid}>
                  {item.nama}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Kode Pos" name="kodepos">
            <Input placeholder="Masukkan kode pos" />
          </Form.Item>

          <Form.Item className="mb-0 fixed bottom-0 left-0 right-0 bg-white p-4">
            <Button
              type="primary"
              htmlType="submit"
              className="bg-gray-100 w-full"
            >
              Simpan Alamat
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}

export default AddressList
