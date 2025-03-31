import React from "react"
import { WrenchIcon, ClockIcon } from "lucide-react"

const MaintenancePage = ({ title, message }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <WrenchIcon className="w-16 h-16 text-gray-500 animate-spin-slow" />
            <ClockIcon className="w-8 h-8 text-gray-300 absolute -top-2 -right-2" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>

        <p className="text-gray-700 mb-6">{message}</p>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="font-semibold text-gray-700 mb-2">Estimasi Waktu</h2>
            <p className="text-gray-600">
              Sistem akan kembali normal dalam waktu 24 jam
            </p>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-md">
            <h2 className="font-semibold text-gray-700 mb-2">Butuh Bantuan?</h2>
            <p className="text-gray-600">
              Hubungi tim support kami
              {<a
                href="mailto:blj.jambi24@gmail.com"
                className="text-gray-500 hover:text-gray-600 underline"
              >
                blj.jambi24@gmail.com
              </a> }
            </p>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 hover:bg-gray-100 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    </div>
  )
}

export default MaintenancePage
