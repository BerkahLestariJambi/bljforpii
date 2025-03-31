import axios from "axios"
import Cookies from "js-cookie"
import { BASE_URL } from "./constants"
export const getItem = (key) => {
  const item = Cookies.get(key)
  if (typeof item === "undefined") {
    return null
  }
  try {
    return JSON.parse(item)
  } catch (error) {
    if (typeof item === "undefined") {
      return null
    }

    return item
  }
}

export const setItem = (key, value) => {
  return Cookies.set(key, value)
}

export const removeItem = (key) => {
  return Cookies.remove(key)
}

const config = {
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
}

export const createLog = (body) => {
  axios.post(`${BASE_URL}/api/log/create`, body).then((res) => {
    console.log("ok")
  })
}

export const onReadyForServerApproval = (paymentId) => {
  console.log("onReadyForServerApproval", paymentId)
  createLog({
    value: "onReadyForServerApproval",
    body: JSON.stringify({ paymentId }),
  })
  axios
    .post(`${BASE_URL}/api/payments/approve`, { paymentId }, config)
    .catch((err) => alert(JSON.stringify(err.response)))
}

export const onReadyForServerCompletion = (paymentId, txid) => {
  console.log("onReadyForServerCompletion", paymentId, txid)
  createLog({
    value: "onReadyForServerCompletion",
    body: JSON.stringify({ paymentId, txid }),
  })
  // axiosClient.post('/payments/complete', {paymentId, txid}, config);
  axios.post(`${BASE_URL}/api/payments/complete`, { paymentId, txid }, config)
}

export const onCancel = (paymentId) => {
  console.log("onCancel", paymentId)
  createLog({
    value: "onCancel",
    body: JSON.stringify({ paymentId }),
  })
  axios.post(`${BASE_URL}/api/payments/cancel`, { paymentId }, config)
}

export const onError = (error, payment = null) => {
  console.log("onError", error)
  if (payment) {
    console.log(payment)
    createLog({
      value: "onError",
      body: JSON.stringify(payment),
    })
    // handle the error accordingly
  }
}

export const onIncompletePaymentFound = (payment) => {
  createLog({
    value: "onIncompletePaymentFound",
    body: JSON.stringify(payment),
  })
  // return axiosClient.post('/payments/incomplete', {payment});
}

export const fetchWalletAddress = async (token) => {
  try {
    // Using Pi SDK to get wallet address
    const walletResponse = await fetch(
      "https://api.minepi.com/v2/accounts/current/balance",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    const walletData = await walletResponse.json()
    createLog({
      value: "fetchWalletAddressBalance2",
      body: JSON.stringify(walletData),
    })

    if (walletData && walletData.address) {
      setItem("wallet_address", walletData.address)
      // Now fetch balance with the address
      await fetchBalance(walletData.address, token)
    } else {
      throw new Error("Wallet address not found in response")
    }
  } catch (error) {
    createLog({
      value: "fetchWalletAddressError",
      body: JSON.stringify(error),
    })
    console.error("Wallet error:", error)
  }
}

// Fetch wallet balance
export const fetchBalance = async (address, accessToken) => {
  try {
    // Using Pi Platform API to fetch balance
    // Note: You may need to use the Pi Blockchain API with proper authentication
    const response = await fetch(
      `https://api.minepi.com/v2/accounts/${address}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.status}`)
    }

    const data = await response.json()
    createLog({
      value: "fetchBalance",
      body: JSON.stringify(data),
    })

    // The actual balance property might differ based on the Pi API response structure
    if (data && data.balance) {
      setItem("balance", data.balance)
    } else if (data && data.spendable_balance) {
      setItem("balance", data.spendable_balance)
    } else {
      setItem("balance", "Balance information unavailable")
    }
  } catch (error) {
    createLog({
      value: "fetchBalance",
      body: JSON.stringify(error),
    })
    console.error("Balance error:", error)
  }
}

export function maskString(str) {
  if (!str) {
    return ""
  }

  if (str.length < 4) {
    return str
  }

  return str.substring(0, 4) + "..." + str.substring(str.length - 4)
}
