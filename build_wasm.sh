# builds the wasm file
# if it fails at first, open a new terminal, close the old one and try again
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
. ./emsdk_env.sh
echo '. /workspaces/*/emsdk/emsdk_env.sh' >> $HOME/.bashrc
cd ..

cd C
emcc takeTest.c -o takeTest.js -sEXPORTED_FUNCTIONS=_takeTest,_freeString,_makeString,_malloc -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
rm takeTest.js
# because the WebAssembly interface is being manually handled >:D
# gcc hash_wit...c -lssl -lcrypto