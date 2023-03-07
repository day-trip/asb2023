# Make-EMS-Fun
Try it at https://tinyurl.com/make-ems-fun!

### About
<p>Hi, as you could probably tell from the website, I am Jai. I'm a 7th grader, and I'm running for ASB president. I thought it would be cool to use ChatGPT to create some hype for my campaign.</p>
<p>If you are curious about what this means: I'm using OpenAI's ChatGPT API that was released last week. I compiled a custom version of PostgreSQL on Amazon Linux that implements vector data types and indexing. I'm using OpenAI's embeddings API to vectorize conversations and am storing this in the Postgres vector database. In ongoing conversations, I'm using a cosine-similarity search to look up relevant conversations from the vector database and I pass this on to ChatGPT as context. This means that ChatGPT is able to use context in real time from across user sessions.</p>