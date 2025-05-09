import { createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"
import { useCallback, useEffect } from "react"
import moment from "moment"

import settings from "../settings/index.js"
import revelioAbi from "../utils/abi/revelio.json"
import { useAppStore } from "../store.js"

export const useVotes = () => {
  const { votes, setVotes } = useAppStore()

  const fetchVotes = useCallback(async () => {
    try {
      const client = createPublicClient({
        chain: sepolia,
        transport: http(settings.rpc),
      })

      const totalNumberOfVotes = await client.readContract({
        abi: revelioAbi,
        address: settings.addresses.revelio,
        functionName: "numberOfVotes",
      })

      const newVotes = await Promise.all(
        Array.from({ length: Number(totalNumberOfVotes) }, (_, voteId) => {
          // NOTE: avoid reading from the contract an already stored vote
          const storedVote = votes[voteId]
          if (storedVote) {
            return {
              endBlock: BigInt(storedVote.endBlock),
              numberOfVotes: storedVote.numberOfVotes,
              ref: storedVote.ref,
            }
          }

          return client.readContract({
            abi: revelioAbi,
            address: settings.addresses.revelio,
            functionName: "getVote",
            args: [voteId],
          })
        }),
      )

      const contents = await Promise.all(
        newVotes.map(async ({ ref }, index) => {
          // NOTE: avoid fetching from ipfs an already stored content
          const storedVote = votes[index]
          if (storedVote) {
            return {
              title: storedVote.title,
              zkPassportData: storedVote.zkPassportData,
              options: storedVote.options,
            }
          }
          const response = fetch(`${settings.ipfsGateway}/${ref.slice(7)}`) // remove ipfs://
          return await (await response).json()
        }),
      )

      const currentBlockNumber = await client.getBlockNumber()
      const currentTimestamp = moment().unix()

      const endsIn = await Promise.all(
        newVotes.map(({ endBlock }) =>
          moment.unix(currentTimestamp + parseInt(endBlock - currentBlockNumber) * 12).fromNow(),
        ),
      )

      setVotes(
        newVotes
          .map((vote, id) => ({
            ref: vote.ref,
            endBlock: parseInt(vote.endBlock),
            numberOfVotes: parseInt(vote.numberOfVotes),
            id,
            ...contents[id],
            endsIn: endsIn[id],
          }))
          .reverse(),
      )
    } catch (err) {
      console.error(err)
    }
  }, [votes])

  useEffect(() => {
    fetchVotes()
  }, [])

  return { votes, fetchVotes }
}
