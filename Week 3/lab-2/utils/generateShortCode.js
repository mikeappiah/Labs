const generateShortCode = () => Math.random().toString(36).substring(2, 8);
// e.g 0.123456789 -> 0.pojk8y3d -> pojk8y

export default generateShortCode;
