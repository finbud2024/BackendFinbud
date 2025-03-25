import { Injectable, Logger } from '@nestjs/common';
import { QueryDto } from '../dto';
import { ThreadService } from './thread.service';
import { ChatService } from './chat.service';
import { ExceptionFactory } from '../../../common/exceptions/app.exception';
import { CreateChatDto } from '../dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Source } from '../interfaces/source.interface';
import { BaseService } from '../../../common/base/base.service';
import { Request } from 'express';

@Injectable()
export class AiService extends BaseService<any> {
  private readonly openaiApiKey: string | undefined;
  private readonly braveSearchApiKey: string | undefined;

  constructor(
    private readonly threadService: ThreadService,
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {
    super({} as any, 'AI'); // Pass empty object as repository since this service doesn't use one
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.braveSearchApiKey = this.configService.get<string>('BRAVE_SEARCH_API_KEY');
  }

  /**
   * Process an AI query and optionally associate it with a thread
   * using request object to extract user ID
   */
  async processQueryWithRequest(queryDto: QueryDto, request: Request): Promise<{
    answer: string;
    sources: Source[];
    followUpQuestions: string[];
    chatId: string;
    threadId: string;
  }> {
    const userId = this.getUserIdFromRequest(request);
    return this.processQuery(queryDto, userId);
  }

  /**
   * Process an AI query and optionally associate it with a thread
   */
  async processQuery(queryDto: QueryDto, userId: string): Promise<{
    answer: string;
    sources: Source[];
    followUpQuestions: string[];
    chatId: string;
    threadId: string;
  }> {
    try {
      this.logger.debug(`Processing query for user ${userId}: ${queryDto.prompt}`);
      
      // Get or create thread if needed
      let threadId: string;
      if (queryDto.threadId) {
        threadId = queryDto.threadId;
      } else {
        const newThread = await this.threadService.create({
          userId,
          title: this.generateThreadTitle(queryDto.prompt),
        });
        threadId = newThread.id;
      }

      // Get search results if returnSources is true
      let sources: Source[] = [];
      if (queryDto.returnSources) {
        sources = await this.searchBrave(queryDto.prompt, queryDto.numberOfPagesToScan || 4);
      }

      // Get AI response
      const aiResponse = await this.callOpenAI(queryDto.prompt);
      
      // Generate follow-up questions if requested
      let followUpQuestions: string[] = [];
      if (queryDto.returnFollowUpQuestions) {
        followUpQuestions = await this.generateFollowUpQuestions(aiResponse);
      }
      
      // Create a chat entry with the response
      const createChatDto: CreateChatDto = {
        prompt: queryDto.prompt,
        response: [aiResponse],
        threadId,
        sources,
        followUpQuestions,
      };
      
      const chat = await this.chatService.create(createChatDto);
      
      // Return the response
      return {
        answer: aiResponse,
        sources: queryDto.returnSources ? sources : [],
        followUpQuestions: queryDto.returnFollowUpQuestions ? followUpQuestions : [],
        chatId: chat.id,
        threadId,
      };
    } catch (error) {
      this.logger.error(`Error processing AI query: ${error.message}`, error.stack);
      throw ExceptionFactory.aiServiceErrorSimple(error.message);
    }
  }

  /**
   * Call OpenAI API for generating a response
   */
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      this.logger.debug('Sending request to OpenAI');
      
      if (!this.openaiApiKey) {
        this.logger.warn('OpenAI API key not found');
        return 'API key for OpenAI not configured. Please contact an administrator.';
      }
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Here is my query "${prompt}", respond back with an answer that is as long as possible. If you can't find any relevant results, respond with "No relevant results found."`,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      this.logger.error(`Error calling OpenAI: ${error.message}`);
      return 'An error occurred while generating a response. Please try again later.';
    }
  }

  /**
   * Search using Brave Search API
   */
  private async searchBrave(query: string, count: number = 4): Promise<Source[]> {
    try {
      this.logger.debug(`Searching Brave for: ${query}`);
      
      if (!this.braveSearchApiKey) {
        this.logger.warn('Brave Search API key not found');
        return [];
      }
      
      // Since we don't have direct access to LangChain here, let's use the Brave Search API directly
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        params: {
          q: query,
          count: count,
        },
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': this.braveSearchApiKey,
        },
      });
      
      // Normalize the search results to match our Source schema
      return response.data.web?.results?.map((result: any) => ({
        title: result.title,
        link: result.url,
        snippet: result.description,
        favicon: result.favicon_url,
        host: new URL(result.url).hostname,
      })).filter((source: any) => source.title && source.link) || [];
    } catch (error) {
      this.logger.error(`Error searching Brave: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate follow-up questions based on the AI response
   */
  private async generateFollowUpQuestions(responseText: string): Promise<string[]> {
    try {
      this.logger.debug('Generating follow-up questions');
      
      if (!this.openaiApiKey) {
        this.logger.warn('OpenAI API key not found for follow-up questions');
        return [];
      }
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a question generator. Generate 3 follow-up questions based on the provided text. Return the questions in an array format.',
            },
            {
              role: 'user',
              content: `Generate 3 follow-up questions based on the following text:\n\n${responseText}\n\nReturn the questions in the following format: ["Question 1", "Question 2", "Question 3"]`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Parse the response to get the array of questions
      const content = response.data.choices[0]?.message?.content || '[]';
      try {
        return JSON.parse(content);
      } catch (e) {
        // If parsing fails, extract questions from the text
        const questions = content.match(/"([^"]+)"/g) || [];
        return questions.map(q => q.replace(/"/g, ''));
      }
    } catch (error) {
      this.logger.error(`Error generating follow-up questions: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate a thread title from the first prompt
   */
  private generateThreadTitle(prompt: string): string {
    // Take first 50 characters of prompt and add ellipsis if needed
    return prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt;
  }
} 