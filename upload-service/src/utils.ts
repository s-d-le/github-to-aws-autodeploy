//generate random id string includes numbers and letters max lenght = 5
export function generateRandomId() {
  return Math.random().toString(36).substr(2, 5);
}
