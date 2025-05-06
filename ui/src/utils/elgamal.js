import bigInt from "big-integer"

// This is the value of the modulo used in Noir
const p = bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")

export const encrypt = (g, pubKey, m, r) => {
  const c1 = g.modPow(r, p)
  const c2 = pubKey.modPow(r, p).multiply(g.modPow(m, p)).mod(p)
  return [c1, c2]
}
