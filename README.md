# Revelio

**Revelio** is a cryptographic infrastructure to reinvent how **opinion polls** are conducted—making them **private, verifiable, and censorship-resistant**.

Today, opinion polls suffer from:

* Lack of transparency
* No proof of voter eligibility
* Possibility of multiple submissions by the same user
* Manipulable or unverifiable results

Revelio fixes these issues by using:

* **Zero-Knowledge Proofs** (via zkPassport) to prove user eligibility
* **Homomorphic Encryption** (ElGamal) to ensure private vote aggregation
* **On-chain verification** to guarantee integrity and correctness

---

## 🌐 How It Works

1. **Access the Platform:**
   Users visit [https://revelio.substancelabs.xyz](https://revelio.substancelabs.xyz)

2. **Select an Opinion Poll:**
   Choose from a list of live polls.

3. **Prove Eligibility (zkPassport):**
   Using the zkPassport app, users generate a **zk-proof** of their eligibility (e.g. age > 18) or any custom criteria defined by the poll creator.

4. **Cast a Private Vote (Noir Circuit):**
   The `vote_caster` circuit:

   * Verifies the zkPassport proof
   * Encrypts the vote using ElGamal (homomorphic encryption)
   * Generates a ZK proof of correct encryption

5. **Submit the Vote (Relayer):**
   The relayer sends the encrypted vote + proof on-chain, improving UX by abstracting wallet interactions.

6. **Tally Votes On-Chain:**
   The contract aggregates encrypted votes homomorphically without decrypting them.

7. **Reveal Result:**
   Once the poll ends, the `vote_revealer` circuit is used to decrypt the aggregated ciphertext, revealing the final result **without revealing individual votes**.

---

## 📁 Monorepo Structure

```
revelio/
├── evm/        # Solidity contracts for poll creation, vote verification, and on-chain tallying
├── noir/       # Noir circuits for zkPassport proof validation, vote encryption, and vote decryption
├── relayer/    # Typescript relayer to submit transactions on behalf of users
└── ui/         # Frontend (React + Tailwind) platform for users to interact with the system
```

---

## 🚀 Goals

* Enable anonymous, one-person-one-vote polls
* Prevent Sybil attacks and double voting
* Increase trust in polling systems
* Provide cryptographic auditability without compromising privacy