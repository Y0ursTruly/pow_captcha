git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
. ./emsdk_env.sh
echo '. /workspaces/*/emsdk/emsdk_env.sh' >> $HOME/.bashrc
cd ..

emcc pow.c -o takeTest.js -sEXPORTED_FUNCTIONS=_takeTest,_freeString,_makeString,_malloc -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
# the above command finally works :D
rm takeTest.js
# because the WebAssembly interface is being manually handled >:D