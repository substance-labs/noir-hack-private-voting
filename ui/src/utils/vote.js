import { UltraHonkBackend } from "@aztec/bb.js"
import { Noir } from "@noir-lang/noir_js"
import bigInt from "big-integer"
import { ZKPassport } from "@zkpassport/sdk"

import { encrypt } from "./elgamal.js"
import circuitJson from "./artifacts/vote-caster.json"

import initNoirC from "@noir-lang/noirc_abi"
import initACVM from "@noir-lang/acvm_js"
import acvm from "@noir-lang/acvm_js/web/acvm_js_bg.wasm?url"
import noirc from "@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url"
await Promise.all([initACVM(fetch(acvm)), initNoirC(fetch(noirc))])

export const getZkPassportProof = async ({ voteId, onUrl, onRequestReceived: _onRequestReceived }) => {
  const zkPassport = new ZKPassport()

  const queryBuilder = await zkPassport.request({
    name: "ZKPassport",
    logo: "https://zkpassport.id/logo.png",
    purpose: "Prove you are an adult from Italy",
    scope: voteId.toString(),
    devMode: true,
    mode: "fast",
  })

  const { url, requestId, onRequestReceived, onGeneratingProof, onProofGenerated, onResult, onReject, onError } =
    queryBuilder.gte("age", 18).in("nationality", ["Italy"]).done()

  onUrl(url)

  onRequestReceived(() => {
    _onRequestReceived()
    console.log("Request received")
  })

  onGeneratingProof(() => {
    console.log("Generating proof")
  })

  // NOTE: keep it disabled as mock passports are not supported yet
  /*const waitProofGenerated = () =>
    new Promise((resolve) => {
      onProofGenerated(resolve)
    })*/

  const waitResult = () =>
    new Promise((resolve) => {
      onResult(resolve)
    })

  // NOTE: keep it disabled as mock passports are not supported yet
  /*const waitError = () =>
    new Promise((_, reject) => {
      onError(reject)
    })*/

  const waitReject = () =>
    new Promise((_, reject) => {
      onReject(reject)
    })

  return Promise.race([Promise.all([, /*waitProofGenerated()*/ waitResult()]) /*, waitError()*/, waitReject()])
}

export const getCastVoteProof = async ({ vote }) => {
  const noir = new Noir(circuitJson)
  const backend = new UltraHonkBackend(circuitJson.bytecode, {
    threads: navigator.hardwareConcurrency,
  })

  const g = "0x02" // TODO
  const pubKey = "0x0400" // TODO
  const pubKeyHash = "0x22f162a4e96080597d7c32dffe2d6beee811fe65cbf4774850fd51d41550ca7e"
  const voteRandomness = vote.map(() => "0x" + bigInt.randBetween(0, 1000000).toString(16)) // TODO

  const expectedC1s = []
  const expectedC2s = []
  vote.forEach((v, index) => {
    const [c1, c2] = encrypt(bigInt(g), bigInt(pubKey), bigInt(v), bigInt(voteRandomness[index]))
    expectedC1s[index] = "0x" + c1.toString(16)
    expectedC2s[index] = "0x" + c2.toString(16)
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
  return await backend.generateProof(witness, { keccak: true })
}
