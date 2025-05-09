# Revelio Audit Report Generator

This Python script fetches and decrypts on-chain voting data from Sepolia, fetches vote metadata from IPFS, and outputs a polished Markdown report suitable for export to PDF.

## Features

* Connects to Sepolia via a public RPC endpoint (`https://ethereum-sepolia-rpc.publicnode.com`).
* Queries the `getVote` method of a Revelio on-chain contract to retrieve encrypted vote data.
* Performs ElGamal decryption and a `log2` transform to derive human-readable vote counts.
* Fetches poll metadata (title, options, rules) from IPFS via `ipfs.io`.
* Generates a professional Markdown report:

  * Header with "Opinion Poll Report" branding.
  * Poll question and rules.
  * Results table with option names and vote counts.
  * Optional audit trail of cast transactions with timestamps and zk‑proof fingerprints.

## Requirements

* Python 3.8 or higher
* Dependencies (install via pip):

  ```bash
  pip install web3 eth-utils requests
  ```

## Usage

```bash
python3 revelio_audit.py <voteId> [--audit]
```

* `<voteId>`: Numeric identifier of the poll.
* `--audit`: Include a full on-chain audit trail section.

### Example

Generate a report for vote ID 0 without the audit trail:

```bash
python3 revelio_audit.py 0
```

Generate a report for vote ID 0 with audit trail:

```bash
python3 revelio_audit.py 0 --audit
```

## Export to PDF

You can pipe the Markdown output through Pandoc to generate a PDF. For example, to produce a PDF with 1 inch margins:

```bash
python3 revelio_audit.py 0 --audit | pandoc -o output.pdf -V geometry:margin=1in
```

This will produce `output.pdf`, ready for distribution or sale.

---

*Revelio: trusted, verifiable opinion polling on-chain.*
