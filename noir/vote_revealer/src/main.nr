use elgamal::{aggregate, decrypt, discrete_log, encrypt, verify_discrete_log};

fn main(priv_key: Field, g: pub Field, c1: pub Field, c2: pub Field, sum_votes: pub u32) {
    let plaintext = decrypt(priv_key, c1, c2);
    // NOTE: Computing the discrete logarithm inside the circuit is highly inefficient,
    // as it would require unrolling a massive loop during proving.
    // Instead, we compute the discrete log off-circuit and simply verify it within the circuit.
    verify_discrete_log(g, sum_votes as Field, plaintext);
}

#[test]
fn test_main() {
    let priv_key = 10; // TODO: understand why it fails with big numbers when calling g.pow_32
    let g = 2;
    let pub_key = g.pow_32(priv_key);

    let vote = 1;
    let vote_randomness = 200;

    let initial_vote_sum = 0;
    let initial_vote_randomness = 0;
    let (current_c1, current_c2) = encrypt(g, pub_key, initial_vote_sum, initial_vote_randomness);

    let (d1, d2) = encrypt(g, pub_key, vote, vote_randomness);
    let (new_c1, new_c2) = aggregate(d1, d2, current_c1, current_c2);

    let vote = 1;
    let vote_randomness = 201;
    let current_c1 = new_c1;
    let current_c2 = new_c2;
    let (d1, d2) = encrypt(g, pub_key, vote, vote_randomness);
    let (new_c1, new_c2) = aggregate(d1, d2, current_c1, current_c2);

    // Vote reveal
    let plaintext = decrypt(priv_key, new_c1, new_c2);
    let num_votes = 2;
    let sum_votes = discrete_log(plaintext, g, num_votes);
    assert(sum_votes == 2);

    std::println(priv_key);
    std::println(g);
    std::println(new_c1);
    std::println(new_c2);
    std::println(sum_votes);

    main(priv_key, g, new_c1, new_c2, sum_votes)
}