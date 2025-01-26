/*
git clone https://www.bearssl.org/git/BearSSL
cd BearSSL
make
cd ../C
emcc -I ../BearSSL/src -I ../BearSSL/inc -c ../BearSSL/src/hash/sha2big.c -o sha2.o
emcc -I ../BearSSL/src -I ../BearSSL/inc -c bearssl_sha256.c -o bearssl_sha256.o
emcc sha2.o bearssl_sha256.o -o bearssl_sha256.js -sEXPORTED_FUNCTIONS=_SHA256
*/
#include "bearssl.h"
void SHA256(const uint8_t *input, size_t input_len, uint8_t *output){
    br_sha256_context ctx;
    br_sha256_init(&ctx);
    br_sha256_update(&ctx, input, input_len);
    br_sha256_out(&ctx, output);
}
