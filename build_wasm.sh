# builds the wasm file
# if it fails at first, open a new terminal, close the old one and try again
if [ ! -d emsdk ]; then
  git clone https://github.com/emscripten-core/emsdk.git
  cd emsdk
  ./emsdk install latest
  ./emsdk activate latest
  . ./emsdk_env.sh
  echo '. /workspaces/*/emsdk/emsdk_env.sh' >> $HOME/.bashrc
  cd ..
fi

if [ ! -d BearSSL ]; then
  git clone https://www.bearssl.org/git/BearSSL
  cd BearSSL
  echo -e "CC = emcc\nCXX = em++\nAR=emar\nRANLIB=emranlib" >> Makefile
  emmake make
  cd ..
fi

cd C
emcc -I ../BearSSL/inc -L ../BearSSL/build -o takeTest.js takeTest.c ../BearSSL/build/libbearssl.a -sEXPORTED_FUNCTIONS=_takeTest,_freeString,_makeString,_malloc
rm takeTest.js
# because the WebAssembly interface is being manually handled >:D
# gcc hash_wit...c -lssl -lcrypto
#emconfigure ./Configure no-asm no-shared no-threads no-dso no-afalgeng linux-generic32 -DOPENSSL_NO_SECURE_MEMORY --prefix=$(pwd)/build --openssldir=$(pwd)/build/ssl
#echo -e "CC = emcc\nCXX = em++\nAR=emar\nRANLIB=emranlib" >> Makefile
#emmake make -j $(nproc)
#emmake make -j $(nproc) install
#emcc -I ../openssl/include -L ../openssl -o takeTest.js takeTest.c ../openssl/libcrypto.a -sEXPORTED_FUNCTIONS=_takeTest,_freeString,_makeString,_malloc