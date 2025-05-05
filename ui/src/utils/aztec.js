import { getDeployedTestAccountsWallets } from "@aztec/accounts/testing"
import { createAztecNodeClient, createPXEClient } from "@aztec/aztec.js"

const PXE_URL = "http://localhost:8080"

export const registerAztecContracts = async () => {
  console.log("registering aztec contracts ...")
  const wallet = await getAztecWallet()
}

export const registerContract = async (address, { wallet, artifact }) => {
  const node = await createAztecNodeClient(PXE_URL)
  const contractInstance = await node.getContract(address)
  await wallet.registerContract({
    instance: contractInstance,
    artifact,
  })
}

export const getPxe = () => {
  return createPXEClient(PXE_URL)
}

export const getAztecWallet = async () => {
  const pxe = createPXEClient(PXE_URL)
  const wallet = (await getDeployedTestAccountsWallets(pxe))[0]
  return wallet
}
