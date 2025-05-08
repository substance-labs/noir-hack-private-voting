import React, { useCallback, useState } from "react"
import QRCode from "react-qr-code"
import { Slide, toast, ToastContainer } from "react-toastify"
import { motion } from "framer-motion"
import { BarChart3, CalendarDays, Home, Info } from "lucide-react"
import { createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"

import { getCastVoteProof, getZkPassportProof } from "./utils/vote"
import settings from "./settings"
import { useVotes } from "./hooks/use-votes"

import Modal from "./components/Modal"

const App = () => {
  const [url, setUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState({})
  const { votes, fetchVotes } = useVotes()

  const onVote = useCallback(async () => {
    try {
      const voteId = Object.keys(selected).at(0)
      const selectedVoteIndex = Object.values(selected).at(0)
      const selectedVote = votes[voteId]

      const nOptions = selectedVote.options.length
      const vote = Array.from({ length: nOptions }).fill(0)
      vote[selectedVoteIndex] = 1

      const [zkPassportProof, castVoteProof] = await Promise.all([
        getZkPassportProof({
          voteId,
          onUrl: (url) => setUrl(url),
          purpose: selectedVote.zkPassportData.purpose,
          rules: selectedVote.zkPassportData.rules,
          onRequestReceived: () => {
            setUrl(null)
            setIsLoading(true)
          },
        }),
        getCastVoteProof({
          vote,
        }),
      ])

      const { publicInputs, proof } = castVoteProof
      const c1s = publicInputs.slice(2, 2 + nOptions)
      const c2s = publicInputs.slice(2 + nOptions, 2 + nOptions * 2)

      const { transactionHash } = await fetch(`${settings.apiUrl}/cast-vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteId, c1s, c2s, proof: "0x" + Buffer.from(proof).toString("hex") }),
      }).then((res) => res.json())
      console.log(transactionHash)

      toast.success("You succesfully voted!")
      setIsLoading(false)

      const client = createPublicClient({
        chain: sepolia,
        transport: http(settings.rpc),
      })
      await client.waitForTransactionReceipt({ hash: transactionHash })
      fetchVotes()
    } catch (err) {
      console.error(err)
      setIsLoading(false)
    }
  }, [selected, votes, fetchVotes])

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 border-r border-white/10 backdrop-blur-md p-6 space-y-6 hidden md:flex flex-col">
        <div className="text-xl font-bold">🛡️ Revelio</div>
        <nav className="flex flex-col space-y-4">
          <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto space-y-10 w-full">
        <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-6 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-sm z-50 md:ml-64">
          <div className="flex">
            <Home className="w-5 h-5" />
            <span className="text-white ml-2">Home</span>
          </div>
        </header>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pt-22 pl-4 pr-4">
          {votes.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="backdrop-blur-md bg-white/10 p-6 rounded-2xl border border-white/20 shadow-xl"
            >
              <div className="mb-4 text-white">
                <h2 className="text-xl font-semibold leading-snug">
                  <span className="inline">
                    {v.title}
                    {v?.zkPassportData?.purpose && (
                      <span className="relative ml-2 group cursor-pointer">
                        <Info size={16} className="inline text-gray-400 hover:text-white" />
                        <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 rounded-md bg-gray-800 text-gray-100 text-xs p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          {v.zkPassportData.purpose}
                        </div>
                      </span>
                    )}
                  </span>
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-400 mt-2 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span className="truncate">Ends: {v.endsIn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  <span>
                    {v.numberOfVotes} vote{v.numberOfVotes === 1n ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="pt-2 y-gap-2 flex flex-col space-y-3">
                {v.options.map((option, index) => (
                  <motion.button
                    key={v.id + option}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelected({
                        [v.id]: index,
                      })
                    }}
                    className={`px-4 py-2 rounded-full text-sm transition-all font-medium cursor-pointer
                      ${
                        selected[v.id] === index
                          ? "bg-cyan-500 shadow-md text-white"
                          : "bg-white/10 hover:bg-cyan-500/20 text-gray-200"
                      }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onVote}
                disabled={selected[v.id] === undefined}
                className="w-full mt-6 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer
                  bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90
                  disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 shadow"
              >
                Vote
              </motion.button>
            </motion.div>
          ))}
        </div>

        {(url || isLoading) && (
          <Modal onClose={() => setUrl(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-6 text-center"
            >
              {isLoading ? (
                <p className="text-white">Waiting for proof generation...</p>
              ) : (
                <>
                  <QRCode value={url} size={220} bgColor="transparent" fgColor="white" />
                  <p className="text-sm text-gray-300 mt-4">
                    Scan this QR code to open the <span className="text-white font-semibold">zkPassport</span> app on
                    your phone.
                  </p>
                </>
              )}
            </motion.div>
          </Modal>
        )}

        <ToastContainer theme="dark" transition={Slide} autoClose={2000} hideProgressBar newestOnTop />
      </main>
    </div>
  )
}

export default App
