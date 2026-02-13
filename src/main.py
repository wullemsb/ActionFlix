import sys
import os
from movie_processor import MovieProcessor
from openai_client import OpenAIClient
from utils import save_image
import re

def main():
    original_title = input("Please enter the movie title: ")
    
    print("Please select the language:")
    print("1. English")
    print("2. Dutch")
    print("3. French")
    language_choice = input("Enter the number corresponding to your choice: ").strip()

    language_map = {
        "1": "English",
        "2": "Dutch",
        "3": "French"
    }

    language = language_map.get(language_choice, "English").lower()

    openai_client = OpenAIClient()
    movie_data = openai_client.get_movie_data(original_title)
    original_summary = movie_data.get('summary', "Summary not found.")

    movie_processor = MovieProcessor()
    action_title = movie_processor.create_action_title(original_title, language)
    action_summary = movie_processor.create_action_summary(original_summary, language)

    print(f"Actionized Title: {action_title}")
    print(f"Actionized Summary: {action_summary}")

    # Create a new directory named after the actionized title inside the 'movies' directory
    sanitized_title = re.sub(r'[<>:"/\\|?*]', '', action_title.split("\n")[0])
    directory_name = sanitized_title.replace(' ', '_')[:100]
    movies_directory = os.path.join("movies", directory_name)

    os.makedirs(movies_directory, exist_ok=True)

    # Save the image in the new directory
    image_data = openai_client.call_openai_api(f"Create an explosive action movie poster for '{action_title}' (this is an action-packed version of the original rom-com '{original_title}')")
    image_path = os.path.join(movies_directory, f"{directory_name}_poster.png")
    save_image(image_data, image_path)

    # Save the actionized title, summary, and image in a README file in the new directory
    with open(os.path.join(movies_directory, "README.md"), "w", encoding="utf-8") as readme_file:
        readme_file.write(f"![Movie Poster]({directory_name}_poster.png)\n")
        readme_file.write(f"# {action_title} (Originally -{original_title}-)\n")
        readme_file.write(f"## Summary:\n{action_summary}\n")
        
if __name__ == "__main__":
    main()