import { Handler } from '@netlify/functions';

// Thay thế đoạn URL bên dưới bằng Web App URL bạn vừa copy ở Bước 1
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz6ysGGvHghxns-b0fOxMZdY2c8qnRGb27iU6IZ3wPJ_WGJMrwBxVImBK9BgpCTkBWd/exec';

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const response = await fetch(WEB_APP_URL);
      const data = await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (event.httpMethod === 'POST') {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: event.body,
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