#!/usr/bin/env python3
import os
import sys
import argparse
import json
import requests
import hashlib
import math
from datetime import datetime, timezone
from web3 import Web3
from eth_utils import to_checksum_address

# ----- Configuration -----
RPC_URL = os.getenv(
    "SEPOLIA_RPC_URL",
    "https://ethereum-sepolia-rpc.publicnode.com"
)
CONTRACT_ADDRESS = to_checksum_address(
    "0x196cdECf226b87fF0C9a9405A6aF8826D0219aB3"
)
TOPIC0 = "0x94b9b209597b37568a0fb4b924237e6e679e8e7bb88cf375dbcf4229c2d5e642"

# ABI fragments
GETVOTE_ABI = {
    "inputs": [{"internalType": "uint256", "name": "voteId", "type": "uint256"}],
    "name": "getVote",
    "outputs": [{"components":[
        {"internalType":"uint256","name":"endBlock","type":"uint256"},
        {"internalType":"uint256","name":"minQuorum","type":"uint256"},
        {"internalType":"uint256","name":"numberOfVotes","type":"uint256"},
        {"internalType":"uint256[]","name":"c1s","type":"uint256[]"},
        {"internalType":"uint256[]","name":"c2s","type":"uint256[]"},
        {"internalType":"uint256[]","name":"result","type":"uint256[]"},
        {"internalType":"string","name":"ref","type":"string"},
        {"internalType":"uint8","name":"state","type":"uint8"}
    ],"internalType":"struct IRevelio.Vote","name":"","type":"tuple"}],
    "stateMutability": "view",
    "type": "function"
}
CASTVOTE_ABI = {
    "inputs": [
        {"internalType": "uint256","name": "voteId","type": "uint256"},
        {"internalType": "uint256[]","name": "c1s","type": "uint256[]"},
        {"internalType": "uint256[]","name": "c2s","type": "uint256[]"},
        {"internalType": "bytes","name": "proof","type": "bytes"}
    ],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}

# ElGamal parameters
P = 21888242871839275222246405745257275088548364400416034343698204186575808495617
SECRET_KEY = 10

def elgamal_decrypt(c1: int, c2: int, x: int, p: int) -> int:
    """Standard ElGamal decryption: m = c2 * inv(c1^x mod p) mod p"""
    s = pow(c1, x, p)
    inv_s = pow(s, p - 2, p)
    return (c2 * inv_s) % p

# Helper: pad uint256 as 32-byte topic
def pad_uint256_topic(n: int) -> str:
    return "0x" + n.to_bytes(32, byteorder="big").hex()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Revelio on-chain vote report generator"
    )
    parser.add_argument("voteId", type=int, help="ID of the vote to report on")
    parser.add_argument(
        "--audit", action="store_true",
        help="Include full audit trail of cast transactions"
    )
    args = parser.parse_args()
    vote_id = args.voteId

    # Connect to Sepolia
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():
        print(f"❌ Could not connect to RPC at {RPC_URL}")
        sys.exit(1)

    # Prepare contract
    contract = w3.eth.contract(
        address=CONTRACT_ADDRESS,
        abi=[GETVOTE_ABI, CASTVOTE_ABI]
    )

    # Fetch on-chain vote struct
    try:
        vote = contract.functions.getVote(vote_id).call()
    except Exception as e:
        print(f"❌ getVote failed: {e}")
        sys.exit(1)

    # Unpack vote tuple: (endBlock, minQuorum, numberOfVotes, c1s, c2s, result, ref, state)
    c1s = vote[3]
    c2s = vote[4]
    ref = vote[6]

    # Decrypt votes and apply log2 transform
    decrypted = [
        int(math.log2(elgamal_decrypt(c1, c2, SECRET_KEY, P)))
        for c1, c2 in zip(c1s, c2s)
    ]

    # Fetch metadata from IPFS
    if ref.startswith("ipfs://"):
        cid = ref.split("ipfs://", 1)[1]
        url = f"https://ipfs.io/ipfs/{cid}"
    else:
        url = ref
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        metadata = resp.json()
    except Exception as e:
        print(f"❌ Failed to fetch metadata at {url}: {e}")
        sys.exit(1)

    title = metadata.get("title", "<no title>")
    options = metadata.get("options", [])
    rules = metadata.get("zkPassportData", {}).get("rules", [])

    # --- Markdown Report ---
    print("# Opinion Poll Report")
    print("*Created by Revelio*\n")
    print(f"## Question: {title}\n")

    if rules:
        print("## Rules")
        for rule in rules:
            print(f"- {rule}")
        print()

    print("## Results")
    print("| Option | Votes |")
    print("|---|---|")
    for idx, count in enumerate(decrypted):
        name = options[idx] if idx < len(options) else f"Option {idx}"
        print(f"| {name} | {count} |")
    print()  

    if args.audit:
        print("## Audit Trail")
        topic1 = pad_uint256_topic(vote_id)
        start_block = 8_250_000
        latest = w3.eth.block_number
        chunk = 50_000
        logs = []
        for st in range(start_block, latest + 1, chunk):
            en = min(st + chunk - 1, latest)
            try:
                logs.extend(
                    w3.eth.get_logs({
                        "fromBlock": st,
                        "toBlock": en,
                        "address": CONTRACT_ADDRESS,
                        "topics": [TOPIC0, topic1]
                    })
                )
            except Exception:
                pass
        logs.sort(key=lambda L: (L["blockNumber"], L["transactionIndex"]))

        for L in logs:
            txh_full = L["transactionHash"].hex()
            txh = txh_full[2:18]  # first 8 bytes, no 0x
            blk = w3.eth.get_block(L["blockNumber"])
            ts = datetime.fromtimestamp(blk["timestamp"], timezone.utc)
            tx = w3.eth.get_transaction(txh_full)
            _, params = contract.decode_function_input(tx.input)
            proof = params.get("proof", b"")
            fp = hashlib.sha256(proof).digest()[:8].hex()
            print(f"- [{ts.strftime('%Y-%m-%d %H:%M:%S UTC')}] tx {txh} | zkp fingerprint {fp}")
        print()