#include <stdlib.h>
#include <math.h>
#include <tomcrypt.h>
void SHA256(const unsigned char *data, unsigned int length, unsigned char *output){
  //created because C for webassembly can't be compiled while using openssl
  hash_state md;
  sha256_init(&md);
  sha256_process(&md, data, length);
  sha256_done(&md, output);
}


typedef struct String{
  unsigned char *str;
  unsigned int length;
}String;
void setStringValue(struct String *s, unsigned char *c, unsigned int n){
  s->str=c;
  s->length=n;
}
struct String *makeString(unsigned char *c, unsigned int n){
  struct String *s=(struct String*)malloc(sizeof(struct String));
  setStringValue(s,c,n);
  return s;
}
struct String *initString(unsigned int n){
  unsigned char *c = (unsigned char*)malloc(sizeof(unsigned char)*n);
  return makeString(c,n);
}
struct String *subString(struct String *s, unsigned int start, unsigned int stop){
  unsigned int i;
  struct String *sub = initString(stop-start);
  for(i=0;i<sub->length;i++) sub->str[i]=s->str[start+i];
  return sub;
}
short checkHash(struct String *buffer, struct String *hash, struct String *digest){
  int i;
  SHA256(buffer->str, buffer->length, digest->str);
  for(i=0;i<32;i++)
    if(hash->str[i]!=digest->str[i]) return 0;
  return 1;
}
void freeString(struct String *s){
  if(!s) return;
  free(s->str);
  free(s);
}

typedef struct Uncertainty{
  unsigned short index;
  unsigned char min;
  unsigned char max;
  unsigned char base;
}Uncertainty;

typedef struct ParsedInput{
  String *buffer;
  String *hash;
  Uncertainty *uncertainties; //the array called chars in pow.js
  unsigned short length; //the count of uncertainties
  unsigned short a1;
  unsigned short a2;
}ParsedInput;
struct ParsedInput *PARSE(String *s){
  unsigned short i=0, starting;
  struct Uncertainty u;
  struct ParsedInput *parsed = (struct ParsedInput*)malloc(sizeof(struct ParsedInput));
  parsed->a1 = s->str[0];
  parsed->a2 = s->str[1]+1;
  parsed->length = ((s->str[2])<<8) + s->str[3];
  parsed->uncertainties = (struct Uncertainty*)malloc(sizeof(struct Uncertainty)*parsed->length);

  for(i=0;i<parsed->length;i++){
    u = parsed->uncertainties[i];
    u.index = ((s->str[ (i<<2)+4 ])<<8) + s->str[ (i<<2)+5 ];
    u.min = s->str[ (i<<2)+6 ];
    u.max = s->str[ (i<<2)+7 ];
    u.base = 1+(u.max>u.min? u.max-u.min: (parsed->a2-u.min)+(u.max-parsed->a1));
  }

  starting=(parsed->length<<2)+4;
  parsed->hash = subString(s,starting,starting+32);
  parsed->buffer = subString(s,starting+32,s->length);
  return parsed;
}
void freeParsed(struct ParsedInput *parsed){
  if(!parsed) return;
  freeString(parsed->buffer);
  freeString(parsed->hash);
  free(parsed->uncertainties);
  free(parsed);
}

struct String *takeTest(struct String *input){
  struct String *digest = initString(32), *buffer;
  unsigned short c, MIN, num, A2, addition;
  struct Uncertainty u;
  struct ParsedInput *parsed = PARSE(input);

  while(1){
    //in each iteration, an "addition of 1" is done on the "number"
    //in the "number" each "digit" is defined by an instance of Uncertainty
    //each uncertainty has the range of possible values(max,min) of a byte(index) in the buffer
    for(c=parsed->length-1;c>=0;c--){
      u = parsed->uncertainties[c];
      MIN = u.min-parsed->a1;
      num = (parsed->buffer->str[u.index]+1) - parsed->a1;
      A2 = parsed->a2 - parsed->a1;
      addition = (( (num<MIN?num+MIN+(A2-MIN):num)-MIN )%u.base)+MIN;
      parsed->buffer->str[u.index] = (addition%A2)+parsed->a1;
      if(parsed->buffer->str[u.index]!=u.min) break;
    }
    if(checkHash(parsed->buffer,parsed->hash,digest)) break;
  }

  buffer = subString(parsed->buffer, 0, parsed->buffer->length);
  freeString(digest);
  freeParsed(parsed);
  return buffer;
}