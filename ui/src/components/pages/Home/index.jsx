import React, { useCallback, useState } from "react"
import QRCode from "react-qr-code"
import { Slide, toast, ToastContainer } from "react-toastify"
import { motion } from "framer-motion"
import { BarChart3, CalendarDays, CheckCircle } from "lucide-react"
import { createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"

import { getCastVoteProof, getZkPassportProof } from "../../../utils/vote"
import settings from "../../../settings"
import { useVotes } from "../../../hooks/use-votes"
import { useAppStore } from "../../../store"

import Modal from "../../base/Modal"
import Sidebar from "../../base/Sidebar"
import Header from "../../base/Header"
// import DevModeAlert from "../../base/DevModeAlert"
import ColoredBadge from "../../base/ColoredBadge"
import { ruleToText } from "../../../utils/eligibility-criteria"
import Spinner from "../../base/Spinner"

const Home = () => {
  const [url, setUrl] = useState(null)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [votedSuccesfully, setVotedSuccesfully] = useState(false)
  const [selected, setSelected] = useState({})
  const { votes, fetchVotes } = useVotes()
  const { devMode } = useAppStore()

  const onVote = useCallback(async () => {
    try {
      const voteId = Object.keys(selected).at(0)
      const selectedVoteIndex = Object.values(selected).at(0)
      const selectedVote = votes[votes.length - voteId - 1] // because of votes.inverse()

      const nOptions = selectedVote.options.length
      const vote = Array.from({ length: nOptions }).fill(0)
      vote[selectedVoteIndex] = 1

      const [zkPassportProof, castVoteProof] = await Promise.all([
        getZkPassportProof({
          devMode,
          onGeneratingProof: () => {
            console.log("generating proof ...")
          },
          onRequestReceived: () => {
            console.log("request received")
            setUrl(null)
            setIsLoading(true)
            setLoadingMessage("Collecting your anonymized voting material ...")
          },
          onProofGenerated: () => {
            console.log("proof generated")
            setLoadingMessage("Material successfully collected. Submitting your vote ...")
          },
          onUrl: (url) => setUrl(url),
          purpose: selectedVote.zkPassportData.purpose,
          rules: selectedVote.zkPassportData.rules,
          voteId,
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

      const sleep = () =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve()
          }, 3000),
        )
      await sleep()

      setIsLoading(false)
      setLoadingMessage("")
      setVotedSuccesfully(true)
      setTimeout(() => {
        setVotedSuccesfully(false)
      }, 5000)

      const client = createPublicClient({
        chain: sepolia,
        transport: http(settings.rpc),
      })
      await client.waitForTransactionReceipt({ hash: transactionHash })
      fetchVotes()
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      toast.error(err)
    }
  }, [selected, votes, devMode, fetchVotes])

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header title={"Home"} />
        {/*votes.length > 0 && (
          <div className="pl-4 pr-4 mt-4">
            <DevModeAlert />
          </div>
        )*/}

        {votes.length === 0 && (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <Spinner text="Loading data .." />
          </div>
        )}

        {votes.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4">
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
                    <span className="inline">{v.title}</span>
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-400 mt-4 mb-2">
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
                <div className="border-t border-white/10 my-3" />
                <div className="flex flex-wrap gap-2 ">
                  {v?.zkPassportData?.rules?.map((rule) => {
                    const tooltipText = ruleToText(rule)
                    return (
                      tooltipText && (
                        <span key={`${v.id}-badge-${rule}`} className="relative group cursor-pointer">
                          <ColoredBadge label={rule} />
                          <div className="absolute left-1/2 top-full w-64 z-1000 -translate-x-1/2 rounded-md bg-gray-800 text-gray-100 text-xs p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            {tooltipText}
                          </div>
                        </span>
                      )
                    )
                  })}
                </div>
                <div className="border-t border-white/10 my-3" />
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
                      {option.replace("*", "")}
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
        )}

        {(url || isLoading || votedSuccesfully) && (
          <Modal
            onClose={() => {
              setUrl(null)
              setIsLoading(false)
              setVotedSuccesfully(false)
              setLoadingMessage("")
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-6 text-center"
            >
              {isLoading && !url && !votedSuccesfully && <Spinner text={loadingMessage} />}
              {!isLoading && url && !votedSuccesfully && (
                <>
                  <QRCode value={url} size={240} bgColor="transparent" fgColor="white" />
                  <p className="text-md text-gray-300 mt-4">
                    Scan this QR code to open the <span className="text-white font-semibold">zkPassport</span> app on
                    your phone, or click{" "}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline font-semibold"
                    >
                      here
                    </a>{" "}
                    instead.
                  </p>
                </>
              )}
              {!isLoading && !url && votedSuccesfully && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex flex-col items-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="bg-green-500/10 border border-green-500/20 text-green-300 p-4 rounded-full"
                  >
                    <CheckCircle className="w-8 h-8" />
                  </motion.div>
                  <p className="text-md mt-4 text-gray-200">You have voted successfully!</p>
                </motion.div>
              )}
            </motion.div>
          </Modal>
        )}
        <ToastContainer theme="dark" transition={Slide} autoClose={2000} hideProgressBar newestOnTop />
      </main>
    </div>
  )
}

export default Home
