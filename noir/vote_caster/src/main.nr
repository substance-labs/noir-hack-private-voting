use elgamal::{encrypt};
use std::hash::poseidon2::Poseidon2;

// NOTE: This enforces the vote to have exactly 5 options. In the future, we will create additional circuits that support more options.
fn main(
    g: pub Field,
    pub_key: Field,
    pub_key_hash: pub Field,
    votes: [Field; 5],
    votes_randomness: [Field; 5],
    expected_c1s: pub [Field; 5],
    expected_c2s: pub [Field; 5],
) {
    let mut count_vote_one = 0;
    for i in 0..5 {
        let vote = votes[i];
        if vote == 1 {
            count_vote_one += 1;
        }
        if count_vote_one == 2 {
            assert(false);
        }

        assert(vote * (vote - 1) == 0); // a vote can be 0 or 1
        let (c1, c2) = encrypt(g, pub_key, vote, votes_randomness[i]);
        assert(c1 == expected_c1s[i]);
        assert(c2 == expected_c2s[i]);
    }
    if count_vote_one == 0 {
        assert(false);
    }

    // TODO: verify zkpassport proof

    assert(Poseidon2::hash([pub_key], 1) == pub_key_hash);
}

#[test]
fn test_main() {
    let priv_key = 10; // TODO: understand why it fails with big numbers when calling g.pow_32
    let g = 2;
    let pub_key = g.pow_32(priv_key);
    let pub_key_hash = Poseidon2::hash([pub_key], 1);

    let votes = [0, 1, 0, 0, 0]; // multiple selection. In this case we vote for the option 2
    let votes_randomness = [200, 201, 202, 203, 204];
    let mut expected_c1s = [0, 0, 0, 0, 0];
    let mut expected_c2s = [0, 0, 0, 0, 0];

    for i in 0..5 {
        let (c1, c2) = encrypt(g, pub_key, votes[i], votes_randomness[i]);
        expected_c1s[i] = c1;
        expected_c2s[i] = c2;
    }

    std::println(g);
    std::println(pub_key);
    std::println(pub_key_hash);
    std::println(votes);
    std::println(votes_randomness);
    std::println(expected_c1s);
    std::println(expected_c2s);

    main(
        g,
        pub_key,
        pub_key_hash,
        votes,
        votes_randomness,
        expected_c1s,
        expected_c2s,
    );
}
