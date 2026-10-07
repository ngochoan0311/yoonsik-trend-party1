import { Handler } from '@netlify/functions';

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz6ysGGvHghxns-b0fOxMZdY2c8qnRGb27iU6IZ3wPJ_WGJMrwBxVImBK9BgpCTkBWd/exec'; // Thay link của bạn vào đây

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const response = await fetch(WEB_APP_URL, {
        method: 'GET',
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script Error: ${response.status}`);
      }

      const rawData = await response.json();

      // Nếu rawData không phải mảng (hoặc bị lỗi), trả về mảng rỗng để không sập web
      if (!Array.isArray(rawData)) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([]),
        };
      }

      // Ánh xạ dữ liệu an toàn từng dòng
      const formattedData = rawData.map((item: any, index: number) => ({
        id: index + 1,
        name: String(item["Tên người chơi"] || "Ẩn danh"),
        twitter: String(item["Link X"] || ""),
        instagram: String(item["Link IG"] || ""),
        gaNumber: item["Số GA"] !== undefined && item["Số GA"] !== "" ? Number(item["Số GA"]) : 0,
        createdAt: String(item["Thời gian"] || new Date().toISOString()),
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedData),
      };
    }

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
