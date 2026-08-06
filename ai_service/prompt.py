def build_prompt(context, question):

    return f"""
You are an Enterprise Document Intelligence Assistant.

Answer ONLY using the context below.

Context:

{context}

Question:

{question}

If the answer cannot be found in the context, reply:

"I couldn't find that information in the document."
"""