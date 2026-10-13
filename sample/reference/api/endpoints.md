# API endpoints

A fictional REST API, used to show deeper folder nesting.

## `GET /v1/documents`

Returns a page of documents.

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Search text |
| `limit` | number | Page size (default 50) |

```json
{
  "items": [
    { "id": "doc-1", "title": "Getting started" }
  ],
  "next": null
}
```

## `POST /v1/documents`

Creates a document.

```bash
curl -X POST https://example.com/v1/documents \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello"}'
```

Back to the [showcase](../markdown-showcase.md).
