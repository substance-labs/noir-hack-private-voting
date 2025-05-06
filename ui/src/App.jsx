import React, { useCallback, useState } from "react"
import QRCode from "react-qr-code"
import { Slide, toast, ToastContainer } from "react-toastify"
import { motion } from "framer-motion"
import { Home } from "lucide-react"

import { getCastVoteProof, getZkPassportProof } from "./utils/vote"
import settings from "./settings"
import { useVotes } from "./hooks/use-votes"

import Modal from "./components/Modal"

const App = () => {
  const [url, setUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [vote, setVote] = useState(null)
  const [selectedVoteId, setSelectedVoteId] = useState(1)
  const votes = useVotes()

  const onVote = useCallback(async () => {
    try {
      const [zkPassportProof, castVoteProof] = await Promise.all([
        getZkPassportProof({
          voteId: selectedVoteId,
          onUrl: (url) => setUrl(url),
          onRequestReceived: () => {
            setUrl(null)
            setIsLoading(true)
          },
        }),
        getCastVoteProof({
          vote: vote === "yes" ? 1 : 0,
        }),
      ])
      console.log(zkPassportProof)
      console.log(castVoteProof)

      const { publicInputs, proof } = castVoteProof
      const c1 = publicInputs[2]
      const c2 = publicInputs[3]

      const { transactionHash } = await fetch(`${settings.apiUrl}/cast-vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteId: selectedVoteId, c1, c2, proof: "0x" + Buffer.from(proof).toString("hex") }),
      }).then((res) => res.json())
      console.log(transactionHash)

      toast.success("You succesfully voted!")
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedVoteId])

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 border-r border-white/10 backdrop-blur-md p-6 space-y-6 hidden md:flex flex-col">
        <div className="text-xl font-bold">🛡️ Private Voting</div>
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

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 pt-22 pl-4 pr-4">
          {votes.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="backdrop-blur-md bg-white/10 p-6 rounded-2xl border border-white/20 shadow-xl space-y-4"
            >
              <h2 className="text-xl font-semibold">{v.description}</h2>
              <div className="flex justify-center space-x-6 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedVoteId(v.id)
                    setVote("yes")
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition-all font-medium cursor-pointer
                    ${
                      vote === "yes" && selectedVoteId === v.id
                        ? "bg-cyan-500 shadow-md text-white"
                        : "bg-white/10 hover:bg-cyan-500/20 text-gray-200"
                    }`}
                >
                  YES
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedVoteId(v.id)
                    setVote("no")
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition-all font-medium cursor-pointer
                    ${
                      vote === "no" && selectedVoteId === v.id
                        ? "bg-purple-500 shadow-md text-white"
                        : "bg-white/10 hover:bg-purple-500/20 text-gray-200"
                    }`}
                >
                  NO
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onVote}
                disabled={selectedVoteId !== v.id || !vote}
                className="w-full mt-4 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer
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
