import { createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"
import { useEffect, useState } from "react"

import settings from "../settings/index.js"
import privateVotingAbi from "../utils/abi/private-voting.json"

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
          abi: privateVotingAbi,
          address: settings.addresses.privateVoting,
          functionName: "numberOfVotes",
        })

        const votes = await Promise.all(
          Array.from({ length: Number(totalNumberOfVotes) }, (_, voteId) =>
            client.readContract({
              abi: privateVotingAbi,
              address: settings.addresses.privateVoting,
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
