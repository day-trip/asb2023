create or replace function match_messages (
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int,
  session_id char(16)
)
returns table (
  id bigint,
  "timestamp" bigint,
  content text,
  session char(16),
  "user" char(16),
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    "timestamp",
    content,
    session,
    "user",
    1 - (messages.embedding <=> query_embedding) as similarity
  from messages
  where 1 - (messages.embedding <=> query_embedding) > similarity_threshold and session != session_id
  order by messages.embedding <=> query_embedding
  limit match_count;
end;
$$;