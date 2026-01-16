from playwright.sync_api import sync_playwright, expect

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:5173/")

            # Wait for main content
            expect(page.get_by_text("Start Rapid Match")).to_be_visible()

            # Click Start to see the board
            page.get_by_text("Start Rapid Match").click()

            # Wait for board to appear (it's inside the active view)
            # We look for the "You" and "Opponent" stats that appear in active mode
            expect(page.get_by_text("You", exact=True)).to_be_visible()

            # Take screenshot of active state
            page.screenshot(path="verification/ui_verification_active.png", full_page=True)
            print("Active state screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ui()
