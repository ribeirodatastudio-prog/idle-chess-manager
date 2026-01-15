
from playwright.sync_api import Page, expect, sync_playwright

def verify_puzzle_room(page: Page):
    # 1. Load App
    page.goto("http://localhost:5173")

    # 2. Check for Puzzle Room Header
    # It should be in the Stats Panel (default view)
    expect(page.get_by_text("Academy Puzzle")).to_be_visible(timeout=10000)

    # 3. Check for Stats
    expect(page.get_by_text("Puzzle Elo:")).to_be_visible()
    expect(page.get_by_text("Prod Mult:")).to_be_visible()

    # 4. Check for Active Puzzle Content
    # Difficulty should be visible
    expect(page.get_by_text("Difficulty")).to_be_visible()

    # 5. Take Screenshot
    page.screenshot(path="verification/puzzle_room.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_puzzle_room(page)
        finally:
            browser.close()
