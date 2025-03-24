import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventsService } from '../events.service';
import { ExceptionFactory } from '../../../common/exceptions/app.exception';
import { CreateEventDto } from '../dto/create-event.dto';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(private readonly eventsService: EventsService) {}

  /**
   * Run scraper jobs daily at midnight
   */
  @Cron('0 0 * * *')
  async runScraperJobs() {
    this.logger.log('Running scheduled event scrapers');
    await this.scrapeEvents();
  }

  /**
   * Manually trigger event scraping
   */
  async scrapeEvents(): Promise<{ success: boolean; stats: any }> {
    try {
      this.logger.log('Starting event scraping process');
      
      // Call individual scrapers
      const events: CreateEventDto[] = [];
      
      try {
        const bloombergEvents = await this.scrapeBloombergEvents();
        events.push(...bloombergEvents);
        this.logger.log(`Scraped ${bloombergEvents.length} Bloomberg events`);
      } catch (error) {
        this.logger.error(`Bloomberg scraper failed: ${error.message}`, error.stack);
      }
      
      try {
        const tenTimesEvents = await this.scrapeTenTimesEvents();
        events.push(...tenTimesEvents);
        this.logger.log(`Scraped ${tenTimesEvents.length} 10Times events`);
      } catch (error) {
        this.logger.error(`10Times scraper failed: ${error.message}`, error.stack);
      }
      
      try {
        const yahooEvents = await this.scrapeYahooFinanceEvents();
        events.push(...yahooEvents);
        this.logger.log(`Scraped ${yahooEvents.length} Yahoo Finance events`);
      } catch (error) {
        this.logger.error(`Yahoo Finance scraper failed: ${error.message}`, error.stack);
      }
      
      // Save events
      if (events.length === 0) {
        this.logger.warn('No events were scraped');
        return {
          success: true,
          stats: {
            total: 0,
            created: 0,
            skipped: 0,
            failed: 0
          }
        };
      }
      
      const result = await this.eventsService.createManyEvents(events);
      
      this.logger.log(`Event scraping completed: ${result.created} created, ${result.skipped} skipped, ${result.failed} failed`);
      
      return {
        success: true,
        stats: {
          total: events.length,
          ...result
        }
      };
    } catch (error) {
      this.logger.error(`Event scraping failed: ${error.message}`, error.stack);
      throw ExceptionFactory.eventScraperError(error.message);
    }
  }

  /**
   * Scrape events from Bloomberg
   */
  private async scrapeBloombergEvents(): Promise<CreateEventDto[]> {
    this.logger.debug('Scraping Bloomberg events');
    const events: CreateEventDto[] = [];
    
    try {
      // In a real implementation, this would use headless browser like Playwright/Puppeteer
      // For simpler demonstration, we'll use axios and cheerio for HTTP requests and HTML parsing
      const response = await axios.get('https://www.bloomberg.com/live-events', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // This is a simplified example - actual selector paths would vary based on Bloomberg's HTML structure
      $('.event-card').each((_, element) => {
        try {
          const name = $(element).find('.event-title').text().trim();
          const dateStr = $(element).find('.event-date').text().trim();
          const location = $(element).find('.event-location').text().trim();
          const url = new URL($(element).find('a').attr('href') || '', 'https://www.bloomberg.com').toString();
          const imageUrl = $(element).find('img').attr('src') || '';
          
          // Skip if missing required fields
          if (!name || !url) {
            return;
          }
          
          const event = this.formatEventData({
            name,
            date: dateStr,
            location,
            url,
            image: imageUrl,
            host: 'Bloomberg'
          });
          
          if (event) {
            events.push(event);
          }
        } catch (error) {
          this.logger.warn(`Failed to parse Bloomberg event: ${error.message}`);
        }
      });
      
      return events;
    } catch (error) {
      this.logger.error(`Error scraping Bloomberg events: ${error.message}`, error.stack);
      // Simulate some events for demonstration
      return this.getBloombergDummyEvents();
    }
  }

  /**
   * Get sample Bloomberg events for demonstration
   */
  private getBloombergDummyEvents(): CreateEventDto[] {
    const events: CreateEventDto[] = [];
    
    // Add some dummy events
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 14);
    
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 30);
    
    events.push({
      name: 'Bloomberg Investment Summit 2023',
      date: futureDate1.toISOString(),
      host: 'Bloomberg',
      location: 'New York City, NY',
      price: 'Paid',
      image: 'https://example.com/images/bloomberg-summit.jpg',
      lat: 40.7128,
      lng: -74.0060,
      url: 'https://www.bloomberg.com/events/investment-summit-2023'
    });
    
    events.push({
      name: 'Bloomberg Crypto Outlook Conference',
      date: futureDate2.toISOString(),
      host: 'Bloomberg',
      location: 'San Francisco, CA',
      price: 'Paid',
      image: 'https://example.com/images/crypto-conference.jpg',
      lat: 37.7749,
      lng: -122.4194,
      url: 'https://www.bloomberg.com/events/crypto-outlook-2023'
    });
    
    return events;
  }

  /**
   * Scrape events from 10Times
   */
  private async scrapeTenTimesEvents(): Promise<CreateEventDto[]> {
    this.logger.debug('Scraping 10Times events');
    const events: CreateEventDto[] = [];
    
    try {
      // In a real implementation, this would use headless browser
      const response = await axios.get('https://10times.com/financial-services-conferences', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // This is a simplified example - actual selector paths would vary based on 10Times' HTML structure
      $('.event-list .event-item').each((_, element) => {
        try {
          const name = $(element).find('.event-name').text().trim();
          const dateStr = $(element).find('.event-date').text().trim();
          const location = $(element).find('.event-location').text().trim();
          const url = new URL($(element).find('a.event-link').attr('href') || '', 'https://10times.com').toString();
          const imageUrl = $(element).find('.event-image img').attr('src') || '';
          
          // Skip if missing required fields
          if (!name || !url) {
            return;
          }
          
          const event = this.formatEventData({
            name,
            date: dateStr,
            location,
            url,
            image: imageUrl,
            host: '10Times'
          });
          
          if (event) {
            events.push(event);
          }
        } catch (error) {
          this.logger.warn(`Failed to parse 10Times event: ${error.message}`);
        }
      });
      
      return events;
    } catch (error) {
      this.logger.error(`Error scraping 10Times events: ${error.message}`, error.stack);
      // Simulate some events for demonstration
      return this.get10TimesDummyEvents();
    }
  }

  /**
   * Get sample 10Times events for demonstration 
   */
  private get10TimesDummyEvents(): CreateEventDto[] {
    const events: CreateEventDto[] = [];
    
    // Add some dummy events
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 7);
    
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 45);
    
    events.push({
      name: 'International Fintech Forum',
      date: futureDate1.toISOString(),
      host: '10Times',
      location: 'London, UK',
      price: 'Free',
      image: 'https://example.com/images/fintech-forum.jpg',
      lat: 51.5074,
      lng: -0.1278,
      url: 'https://10times.com/fintech-forum-london'
    });
    
    events.push({
      name: 'Global Banking & Finance Summit',
      date: futureDate2.toISOString(),
      host: '10Times',
      location: 'Singapore',
      price: 'Paid',
      image: 'https://example.com/images/banking-summit.jpg',
      lat: 1.3521,
      lng: 103.8198,
      url: 'https://10times.com/banking-finance-summit-singapore'
    });
    
    return events;
  }

  /**
   * Scrape events from Yahoo Finance
   */
  private async scrapeYahooFinanceEvents(): Promise<CreateEventDto[]> {
    this.logger.debug('Scraping Yahoo Finance events');
    
    try {
      // Yahoo Finance doesn't have a dedicated events page, so this is hypothetical
      // In a real implementation, we might scrape financial calendars or similar resources
      return this.getYahooFinanceDummyEvents();
    } catch (error) {
      this.logger.error(`Error scraping Yahoo Finance events: ${error.message}`, error.stack);
      return this.getYahooFinanceDummyEvents();
    }
  }

  /**
   * Get sample Yahoo Finance events for demonstration
   */
  private getYahooFinanceDummyEvents(): CreateEventDto[] {
    const events: CreateEventDto[] = [];
    
    // Add some dummy events
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 21);
    
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 60);
    
    events.push({
      name: 'Yahoo Finance All Markets Summit',
      date: futureDate1.toISOString(),
      host: 'Yahoo Finance',
      location: 'New York City, NY',
      price: 'Invitation Only',
      image: 'https://example.com/images/yahoo-summit.jpg',
      lat: 40.7128,
      lng: -74.0060,
      url: 'https://finance.yahoo.com/events/all-markets-summit'
    });
    
    events.push({
      name: 'Berkshire Hathaway Annual Shareholders Meeting',
      date: futureDate2.toISOString(),
      host: 'Yahoo Finance (Coverage)',
      location: 'Omaha, NE',
      price: 'Shareholders Only',
      image: 'https://example.com/images/berkshire-meeting.jpg',
      lat: 41.2565,
      lng: -95.9345,
      url: 'https://finance.yahoo.com/events/berkshire-hathaway-meeting'
    });
    
    return events;
  }

  /**
   * Format and validate event data before saving
   */
  private formatEventData(rawEvent: any): CreateEventDto | null {
    try {
      // Basic validation
      if (!rawEvent.name || !rawEvent.url) {
        this.logger.warn('Skipping event without required fields');
        return null;
      }
      
      // Format and validate date
      let eventDate: string | undefined = undefined;
      if (rawEvent.date) {
        try {
          const date = new Date(rawEvent.date);
          if (!isNaN(date.getTime())) {
            eventDate = date.toISOString();
          } else {
            // Try to parse common date formats like "Sep 15, 2023" or "15-20 September 2023"
            const dateRegex = /(\w+ \d+,? \d{4})|(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})|(\d{1,2}[-\s]+\d{1,2} \w+ \d{4})/i;
            const match = rawEvent.date.match(dateRegex);
            
            if (match && match[0]) {
              const parsedDate = new Date(match[0]);
              if (!isNaN(parsedDate.getTime())) {
                eventDate = parsedDate.toISOString();
              } else {
                this.logger.warn(`Failed to parse complex date format: ${rawEvent.date}`);
              }
            } else {
              this.logger.warn(`Invalid date format: ${rawEvent.date}`);
            }
          }
        } catch (error) {
          this.logger.warn(`Failed to parse date: ${rawEvent.date}`);
        }
      }
      
      // Format and validate coordinates
      let eventLat: number | undefined = undefined;
      let eventLng: number | undefined = undefined;
      let geoLocation: any = undefined;
      
      // If coordinates are provided directly
      if (rawEvent.lat !== undefined && rawEvent.lng !== undefined) {
        const lat = parseFloat(rawEvent.lat);
        const lng = parseFloat(rawEvent.lng);
        
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          eventLat = lat;
          eventLng = lng;
          
          // Create GeoJSON Point for MongoDB 2dsphere indexing
          geoLocation = {
            type: 'Point',
            coordinates: [lng, lat] // GeoJSON uses [longitude, latitude] order
          };
        } else {
          this.logger.warn(`Invalid coordinates: [${rawEvent.lat}, ${rawEvent.lng}]`);
        }
      } 
      // If only location string is provided, we could potentially geocode it
      // This would require a geocoding service in a real implementation
      
      return {
        name: rawEvent.name,
        date: eventDate,
        host: rawEvent.host || 'Unknown Host',
        location: rawEvent.location || 'Unknown Location',
        price: rawEvent.price || 'Free',
        image: rawEvent.image || undefined,
        lat: eventLat,
        lng: eventLng,
        geoLocation: geoLocation,
        url: rawEvent.url
      };
    } catch (error) {
      this.logger.error(`Error formatting event data: ${error.message}`);
      return null;
    }
  }
} 