pub fn encrypt(gen: Field, pub_key: Field, m: Field, r: Field) -> (Field, Field) {
    let c1 = gen.pow_32(r);
    let c2 = pub_key.pow_32(r) * gen.pow_32(m);
    (c1, c2)
}

pub fn aggregate(c1_1: Field, c2_1: Field, c1_2: Field, c2_2: Field) -> (Field, Field) {
    (c1_1 * c1_2, c2_1 * c2_2)
}
