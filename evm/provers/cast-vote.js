import { UltraHonkBackend } from "@aztec/bb.js"
import { Noir } from "@noir-lang/noir_js"
import bigInt from "big-integer"
import fs from "fs"
import path from "path"
import { encodeAbiParameters } from "viem"
import { fileURLToPath } from "url"
import { aggregate, encrypt } from "./elgamal.js"

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
  const vote = process.argv[5]
  const voteRandomness = process.argv[6]
  const currentC1 = process.argv[7]
  const currentC2 = process.argv[8]

  // calculate new encrypted sum
  const [d1, d2] = encrypt(bigInt(g), bigInt(pubKey), bigInt(vote), bigInt(voteRandomness))
  const [newC1, newC2] = aggregate([
    { c1: bigInt(currentC1), c2: bigInt(currentC2) },
    { c1: d1, c2: d2 },
  ])

  const { witness } = await noir.execute({
    g,
    vote,
    vote_randomness: voteRandomness,
    pub_key: pubKey,
    pub_key_hash: pubKeyHash,
    current_c1: currentC1,
    current_c2: currentC2,
    new_c1: newC1,
    new_c2: newC2,
  })
  const { proof } = await backend.generateProof(witness, { keccak: true })

  const result = encodeAbiParameters(
    [{ type: "bytes32" }, { type: "bytes32" }, { type: "bytes" }],
    [
      "0x" + newC1.toString(16).padStart(64, "0"),
      "0x" + newC2.toString(16).padStart(64, "0"),
      "0x" + Buffer.from(proof).toString("hex"),
    ],
  )
  console.log(result)
} catch (err) {
  console.log("0x00")
} finally {
  process.exit(0)
}
