import React, { useCallback, useState } from "react"
import QRCode from "react-qr-code"
import { Slide, ToastContainer } from "react-toastify"
import { X } from "lucide-react"
import { getCastVoteProof, getZkPassportProof } from "./utils/vote"
import Modal from "./components/Modal"

const App = () => {
  const [url, setUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [vote, setVote] = useState(null)

  const onVote = useCallback(async () => {
    try {
      const [zkPassportProof, castVoteProof] = await Promise.all([
        getZkPassportProof({
          voteId: 0,
          onUrl: (url) => setUrl(url),
          onRequestReceived: () => {
            setUrl(null)
            setIsLoading(true)
          },
        }),
        getCastVoteProof({
          vote: vote === "yes" ? 1 : 0,
          voteId: 0,
        }),
      ])
      console.log(zkPassportProof)
      console.log(castVoteProof)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans p-6 space-y-8">
      <div className="backdrop-blur-md bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-wide mb-6">🛡️ Private Voting</h1>
        <p className="text-gray-400 mb-8">Are you in favor of bla bla bla?</p>

        <div className="flex justify-center space-x-6 mb-8">
          <button
            onClick={() => setVote("yes")}
            className={`px-6 py-3 rounded-full text-lg transition cursor-pointer
          ${vote === "yes" ? "bg-cyan-500 shadow-cyan-500/50 shadow-lg" : "bg-white/10 hover:bg-cyan-500/20"}`}
          >
            YES
          </button>
          <button
            onClick={() => setVote("no")}
            className={`px-6 py-3 rounded-full text-lg transition cursor-pointer
          ${vote === "no" ? "bg-purple-500 shadow-purple-500/50 shadow-lg" : "bg-white/10 hover:bg-purple-500/20"}`}
          >
            NO
          </button>
        </div>

        <button
          onClick={onVote}
          className="px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg
      bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90
      disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          disabled={!vote}
        >
          Vote
        </button>
      </div>

      {(url || isLoading) && (
        <Modal onClose={() => setUrl(null)}>
          {isLoading ? (
            <div>waiting ...</div>
          ) : (
            <div>
              <QRCode value={url} size={220} bgColor="transparent" fgColor="white" />
              <p className="text-sm text-gray-300 mt-2">
                Scan this QR code to open the <span className="text-white font-medium">zkPassport</span> app on your
                phone.
              </p>
            </div>
          )}
        </Modal>
      )}

      <ToastContainer theme="dark" transition={Slide} autoClose={2000} hideProgressBar newestOnTop />
    </div>
  )
}

export default App
