import { ArrowLeftOutlined } from "@ant-design/icons"
import { Empty, Pagination, Spin, Button, Drawer } from "antd"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  useGetListTransactionMutation,
  useUpdateTransactionStatusMutation,
} from "../config/redux/services/apiService"
import { maskString } from "../utils/helper"

function TransactionHistory() {
  // const dispatch = useDispatch()
  // const navigate = useNavigate()
  const [getListTransaction, { isLoading }] = useGetListTransactionMutation()
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [updateStatus] = useUpdateTransactionStatusMutation()

  const [transactions, setTransactionLists] = useState([])
  const [total, setTotal] = useState(0)
  // const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const loadProduct = (perpage = 20, params = { page: currentPage }) => {
    getListTransaction({
      perpage,
      ...params,
    })
      .then((res) => {
        setTotal(res?.data?.data?.total)
        setCurrentPage(res?.data?.data?.current_page)
        setTransactionLists(res?.data?.data?.data || [])
      })
      .catch((err) => {})
  }

  // const handleChangeSearch = () => {
  //   loadProduct(20, { search })
  // }

  const handleChange = (page, pageSize = 20) => {
    loadProduct(pageSize, {
      page,
    })
  }

  const handleShowDetail = (transaction) => {
    setSelectedTransaction(transaction)
    setIsModalVisible(true)
  }

  const handleMarkAsReceived = async (id) => {
    try {
      await updateStatus({ id, status_delivery: "delivered" })
      loadProduct() // Reload the list after update
      setIsModalVisible(false)
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  useEffect(() => {
    loadProduct()
  }, [])
  console.log(selectedTransaction, "selectedTransaction")
  return (
    <div className="bg-burple-600">
      <div className="p-4 border-b border-white sticky top-0 bg-gray-100">
        <Link to="/profile">
          <div className="flex items-center font-bold text-lg">
            <ArrowLeftOutlined className="text-gray-600" />
            <p className="ml-3 text-gray-600">Daftar Transaksi</p>
          </div>
        </Link>
      </div>

      <div className="my-8 px-4">
        {transactions && transactions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => handleShowDetail(transaction)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <p className="text-gray-600 text-sm">ID Transaksi</p>
                      <p className="font-mono font-medium">
                        {transaction.identifier}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          transaction.status === "complete"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-gray-600 text-sm">Tanggal</p>
                      <p className="font-medium">
                        {new Date(transaction.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Jumlah</p>
                      <p className="font-bold text-gray-600 text-lg">
                        {transaction.amount} &#960;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[80vh] flex items-center justify-center">
            {isLoading ? (
              <Spin />
            ) : (
              <Empty description="Tidak ada transaksi disini" />
            )}
          </div>
        )}

        <Drawer
          title="Detail Transaksi"
          open={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          placement="bottom"
          height="90vh"
          className="rounded-t-[20px]"
        >
          {selectedTransaction && (
            <div className="space-y-6 pb-24">
              {/* Transaction Info */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Informasi Transaksi</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">ID Transaksi</p>
                    <p className="font-mono">
                      {selectedTransaction.identifier}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal</p>
                    <p>
                      {new Date(
                        selectedTransaction.created_at
                      ).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Status</p>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        selectedTransaction.status === "complete"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </div>
                  {selectedTransaction.awb && (
                    <div>
                      <p className="text-sm text-gray-500">Nomor Resi</p>
                      <p>{selectedTransaction.awb}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Detail Produk</h3>
                {selectedTransaction.items_product?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center mb-2"
                  >
                    <div>
                      <p className="font-medium">{item.nama}</p>
                      <p className="text-sm text-gray-500">
                        {item.qty} x {item.price} &#960;
                      </p>
                    </div>
                    <p className="font-semibold">{item.subtotal} &#960;</p>
                  </div>
                ))}
                <div className="mt-4 text-right">
                  <p className="text-sm text-gray-500">Total Pembayaran</p>
                  <p className="font-semibold text-lg">
                    {selectedTransaction.amount} &#960;
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-3">Alamat Pengiriman</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    {selectedTransaction.address_user?.nama}
                  </p>
                  <p className="text-sm">
                    {selectedTransaction.address_user?.telepon}
                  </p>
                  <p className="text-sm mt-2">
                    {selectedTransaction.address_user?.alamat},
                    {selectedTransaction.address_user?.kelurahan_id},
                    {selectedTransaction.address_user?.kecamatan_id},
                    {selectedTransaction.address_user?.kabupaten_id},
                    {selectedTransaction.address_user?.provinsi_id}
                    {selectedTransaction.address_user?.kodepos &&
                      ` - ${selectedTransaction.address_user.kodepos}`}
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Informasi Pembayaran</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Metode Pembayaran</p>
                    <p>{selectedTransaction.network}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Wallet Address</p>
                    <p className="font-mono text-sm break-all">
                      {selectedTransaction.to_address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fixed bottom button */}
              {selectedTransaction?.awb &&
                selectedTransaction?.status_delivery === "on-delivery" && (
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                    <Button
                      type="primary"
                      block
                      onClick={() =>
                        handleMarkAsReceived(selectedTransaction.id)
                      }
                      className="bg-gray-100 hover:bg-gray-700"
                    >
                      Tandai Sudah Diterima
                    </Button>
                  </div>
                )}
            </div>
          )}
        </Drawer>

        {total > 25 && (
          <div className="mt-6 w-full mx-auto text-center pb-8">
            <Pagination
              align="center"
              current={currentPage}
              total={total}
              pageSize={25}
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .rounded-t-[20px] .ant-drawer-content {
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
        }
      `}</style>
    </div>
  )
}

export default TransactionHistory
