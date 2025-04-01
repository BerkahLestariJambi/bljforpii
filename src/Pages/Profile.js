import {
  AppstoreOutlined,
  HomeOutlined,
  RightCircleOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { message } from "antd"
import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { ModalPembayaran } from "../components/ProductItem"
import { setToken, setUser } from "../config/redux/reducer/generalReducer"
import { useLoginMutation } from "../config/redux/services/apiService"
import { useSettings } from "../Context/SettingsContext"
import { BASE_URL } from "../utils/constants"
import {
  createLog,
  fetchWalletAddress,
  onIncompletePaymentFound,
  removeItem,
  setItem,
} from "../utils/helper"

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [loadingAuth, setLoadingAuth] = useState(false)
  const { user: userData } = useSelector((state) => state.general)

  const [login] = useLoginMutation()
  const loginBE = (body) => {
    setLoadingAuth(true)
    login(body)
      .then(({ error, data }) => {
        if (error) {
          setLoadingAuth(false)
          message.error("Login Gagal")
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
    // const authResult = { user: { username: "s9t9munah" } }
    setLoadingAuth(false)
    if (authResult) {
      loginBE(authResult?.user)
      createLog({ value: "Log Signin", body: JSON.stringify(authResult) })
      setItem("username", authResult?.user?.username || null)
      await fetchWalletAddress(authResult.accessToken)
    }
  }
  return (
    <div className="bg-gray-100 flex-1">
      <div className="p-4 sticky top-0 bg-gray-100">
        <div className="text-center font-bold text-lg">
          <img
            src={settings?.logo || require("../assets/img/logo.jpeg")}
            alt=""
            className="w-12 h-12 rounded-full mx-auto"
          />
          <p className="ml-3 text-gray-800">
            {settings?.app_name || "Berkah Lestari Jambi"}
          </p>
        </div>

        {/* <ModalPembayaran
          isLogin={userData ? true : false}
          user={userData}
          isNew={userData?.profile_complete == 0}
          // loading={loadingAuth}
          onKlikOk={() => {
            if (userData) {
              removeItem("access_token")
              removeItem("userDataBe")
              dispatch(setToken(null))
              return dispatch(setUser(null))
            }
          }}
        /> */}
      </div>
      <div className=" bg-gray-100 flex-1 h-screen">
        <div className="px-4 mt-16 ">
          {/* item update card profile */}
          {userData && (
            <>
              <Link to="/update-profile">
                <div className="mt-8 flex items-center justify-between border border-gray-800 rounded-lg p-4 shadow-lg">
                  <p className="text-gray-800">Ubah Profil</p>
                  <span>
                    <RightCircleOutlined className="text-gray-800" />
                  </span>
                </div>
              </Link>

              <Link to="/address-list">
                <div className="mt-4 flex items-center justify-between border border-gray-800 rounded-lg p-4 shadow-lg">
                  <p className="text-gray-800">Daftar Alamat</p>
                </div>
              </Link>

              {/* item transaction history */}
              <Link to="/daftar-transaksi">
                <div className="mt-4 flex items-center justify-between border border-gray-800 rounded-lg p-4 shadow-lg">
                  <p className="text-gray-800">Daftar Transaksi</p>
                  <span>
                    <RightCircleOutlined className="text-gray-800" />
                  </span>
                </div>
              </Link>
              <Link
                to={
                  userData?.is_mitra
                    ? `${BASE_URL}/login-mitra?username=${userData?.username}`
                    : "/daftar-mitra"
                }
              >
                <div className="mt-4 flex items-center justify-between border border-gray-800 rounded-lg p-4 shadow-lg">
                  <p className="text-gray-800">
                    {userData?.is_mitra ? "Dashboard Mitra" : "Daftar Mitra"}
                  </p>
                  <span>
                    <RightCircleOutlined className="text-gray-800" />
                  </span>
                </div>
              </Link>
            </>
          )}

          {/* <Link to="/privacy-policy">
            <div className="mt-4 flex items-center justify-between border border-gray-800 rounded-lg p-4 shadow-lg">
              <p className="text-gray-800">Kebijakan Privasi</p>
              <span>
                <RightCircleOutlined className="text-gray-800" />
              </span>
            </div>
          </Link>

          <Link to="/terms">
            <div className="mt-4 flex items-center justify-between border border-gray-800 rounded-lg p-4 shadow-lg">
              <p className="text-gray-800">Syarat dan Ketentuan</p>
              <span>
                <RightCircleOutlined className="text-gray-800" />
              </span>
            </div>
          </Link> */}
        </div>
      </div>

      <div class="max-w-lg mx-auto fixed bottom-0 left-0 right-0 bg-gray-100 shadow">
        <div className="p-4 mb-8">
          <ModalPembayaran
            isLogin={userData ? true : false}
            user={userData}
            isNew={userData?.profile_complete == 0}
            loading={loadingAuth}
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
          <div className="flex items-center justify-center space-x-3 text-center mt-2">
            <a href="/privacy-policy">Kebijakan Privasi</a>
            <a href="/terms">Syarat dan ketentuan</a>
          </div>
        </div>
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
              <AppstoreOutlined />
            </span>
            <br />
            <span class="text-sm ">Mall</span>
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
          {/* <Link
            to="/cart"
            className="flex-1 text-center py-3 hover:bg-gray-100"
          >
            <span>
              <ShoppingCartOutlined />
            </span>
            <br />
            <span className="text-sm">Cart</span>
          </Link> */}
          <Link
            to="/profile"
            className="flex-1 text-center py-3 hover:bg-gray-100"
          >
            <span>
              <UserOutlined className="text-gray-800" />
            </span>
            <br />
            <span className="text-sm text-gray-800">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
