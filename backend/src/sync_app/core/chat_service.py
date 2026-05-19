import os
import anthropic

class ChatService:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    def ask(self, question: str, documents: list) -> str:
        context = "\n\n".join([
            f"Fichier: {d.filename}\nContenu: {d.content_summary}"
            for d in documents if d.content_summary
        ])

        if not context:
            return "Aucun document avec du contenu extrait n'est disponible."

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