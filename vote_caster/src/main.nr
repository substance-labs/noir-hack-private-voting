mod elgamal;

use elgamal::{aggregate, encrypt};
use std::hash::poseidon2::Poseidon2;

fn main(
    gen: pub Field,
    pub_key: Field,
    pub_key_hash: pub Field,
    vote: Field,
    cyp_vote: Field,
    vote_randomness: Field,
    current_vote_sum: pub Field,
    current_vote_sum_randomness: pub Field,
    cyp_new_vote_sum: pub Field,
    new_vote_sum_randomness: pub Field,
) {
    assert(vote as u64 <= 1); // a vote can be 0 or 1
    assert(vote_randomness + current_vote_sum_randomness == new_vote_sum_randomness);

    let (d1, d2) = encrypt(gen, pub_key, vote, vote_randomness);
    let (e1, e2) = encrypt(gen, pub_key, current_vote_sum, current_vote_sum_randomness);
    let (added1, added2) = aggregate(d1, d2, e1, e2);

    assert(added1 == cyp_vote);
    assert(added2 == cyp_new_vote_sum);
    assert(Poseidon2::hash([pub_key], 1) == pub_key_hash);
}

#[test]
fn test_main() {
    let priv_key = 10; // TODO: understand why it fails with big numbers when calling gen.pow_32
    let gen = 2;
    let pub_key = gen.pow_32(priv_key);
    let pub_key_hash = Poseidon2::hash([pub_key], 1);

    let vote = 1;
    let vote_randomness = 200;

    let current_vote_sum = 1;
    let current_vote_sum_randomness = 100;

    let combined_msg = vote + current_vote_sum;
    let new_vote_sum_randomness = vote_randomness + current_vote_sum_randomness;
    let (cyp_vote, cyp_new_vote_sum) = encrypt(gen, pub_key, combined_msg, new_vote_sum_randomness);

    std::println(gen);
    std::println(pub_key);
    std::println(pub_key_hash);
    std::println(vote_randomness);
    std::println(vote);
    std::println(current_vote_sum_randomness);
    std::println(current_vote_sum);
    std::println(cyp_vote);
    std::println(cyp_new_vote_sum);
    std::println(new_vote_sum_randomness);

    // TODO: handle concurrency.
    main(
        gen,
        pub_key,
        pub_key_hash,
        vote,
        cyp_vote,
        vote_randomness,
        current_vote_sum,
        current_vote_sum_randomness,
        cyp_new_vote_sum,
        new_vote_sum_randomness,
    );
}
