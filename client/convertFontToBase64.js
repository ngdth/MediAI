import { readFileSync, writeFileSync } from "fs";

// Đường dẫn tới file DejaVuSans.ttf
const fontPath = "./public/assets/fonts/DejaVuSans.ttf";

// Đọc file và chuyển thành base64
const font = readFileSync(fontPath);
const base64 = font.toString("base64");

// Ghi chuỗi base64 ra file để dễ sử dụng
writeFileSync("./src/fonts.js", `export const DejaVuSansBase64 = "${base64}";`);

console.log("Đã tạo file fonts.js với chuỗi base64.");