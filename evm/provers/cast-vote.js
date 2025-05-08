import { UltraHonkBackend } from "@aztec/bb.js"
import { Noir } from "@noir-lang/noir_js"
import bigInt from "big-integer"
import fs from "fs"
import path from "path"
import { encodeAbiParameters } from "viem"
import { fileURLToPath } from "url"
import { aggregate, encrypt } from "./elgamal.js"

function splitIntoChunks(str, size = 32) {
  const chunks = []
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size))
  }
  return chunks
}

try {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const circuitPath = path.join(__dirname, "../../noir/vote_caster/target/vote_caster.json")
  const circuitJson = JSON.parse(fs.readFileSync(circuitPath, "utf8"))

  const noir = new Noir(circuitJson)
  const backend = new UltraHonkBackend(circuitJson.bytecode)

  const g = process.argv[2]
  const pubKey = process.argv[3]
  const pubKeyHash = process.argv[4]
  const vote = splitIntoChunks(process.argv[5].slice(2), 64).map((vote) => "0x" + vote)
  const voteRandomness = splitIntoChunks(process.argv[6].slice(2), 64).map((vote) => "0x" + vote)

  const expectedC1s = []
  const expectedC2s = []
  vote.forEach((v, index) => {
    const [c1, c2] = encrypt(bigInt(g), bigInt(pubKey), bigInt(v), bigInt(voteRandomness[index]))
    expectedC1s[index] = c1
    expectedC2s[index] = c2
  })

  const { witness } = await noir.execute({
    g,
    vote,
    vote_randomness: voteRandomness,
    pub_key: pubKey,
    pub_key_hash: pubKeyHash,
    expected_c1s: expectedC1s,
    expected_c2s: expectedC2s,
  })
  const { proof } = await backend.generateProof(witness, { keccak: true })

  const result = encodeAbiParameters(
    [{ type: "bytes32[]" }, { type: "bytes32[]" }, { type: "bytes" }],
    [
      expectedC1s.map((c1) => "0x" + c1.toString(16).padStart(64, "0")),
      expectedC2s.map((c2) => "0x" + c2.toString(16).padStart(64, "0")),
      "0x" + Buffer.from(proof).toString("hex"),
    ],
  )
  console.log(result)
} catch (err) {
  console.log("0x00")
} finally {
  process.exit(0)
}
