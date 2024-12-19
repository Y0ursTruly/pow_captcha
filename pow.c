#include <stdlib.h>
#include <math.h>
#include <stdint.h>

void SHA256(uint8_t *Output, uint8_t *InputData, uint32_t InputByteLength) {
    uint32_t Hash[8] = { 0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
            0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19 };

    uint32_t RoundConstants[64] = { 0x428A2F98, 0x71374491, 0xB5C0FBCF,
            0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
            0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74,
            0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786,
            0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC,
            0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
            0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967, 0x27B70A85,
            0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB,
            0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70,
            0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
            0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3,
            0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F,
            0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7,
            0xC67178F2 };

    /* ========== Preprocessing and padding ========== */
    uint32_t PaddingByteLength = 64 - InputByteLength % 64;
    if (PaddingByteLength < 9) {
        /* if appended 1 and bitlength don't fit into current chunk, extend padding to another chunk */
        PaddingByteLength += 64;
    }

    uint8_t Padding[PaddingByteLength];
    memset(Padding, 0, PaddingByteLength);
    Padding[0] = 0x80; //Append "1"

    /* Writing size in big endian format into the last two 32-bit words of padding */
    uint32_t InputBitLength = (InputByteLength) * 8;
    uint8_t *InputBitLengthBytes = (uint8_t*)&InputBitLength;
    /* Reverse bytes */
    InputBitLengthBytes[0] ^= InputBitLengthBytes[3];
    InputBitLengthBytes[3] ^= InputBitLengthBytes[0];
    InputBitLengthBytes[0] ^= InputBitLengthBytes[3];
    InputBitLengthBytes[1] ^= InputBitLengthBytes[2];
    InputBitLengthBytes[2] ^= InputBitLengthBytes[1];
    InputBitLengthBytes[1] ^= InputBitLengthBytes[2];
    for (uint8_t i = 0; i < 4; i++) {
        Padding[PaddingByteLength - 4 + i] = InputBitLengthBytes[i]; //Accessing only by byte
    }

    /* ========== Main loop ========== */
    uint32_t DataIndex = 0;
    for (uint32_t chunk = 0; chunk < (PaddingByteLength + InputByteLength) / 64; chunk++) {
        uint8_t MessageSchedule[64 * 4];
        uint32_t *MessageScheduleWord = (uint32_t*) MessageSchedule;

        for (uint8_t i = 0; i < 64; i++) {
            if (DataIndex < InputByteLength) {
                MessageSchedule[i] = InputData[DataIndex];
                DataIndex++;
            } else {
                MessageSchedule[i] = Padding[DataIndex - InputByteLength];
                DataIndex++;
            }
        }

        /* Reverse data bytes upon fetching */
        for(uint8_t i = 0; i < 16; i++) {
            MessageSchedule[4*i+0] ^= MessageSchedule[4*i+3];
            MessageSchedule[4*i+3] ^= MessageSchedule[4*i+0];
            MessageSchedule[4*i+0] ^= MessageSchedule[4*i+3];
            MessageSchedule[4*i+1] ^= MessageSchedule[4*i+2];
            MessageSchedule[4*i+2] ^= MessageSchedule[4*i+1];
            MessageSchedule[4*i+1] ^= MessageSchedule[4*i+2];
        }

        for (uint8_t i = 16; i < 64; i++) {
            uint32_t S0 = ((MessageScheduleWord[i - 15] >> 7) | (MessageScheduleWord[i - 15] << (32 - 7)))
            ^ ((MessageScheduleWord[i - 15] >> 18) | (MessageScheduleWord[i - 15] << (32 - 18)))
            ^ (MessageScheduleWord[i - 15] >> 3);
            uint32_t S1 = ((MessageScheduleWord[i - 2] >> 17) | (MessageScheduleWord[i - 2] << (32 - 17)))
            ^ ((MessageScheduleWord[i - 2] >> 19) | (MessageScheduleWord[i - 2] << (32 - 19)))
            ^ (MessageScheduleWord[i - 2] >> 10);
            MessageScheduleWord[i] = MessageScheduleWord[i - 16] + S0 + MessageScheduleWord[i - 7] + S1;
        }
    }
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