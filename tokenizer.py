import tiktoken
import pandas as pd
from openai import OpenAI

tokenizer = tiktoken.get_encoding("cl100k_base")

df = pd.read_csv("processed/scraped.csv", index_col=0)


max_tokens = 500 
def split_into_many(text, max_tokens=max_tokens):
    sentences = text.split(". ")
    n_tokens = [len(tokenizer.encode(" " + sentence)) for sentence in sentences]

    chunks = [] 
    tokens_so_far = 0
    chunk = []
    for sentence, token in zip(sentences, n_tokens):
        if tokens_so_far + token > max_tokens:
            chunks.append(". ".join(chunk) + " ")
            chunk = []
            tokens_so_far = 0
        if token > max_tokens:
            continue

        chunk.append(sentence)
        tokens_so_far += token + 1
    return chunks

shortened = []

for row in df.iterrows():
    if row[1]["text"] is None:
        continue
    if row[1]["n_tokens"] > max_tokens:
        shortened += split_into_many(row[1]["text"])
    else:
        shortened.append(row[1]["text"])

client = OpenAI()

df["embeddings"] = df.text.apply(lambda x: client.embeddings.create(input=x, engine="text-embedding-ada-002")["data"][0]["embeddings"])

df.to_csv("processed/embeddings.csv")
df.head()