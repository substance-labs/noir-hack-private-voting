mod elgamal;

use elgamal::{aggregate, decrypt, discrete_log, encrypt};
use std::hash::poseidon2::Poseidon2;

fn main(
    g: pub Field,
    pub_key: Field,
    pub_key_hash: pub Field,
    vote: Field,
    vote_randomness: Field,
    current_c1: pub Field,
    current_c2: pub Field,
    new_c1: pub Field,
    new_c2: pub Field,
) {
    assert(vote as u64 <= 1); // a vote can be 0 or 1

    let (d1, d2) = encrypt(g, pub_key, vote, vote_randomness);
    let (added1, added2) = aggregate(d1, d2, current_c1, current_c2);

    assert(added1 == new_c1);
    assert(added2 == new_c2);
    assert(Poseidon2::hash([pub_key], 1) == pub_key_hash);
}

#[test]
fn test_main() {
    let priv_key = 10; // TODO: understand why it fails with big numbers when calling g.pow_32
    let g = 2;
    let pub_key = g.pow_32(priv_key);
    let pub_key_hash = Poseidon2::hash([pub_key], 1);

    let vote = 1;
    let vote_randomness = 200;

    let initial_vote_sum = 0;
    let initial_vote_randomness = 0;
    let (current_c1, current_c2) = encrypt(g, pub_key, initial_vote_sum, initial_vote_randomness);

    let (d1, d2) = encrypt(g, pub_key, vote, vote_randomness);
    let (new_c1, new_c2) = aggregate(d1, d2, current_c1, current_c2);

    /*std::println(g);
    std::println(pub_key);
    std::println(pub_key_hash);
    std::println(vote);
    std::println(vote_randomness);
    std::println(current_c1);
    std::println(current_c2);
    std::println(new_c1);
    std::println(new_c2);*/

    // TODO: handle concurrency.
    main(
        g,
        pub_key,
        pub_key_hash,
        vote,
        vote_randomness,
        current_c1,
        current_c2,
        new_c1,
        new_c2,
    );

    let vote = 1;
    let vote_randomness = 201;
    let current_c1 = new_c1;
    let current_c2 = new_c2;
    let (d1, d2) = encrypt(g, pub_key, vote, vote_randomness);
    let (new_c1, new_c2) = aggregate(d1, d2, current_c1, current_c2);

    main(
        g,
        pub_key,
        pub_key_hash,
        vote,
        vote_randomness,
        current_c1,
        current_c2,
        new_c1,
        new_c2,
    );

    // Vote reveal
    let plaintext = decrypt(priv_key, new_c1, new_c2);
    let num_votes = 2;
    let sum_votes = discrete_log(plaintext, g, num_votes);
    assert(sum_votes == 2);
}
