import KSUID from 'ksuid';

export function generateUniqueId(): string {
  return KSUID.randomSync().string;
}
