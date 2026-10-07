import { Handler } from '@netlify/functions';

// Thay thế link bên dưới bằng Web App URL của Google Apps Script của bạn
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz6ysGGvHghxns-b0fOxMZdY2c8qnRGb27iU6IZ3wPJ_WGJMrwBxVImBK9BgpCTkBWd/exec';

export const handler: Handler = async (event) => {
  try {
    // 1. Xử lý khi Frontend gọi lấy danh sách (GET)
    if (event.httpMethod === 'GET') {
      const response = await fetch(WEB_APP_URL);
      const rawData = await response.json();

      // Ánh xạ từ cột Google Sheet sang đúng schema fields của ứng dụng
      const formattedData = rawData.map((item: any, index: number) => ({
        id: index + 1,
        name: item["Tên người chơi"] || "",
        twitter: item["Link X"] || "",
        instagram: item["Link IG"] || "",
        gaNumber: item["Số GA"] !== undefined ? Number(item["Số GA"]) : 0,
        createdAt: item["Thời gian"] || new Date().toISOString(),
      }));

      return {
        statusCode: 200,
        body: JSON.stringify(formattedData),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // 2. Xử lý khi Frontend gửi dữ liệu mới lên (POST)
    if (event.httpMethod === 'POST') {
      const bodyData = JSON.parse(event.body || '{}');
      
      // Chuyển đổi dữ liệu từ form ứng dụng thành định dạng cột của Google Sheet
      const sheetPayload = {
        "Thời gian": new Date().toISOString(),
        "Tên người chơi": bodyData.name || "",
        "Link X": bodyData.twitter || "",
        "Link IG": bodyData.instagram || "",
        "Số GA": bodyData.gaNumber || 0,
      };

      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetPayload),
      });
      
      const result = await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
