import { createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"
import { useEffect, useState } from "react"

import settings from "../settings/index.js"
import revelioAbi from "../utils/abi/revelio.json"

export const useVotes = () => {
  const [votes, setVotes] = useState([])

  useEffect(() => {
    const fetchVotes = async () => {
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

        setVotes(
          votes.map((vote, id) => ({
            ...vote,
            id,
          })),
        )
      } catch (err) {
        console.error(err)
      }
    }

    fetchVotes()
  }, [])

  return votes
}
