import { createHash } from 'crypto';

export const parseJSON = <T>(data: string): T | null => {
  try {
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

export const sha256 = (str: string) => {
  return createHash('sha256').update(str).digest('hex');
};

const hexToBinaryLookup: { [key: string]: string } = {
  '0': '0000',
  '1': '0001',
  '2': '0010',
  '3': '0011',
  '4': '0100',
  '5': '0101',
  '6': '0110',
  '7': '0111',
  '8': '1000',
  '9': '1001',
  a: '1010',
  b: '1011',
  c: '1100',
  d: '1101',
  e: '1110',
  f: '1111',
};

export const hexToBinary = (str: string) => {
  let binary = '';
  for (const s of str) {
    binary += hexToBinaryLookup[s];
  }
  return binary;
};

export const toHexString = (arr: number[]) => Buffer.from(arr).toString('hex');
