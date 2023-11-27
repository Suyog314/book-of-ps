const devEndpoint = "http://localhost:8000/";
const prodEndpoint = "https://csci1951v-assignment-3.onrender.com/";

const isProduction = process.env.NODE_ENV === "production";
export const endpoint = isProduction ? prodEndpoint : devEndpoint;
