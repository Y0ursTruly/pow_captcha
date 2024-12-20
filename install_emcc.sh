git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
. ./emsdk_env.sh
echo '. /workspaces/*/emsdk/emsdk_env.sh' >> $HOME/.bashrc


# emcc pow.c -o takeTest.js -sEXPORTED_FUNCTIONS=_takeTest,_freeString -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
# the above command finally works :D