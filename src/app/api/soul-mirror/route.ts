import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, temperature = 0.8, max_tokens = 2000 } = await req.json();

    // 从环境变量读取配置
    const apiKey = process.env.SOUL_MIRROR_API_KEY;
    const baseUrl = process.env.SOUL_MIRROR_BASE_URL || 'https://openrouter.ai/api/v1';
    const model = process.env.SOUL_MIRROR_MODEL || 'deepseek/deepseek-chat-v3-0324';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 未配置，请联系管理员设置 SOUL_MIRROR_API_KEY' },
        { status: 500 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    // OpenRouter 推荐的请求头
    if (baseUrl.includes('openrouter')) {
      headers['HTTP-Referer'] = req.headers.get('origin') || 'https://cxyxl.eu.org';
      headers['X-Title'] = 'Soul Mirror';
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `LLM API 错误: ${response.status}`, detail: err },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '服务器内部错误' },
      { status: 500 }
    );
  }
}
