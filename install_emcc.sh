git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
. ./emsdk_env.sh

# emcc pow.c -o takeTest.js -sEXPORTED_FUNCTIONS=_takeTest,_freeString -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
# gcc pow.c -lssl -lcrypto
# emcc -c -o libtomcrypt.o src/*.c
# emcc pow.c libtomcrypt.o -o takeTest.js -sEXPORTED_FUNCTIONS=_takeTest,_freeString -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
