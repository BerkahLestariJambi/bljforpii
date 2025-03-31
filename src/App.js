import { ConfigProvider } from "antd"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import MaintenanceMode from "./components/MaintenancePage/MaintenanceMode"
import MetaTags from "./components/MetaTags"
import { SettingsProvider } from "./Context/SettingsContext"
import CartPage from "./Pages/Cart"
import CategoryPage from "./Pages/Category"
import CategoryDetail from "./Pages/CategoryDetail"
import HomePage from "./Pages/Home"
import PrivacyPolicy from "./Pages/PrivacyPolicy"
import ProfilePage from "./Pages/Profile"
import TermCondition from "./Pages/TermCondition"
import TransactionHistory from "./Pages/TransactionHistory"
import UpdateProfile from "./Pages/UpdateProfile"
import DaftarMitra from "./Pages/DaftarMitra"
import MallPage from "./Pages/Mall"
import StoreDetail from "./Pages/StoreDetail"
import AddressList from "./Pages/AddressList"
import Notification from "./Pages/Notification"

function App() {
  // const createLog = (body) => {
  //   axios
  //     .post("https://prodmainet.berkahlestarijaya.com/api/log/create", body)
  //     .then((res) => {
  //       console.log("ok")
  //     })
  // }

  // const loginBE = (body) => {
  //   axios
  //     .post("https://prodmainet.berkahlestarijaya.com/api/auth/login", body)
  //     .then((res) => {
  //       setItem("userDataBe", JSON.stringify(res.data?.data?.data?.user || {}))
  //     })
  //     .catch((err) => {})
  // }

  // const signIn = async () => {
  //   const scopes = ["username", "payments", "wallet_address"]
  //   const authResult = await window.Pi.authenticate(
  //     scopes,
  //     onIncompletePaymentFound,
  //     { forceNew: true }
  //   )
  //   createLog({ value: "Log Signin", body: JSON.stringify(authResult) })
  //   setItem("username", authResult?.user?.username || null)
  //   loginBE(authResult.user)
  // }

  // const onIncompletePaymentFound = (payment) => {
  //   createLog({
  //     value: "onIncompletePaymentFound",
  //     body: JSON.stringify(payment),
  //   })
  //   // return axiosClient.post('/payments/incomplete', {payment});
  // }

  // useEffect(() => {
  //   signIn()
  // }, [])

  const theme = {
    token: {
      colorPrimary: "#6B46C1", // Changed to gray
      colorLink: "#6B46C1", // Changed to gray
      colorSuccess: "#52C41A",
      colorWarning: "#FAAD14",
      colorError: "#FF4D4F",
      colorInfo: "#1677FF",
    },
    components: {
      Button: {
        colorPrimary: "#fff",
        algorithm: true,
        primaryColor: "#fff",
        defaultBg: "#6B46C1",
        primaryBg: "#6B46C1",
      },
      Input: {
        colorPrimary: "#6B46C1", // Changed to gray
        algorithm: true,
      },
      Menu: {
        colorPrimary: "#6B46C1", // Added for navigation
        algorithm: true,
      },
      Typography: {
        colorPrimary: "#6B46C1", // Added for text elements
        algorithm: true,
      },
      Pagination: {
        colorPrimary: "#6B46C1",
        colorText: "#000000", // Added for inactive pagination items
        algorithm: true,
        colorTextDisabled: "#000000",
        colorTextActive: "#6B46C1",
        colorTextHover: "#6B46C1",
        colorTextSelected: "#6B46C1",
      },
    },
  }

  return (
    <div className="max-w-lg mx-auto border-x h-screen">
      <SettingsProvider>
        <MetaTags />
        <MaintenanceMode>
          <ConfigProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/category" element={<CategoryPage />} />
                <Route path="/mall" element={<MallPage />} />
                <Route path="/notifications" element={<Notification />} />
                <Route
                  path="/category/:category_id"
                  element={<CategoryDetail />}
                />
                <Route path="/store/:mitra_id" element={<StoreDetail />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/update-profile" element={<UpdateProfile />} />
                <Route path="/address-list" element={<AddressList />} />
                <Route
                  path="/daftar-transaksi"
                  element={<TransactionHistory />}
                />
                <Route path="/daftar-mitra" element={<DaftarMitra />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermCondition />} />
              </Routes>
            </Router>
          </ConfigProvider>
        </MaintenanceMode>
      </SettingsProvider>
    </div>
  )
}

export default App
