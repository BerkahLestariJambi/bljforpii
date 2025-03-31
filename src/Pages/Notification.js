import { ArrowLeftOutlined } from "@ant-design/icons"
import { Empty, Spin } from "antd"
import React, { useEffect } from "react"
import { Link } from "react-router-dom"
import {
  useGetNotificationQuery,
  useReadNotificationMutation,
} from "../config/redux/services/apiService"

function Notification() {
  const { data: notifications, isLoading, refetch } = useGetNotificationQuery()
  const [markAsRead] = useReadNotificationMutation()

  const handleReadNotification = async (id) => {
    try {
      await markAsRead({ id })
      refetch() // Refresh the notifications list
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="p-4 border-b border-white sticky top-0 bg-gray-100 z-10">
        <Link to="/profile">
          <div className="flex items-center font-bold text-lg">
            <ArrowLeftOutlined className="text-gray-600" />
            <p className="ml-3 text-gray-600">Notifikasi</p>
          </div>
        </Link>
      </div>

      <div className="my-8 px-4">
        {notifications?.data?.length > 0 ? (
          notifications.data.map((notification) => (
            <div
              key={notification.id}
              className={`mb-4 rounded-lg shadow-lg transition-all duration-300 ${
                notification.read_at
                  ? "bg-gray-100 opacity-75"
                  : "bg-white cursor-pointer transform hover:scale-[1.02]"
              }`}
              onClick={() =>
                !notification.read_at && handleReadNotification(notification.id)
              }
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          notification.type === "success"
                            ? "bg-green-100 text-green-800"
                            : notification.type === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : notification.type === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {notification.type}
                      </span>
                      {/* <h3 className="font-semibold text-lg text-gray-800">
                        {notification.data}
                      </h3> */}
                    </div>
                    <p className="text-gray-600 mt-2">{notification.message}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(notification.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  {!notification.read_at && (
                    <div className="w-3 h-3 rounded-full bg-gray-100 mt-2" />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-[80vh] flex items-center justify-center">
            {isLoading ? (
              <Spin size="large" />
            ) : (
              <Empty
                description={
                  <span className="text-white">
                    Tidak ada notifikasi saat ini
                  </span>
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notification
