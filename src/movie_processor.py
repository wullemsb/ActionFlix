from openai_client import OpenAIClient

class MovieProcessor:
    def __init__(self):
        self.openai_client = OpenAIClient()

    def create_action_title(self, original_title, language):
        prompt = f"Transform the following romantic comedy movie title into an explosive action blockbuster version in {language}: '{original_title}', only reply back with the title."
        response_text = self.openai_client.call_openai_api_text(prompt)
        action_title = response_text.strip().split("\n")[0]  # Take only the first line as the title
        return action_title

    def create_action_summary(self, original_summary, language):
        prompt = f"Transform the following romantic comedy movie summary into an explosive action-packed blockbuster version (go wild with explosions, car chases, and intense combat scenes) in {language}: '{original_summary}'"
        response_text = self.openai_client.call_openai_api_text(prompt)
        return response_text.strip()
