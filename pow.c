#include <stdlib.h>
#include <math.h>
#include <openssl/sha.h>


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

typedef struct Uncertainty{
  unsigned short index;
  unsigned char min;
  unsigned char max;
  unsigned char base;
}Uncertainty;

typedef struct ParsedInput{
  String *buffer;
  String *hash;
  Uncertainty *uncertainties;
  unsigned short length; //the count of uncertainties
  unsigned short a1;
  unsigned short a2;
}ParsedInput;
struct ParsedInput *PARSE(String *s){
  unsigned short i=0, starting;
  struct ParsedInput *parsed = (struct ParsedInput*)malloc(sizeof(struct ParsedInput));
  parsed->a1 = s->str[0];
  parsed->a2 = s->str[1]+1;
  parsed->length = ((s->str[2])<<8) + s->str[3];
  parsed->uncertainties = (struct Uncertainty*)malloc(sizeof(struct Uncertainty)*parsed->length);

  for(i=0;i<parsed->length;i++){
    parsed->uncertainties->index = ((s->str[ (i<<2)+4 ])<<8) + s->str[ (i<<2)+5 ];
    parsed->uncertainties->min = s->str[ (i<<2)+6 ];
    parsed->uncertainties->max = s->str[ (i<<2)+7 ];
  }

  parsed->hash = initString(32);
  starting=(parsed->length<<2)+4;
  for(i=0;i<32;i++)
    parsed->hash->str[i] = s->str[starting+i];
  parsed->buffer = initString(parsed->length - starting+32);
  starting += 32;
  for(i=0;i<parsed->buffer->length;i++)
    parsed->buffer->str[i] = s->str[starting+i];

  return parsed;
}
