export const authConstants = {
  secret: 'SimpleJWTKeyForSigning',
  expiresIn: '1d',
  tokenType: 'bearer',
  convertToUnixTime(duration: string): number {
    const units: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const matches = duration.match(/^(\d+)([smhd])$/);

    if (!matches) {
      throw new Error('Formato de duración no válido');
    }

    const value = parseInt(matches[1], 10);
    const unit = matches[2];

    if (!units[unit]) {
      throw new Error('Unidad de duración no válida');
    }

    return value * units[unit];
  },
};
