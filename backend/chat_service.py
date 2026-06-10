import os
import numpy as np
from openai import OpenAI, AsyncOpenAI
from sklearn.metrics.pairwise import cosine_similarity
from resume_data import RAG_DOCS

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
CHAT_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
EMBED_MODEL = "nvidia/llama-nemotron-embed-vl-1b-v2:free"

_client: OpenAI | None = None
_async_client: AsyncOpenAI | None = None
_doc_vectors: np.ndarray | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.environ.get("OPENROUTER_API_KEY", "")
        _client = OpenAI(base_url=OPENROUTER_BASE_URL, api_key=api_key or "no-key")
    return _client


def get_async_client() -> AsyncOpenAI:
    global _async_client
    if _async_client is None:
        api_key = os.environ.get("OPENROUTER_API_KEY", "")
        _async_client = AsyncOpenAI(base_url=OPENROUTER_BASE_URL, api_key=api_key or "no-key")
    return _async_client


def get_embedding(texts: list[str]) -> np.ndarray:
    client = get_client()
    resp = client.embeddings.create(
        model=EMBED_MODEL,
        input=[{"content": [{"type": "text", "text": t}]} for t in texts],
        encoding_format="float",
    )
    vecs = np.array([d.embedding for d in resp.data], dtype=np.float32)
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    return vecs / np.where(norms == 0, 1, norms)


def get_doc_vectors() -> np.ndarray:
    global _doc_vectors
    if _doc_vectors is None:
        _doc_vectors = get_embedding(RAG_DOCS)
    return _doc_vectors


def retrieve(query: str, k: int = 3) -> list[str]:
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not api_key:
        from sklearn.feature_extraction.text import TfidfVectorizer
        vec = TfidfVectorizer()
        doc_vecs = vec.fit_transform(RAG_DOCS)
        q_vec = vec.transform([query])
        scores = cosine_similarity(q_vec, doc_vecs)[0]
        top_idx = np.argsort(scores)[::-1][:k]
        return [RAG_DOCS[i] for i in top_idx if scores[i] > 0.01] or [RAG_DOCS[0]]

    q_vec = get_embedding([query])
    scores = cosine_similarity(q_vec, get_doc_vectors())[0]
    top_idx = np.argsort(scores)[::-1][:k]
    return [RAG_DOCS[i] for i in top_idx if scores[i] > 0.1] or [RAG_DOCS[0]]


SYSTEM_PROMPT = """你是一位助手，幫助人家了解巫宇哲這個人。

嚴禁提及自己是 AI 或無法回答問題。所有回答必須基於已提供的資料。

提供的資訊：
Name: 巫宇哲
{context}

請根據上面的資訊來回答問題，使用繁體中文回答。"""


async def chat_stream(message: str, history: list[dict]):
    import time

    t0 = time.time()
    context_docs = retrieve(message)
    print(f"[timing] embedding+retrieve: {time.time() - t0:.2f}s", flush=True)

    context = "\n\n".join(context_docs)

    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not api_key:
        response = f"根據巫宇哲的資料：\n\n{context_docs[0]}"
        for char in response:
            yield char
        return

    client = get_async_client()
    messages = [{"role": "system", "content": SYSTEM_PROMPT.format(context=context)}]
    for turn in history:
        messages.append({"role": "user", "content": turn["user"]})
        messages.append({"role": "assistant", "content": turn["assistant"]})
    messages.append({"role": "user", "content": message})

    t1 = time.time()
    stream = await client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        max_tokens=200000,
        stream=True,
    )
    first_token = True
    async for chunk in stream:
        print(f"[debug] chunk: {chunk}", flush=True)
        text = chunk.choices[0].delta.content
        if text:
            if first_token:
                print(f"[timing] llm first token: {time.time() - t1:.2f}s", flush=True)
                first_token = False
            yield text
    print(f"[timing] llm total: {time.time() - t1:.2f}s", flush=True)
