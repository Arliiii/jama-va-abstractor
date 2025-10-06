import asyncio
from speckit.pipeline.scraper import JAMAScraper

async def test_scraper():
    scraper = JAMAScraper()
    url = 'https://jamanetwork.com/journals/jamaneurology/fullarticle/2835388'
    print(f'Testing URL: {url}')
    
    try:
        result = await scraper.scrape_article(url)
        print(f'Success: {result["success"]}')
        
        if not result['success']:
            print(f'Error: {result["message"]}')
            print(f'Error Type: {result.get("error_type", "unknown")}')
        else:
            print(f'Content length: {result["content_length"]}')
            print(f'Method used: {result["method"]}')
            
    except Exception as e:
        print(f'Exception occurred: {str(e)}')
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_scraper())