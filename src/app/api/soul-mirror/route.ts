import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { messages, temperature = 0.8, max_tokens = 2000 } = await req.json();
    const requestId = req.headers.get('x-vercel-id') || Math.random().toString(36).slice(2, 10);

    // 从环境变量读取配置
    const apiKey = process.env.SOUL_MIRROR_API_KEY;
    const baseUrl = process.env.SOUL_MIRROR_BASE_URL || 'https://openrouter.ai/api/v1';
    const model = process.env.SOUL_MIRROR_MODEL || 'deepseek/deepseek-chat-v3-0324';

    console.log(`[SoulMirror] [${requestId}] 配置检查:`, {
      apiKey: apiKey ? `${apiKey.slice(0, 8)}...` : 'MISSING',
      baseUrl,
      model,
      envKeys: Object.keys(process.env).filter(k => k.includes('SOUL')),
      msgCount: messages?.length || 0,
    });

    if (!apiKey) {
      console.error(`[SoulMirror] [${requestId}] 错误: 未配置 API Key`);
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

    const requestBody = JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
    });

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: requestBody,
    });

    const duration = Date.now() - startTime;
    console.log(`[SoulMirror] [${requestId}] 响应: ${response.status} ${response.statusText} (${duration}ms)`);

    if (!response.ok) {
      const err = await response.text();
      console.error(`[SoulMirror] [${requestId}] LLM 错误详情:`, err.slice(0, 500));
      return NextResponse.json(
        { error: `LLM API 错误: ${response.status}`, detail: err },
        { status: 502 }
      );
    }

    const data = await response.json();
    const usage = data.usage || {};
    console.log(`[SoulMirror] [${requestId}] 成功:`, {
      durationMs: duration,
      tokens: usage.total_tokens || 'N/A',
      model: data.model,
    });
    return NextResponse.json(data);

  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`[SoulMirror] 异常 (${duration}ms):`, err.message || err);
    return NextResponse.json(
      { error: err.message || '服务器内部错误' },
      { status: 500 }
    );
  }
}
