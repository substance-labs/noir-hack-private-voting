use elgamal::{aggregate, decrypt, discrete_log, encrypt, verify_discrete_log};

fn main(
    priv_key: Field,
    g: pub Field,
    c1s: pub [Field; 5],
    c2s: pub [Field; 5],
    vote_result: pub [u32; 5],
) {
    for i in 0..5 {
        let plaintext = decrypt(priv_key, c1s[i], c2s[i]);
        // NOTE: Computing the discrete logarithm inside the circuit is highly inefficient,
        // as it would require unrolling a massive loop during proving.
        // Instead, we compute the discrete log off-circuit and simply verify it within the circuit.
        verify_discrete_log(g, vote_result[i] as Field, plaintext);
    }
}

#[test]
fn test_main() {
    let priv_key = 10; // TODO: understand why it fails with big numbers when calling g.pow_32
    let g = 2;
    let pub_key = g.pow_32(priv_key);

    let vote = [0, 1, 0, 0, 0]; // multiple selection. In this case we vote for the option 2
    let vote_randomness = [200, 201, 202, 203, 204];
    let mut sum_c1s = [0, 0, 0, 0, 0];
    let mut sum_c2s = [0, 0, 0, 0, 0];

    for i in 0..5 {
        let (c1, c2) = encrypt(g, pub_key, vote[i], vote_randomness[i]);
        // first time no need to aggregate
        sum_c1s[i] = c1;
        sum_c2s[i] = c2;
    }

    let vote = [0, 1, 0, 0, 0];
    let vote_randomness = [200, 201, 202, 203, 204];
    for i in 0..5 {
        let (c1, c2) = encrypt(g, pub_key, vote[i], vote_randomness[i]);
        let (new_c1, new_c2) = aggregate(sum_c1s[i], sum_c2s[i], c1, c2);
        sum_c1s[i] = new_c1;
        sum_c2s[i] = new_c2;
    }

    let num_votes = 2;
    let mut vote_result: [u32; 5] = [0, 0, 0, 0, 0];

    // Vote reveal
    for i in 0..5 {
        let plaintext = decrypt(priv_key, sum_c1s[i], sum_c2s[i]);
        vote_result[i] = discrete_log(plaintext, g, num_votes);
    }
    assert(vote_result[0] == 0);
    assert(vote_result[1] == 2);
    assert(vote_result[2] == 0);
    assert(vote_result[3] == 0);
    assert(vote_result[4] == 0);

    std::println(priv_key);
    std::println(g);
    std::println(sum_c1s);
    std::println(sum_c2s);
    std::println(vote_result);

    main(priv_key, g, sum_c1s, sum_c2s, vote_result);
}
