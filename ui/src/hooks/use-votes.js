import { createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"
import { useCallback, useEffect, useState } from "react"
import moment from "moment"

import settings from "../settings/index.js"
import revelioAbi from "../utils/abi/revelio.json"

export const useVotes = () => {
  const [votes, setVotes] = useState([])

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

      const votes = await Promise.all(
        Array.from({ length: Number(totalNumberOfVotes) }, (_, voteId) =>
          client.readContract({
            abi: revelioAbi,
            address: settings.addresses.revelio,
            functionName: "getVote",
            args: [voteId],
          }),
        ),
      )

      const contents = await Promise.all(
        votes.map(async ({ ref }) => {
          const response = fetch(`${settings.ipfsGateway}/${ref.slice(7)}`) // remove ipfs://
          return await (await response).json()
        }),
      )

      const currentBlockNumber = await client.getBlockNumber()
      const currentTimestamp = moment().unix()

      const endsIn = await Promise.all(
        votes.map(({ endBlock }) =>
          moment.unix(currentTimestamp + parseInt(endBlock - currentBlockNumber) * 12).fromNow(),
        ),
      )

      setVotes(
        votes
          .map((vote, id) => ({
            ...vote,
            id,
            ...contents[id],
            endsIn: endsIn[id],
          }))
          .reverse(),
      )
    } catch (err) {
      console.error(err)
    }
  })

  useEffect(() => {
    fetchVotes()
  }, [])

  return { votes, fetchVotes }
}
