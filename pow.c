#include <stdlib.h>
#include <math.h>
#include <openssl/sha.h>


typedef struct String{
  char *str;
  int length;
}String;
void setStringValue(struct String *s, char *c, int n){
  s->str=c;
  s->length=n;
}
struct String *makeString(char *c, int n){
  struct String *s=(struct String*)malloc(sizeof(struct String));
  setStringValue(s,c,n);
  return s;
}

typedef struct Uncertainty{
  short index;
  unsigned char min;
  unsigned char max;
  unsigned char base;
}Uncertainty;

typedef struct ParsedInput{
  String *buffer;
  String *hash;
  Uncertainty *uncertainties;
  int length; //the count of uncertainties
  int a1;
  int a2;
}ParsedInput;
struct ParsedInput *x(String *s){}
