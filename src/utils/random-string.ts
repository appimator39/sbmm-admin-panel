export function getRandomString(length: number): string {
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*';
  const allChars = upperCase + lowerCase + numbers + specialChars;

  if (length < 4) {
    throw new Error('Length must be at least 4 to include all character types.');
  }

  const result = [
    upperCase.charAt(Math.floor(Math.random() * upperCase.length)), // Ensure at least one uppercase
    lowerCase.charAt(Math.floor(Math.random() * lowerCase.length)), // Ensure at least one lowercase
    numbers.charAt(Math.floor(Math.random() * numbers.length)), // Ensure at least one number
    specialChars.charAt(Math.floor(Math.random() * specialChars.length)), // Ensure at least one special char
  ];

  for (let i = 4; i < length; i += 1) {
    result.push(allChars.charAt(Math.floor(Math.random() * allChars.length)));
  }

  return result.sort(() => Math.random() - 0.5).join(''); // Shuffle to randomize order
}
