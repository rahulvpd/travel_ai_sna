import os
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

router = APIRouter(prefix='/ai', tags=['ai'])

NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions'
DEFAULT_MODEL = 'nvidia/nemotron-3-nano-30b-a3b'


class NvidiaChatRequest(BaseModel):
    prompt: str | None = None
    messages: list[dict[str, Any]] | None = None
    model: str = DEFAULT_MODEL
    temperature: float = 0.3
    top_p: float = 1.0
    max_tokens: int = 2048
    reasoning_budget: int | None = None
    enable_thinking: bool = False
    extra_body: dict[str, Any] = Field(default_factory=dict)


def _get_nvidia_key() -> str | None:
    return os.getenv('NVIDIA_API_KEY') or os.getenv('VITE_NVIDIA_API_KEY')


@router.post('/nvidia/chat')
async def nvidia_chat(request: NvidiaChatRequest):
    api_key = _get_nvidia_key()
    if not api_key:
        raise HTTPException(status_code=503, detail='NVIDIA API key is not configured on the server.')

    messages = request.messages or []
    if not messages and request.prompt:
        messages = [{'role': 'user', 'content': request.prompt}]

    if not messages:
        raise HTTPException(status_code=400, detail='Either prompt or messages is required.')

    payload: dict[str, Any] = {
        'model': request.model or DEFAULT_MODEL,
        'messages': messages,
        'temperature': request.temperature,
        'top_p': request.top_p,
        'max_tokens': request.max_tokens,
        'stream': False,
    }

    extra_body = dict(request.extra_body or {})
    if request.reasoning_budget is not None:
        extra_body['reasoning_budget'] = request.reasoning_budget
    if request.enable_thinking:
        template_kwargs = dict(extra_body.get('chat_template_kwargs') or {})
        template_kwargs['enable_thinking'] = True
        extra_body['chat_template_kwargs'] = template_kwargs
    if extra_body:
        payload['extra_body'] = extra_body

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                NVIDIA_ENDPOINT,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {api_key}',
                },
                json=payload,
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f'NVIDIA request failed: {exc}') from exc

    if response.status_code != 200:
        detail = response.text
        raise HTTPException(status_code=response.status_code, detail=detail)

    data = response.json()
    message = data.get('choices', [{}])[0].get('message', {})
    content = message.get('content') or message.get('reasoning_content') or message.get('reasoning') or ''

    return {
        'text': content,
        'model': payload['model'],
        'provider': 'nvidia',
        'usage': data.get('usage'),
        'finish_reason': data.get('choices', [{}])[0].get('finish_reason'),
    }
