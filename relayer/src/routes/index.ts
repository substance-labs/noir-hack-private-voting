import { createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"

import privateVotingAbi from "../abi/private-voting.json"
import settings from "../settings"

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

export interface CastVoteBody {
  c1: string
  c2: string
  proof: string
  voteId: string
}

async function castVote(fastify: FastifyInstance, req: FastifyRequest<{ Body: CastVoteBody }>, reply: FastifyReply) {
  const { voteId, c1, c2, proof } = req.body

  const client = createWalletClient({
    account: privateKeyToAccount(process.env.PK as `0x${string}`),
    chain: sepolia,
    transport: http(settings.rpc),
  })

  const transactionHash = await client.writeContract({
    address: settings.addresses.privateVoting as `0x${string}`,
    abi: privateVotingAbi,
    functionName: "castVote",
    args: [voteId, c1, c2, proof],
  })

  return {
    transactionHash,
  }
}

function handler(fastify: FastifyInstance) {
  fastify.post("/cast-vote", (req, reply) => castVote(fastify, req as FastifyRequest<{ Body: CastVoteBody }>, reply))
}

export default handler
