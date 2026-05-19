import os
import anthropic

MAX_CHARS_PER_DOC = 3000  # ~750 tokens par document
MAX_TOTAL_CHARS = 50000   # ~12500 tokens au total

class ChatService:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    def ask(self, question: str, documents: list) -> str:
        parts = []
        total = 0

        for d in documents:
            if not d.content_summary:
                continue
            # Tronque chaque doc à MAX_CHARS_PER_DOC
            content = d.content_summary[:MAX_CHARS_PER_DOC]
            if len(d.content_summary) > MAX_CHARS_PER_DOC:
                content += "\n[... contenu tronqué ...]"
            
            part = f"Fichier: {d.filename}\nContenu:\n{content}"
            
            # Stop si on dépasse le total
            if total + len(part) > MAX_TOTAL_CHARS:
                break
            
            parts.append(part)
            total += len(part)

        if not parts:
            return "Aucun document avec du contenu extrait n'est disponible."

        context = "\n\n---\n\n".join(parts)

        response = self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": (
                    f"Tu es un assistant documentaire personnel. "
                    f"Voici mes documents :\n\n{context}\n\n"
                    f"Question : {question}\n\n"
                    f"Réponds précisément en citant le fichier source."
                )
            }]
        )
        return response.content[0].text