pub fn decrypt(priv_key: Field, c1: Field, c2: Field) -> Field {
    let shared_secret = c1.pow_32(priv_key);
    let shared_secret_inv = 1 / shared_secret; // Inverso moltiplicativo
    let plaintext = c2 * shared_secret_inv;
    plaintext
}

pub fn discrete_log(plaintext: Field, g: Field, max: u32) -> u32 {
    let mut power = 1;
    let mut result = 0;
    for i in 0..=max {
        if (power == plaintext) {
            result = i;
        }
        power *= g;
    }
    result
}

pub fn encrypt(gen: Field, pub_key: Field, m: Field, r: Field) -> (Field, Field) {
    let c1 = gen.pow_32(r);
    let c2 = pub_key.pow_32(r) * gen.pow_32(m);
    (c1, c2)
}

pub fn aggregate(c1_1: Field, c2_1: Field, c1_2: Field, c2_2: Field) -> (Field, Field) {
    (c1_1 * c1_2, c2_1 * c2_2)
}
