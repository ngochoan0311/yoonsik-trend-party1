import { Handler } from '@netlify/functions';

// BẮT BUỘC: Thay thế bằng URL Google Apps Script Web App (kết thúc bằng /exec) của bạn
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz6ysGGvHghxns-b0fOxMZdY2c8qnRGb27iU6IZ3wPJ_WGJMrwBxVImBK9BgpCTkBWd/exec';

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Xử lý CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 1. Xử lý GET: Lấy danh sách người tham gia
    if (event.httpMethod === 'GET') {
      const response = await fetch(WEB_APP_URL, {
        method: 'GET',
        redirect: 'follow', // Cho phép tự động theo vết chuyển hướng (Redirect 302) của Google
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script HTTP Error: ${response.status}`);
      }

      const rawData = await response.json();

      // Kiểm tra nếu rawData là mảng hợp lệ
      if (!Array.isArray(rawData)) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([]),
        };
      }

      // Ánh xạ dữ liệu từ cột tiếng Việt sang định dạng Frontend yêu cầu
      const formattedData = rawData.map((item: any, index: number) => ({
        id: index + 1,
        name: item["Tên người chơi"] || "",
        twitter: item["Link X"] || "",
        instagram: item["Link IG"] || "",
        gaNumber: item["Số GA"] !== undefined && item["Số GA"] !== "" ? Number(item["Số GA"]) : 0,
        createdAt: item["Thời gian"] || new Date().toISOString(),
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedData),
      };
    }

    // 2. Xử lý POST: Đăng ký tham gia mới
    if (event.httpMethod === 'POST') {
      const bodyData = JSON.parse(event.body || '{}');

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
        redirect: 'follow',
      });

      const result = await response.json();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  } catch (error: any) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
};
