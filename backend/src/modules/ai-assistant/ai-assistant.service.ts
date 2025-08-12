import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import OpenAI from "openai"
import { AiQuery } from "../../entities/ai-query.entity"
import { Request } from "../../entities/request.entity"
import { User } from "../../entities/user.entity"
import type { QueryDto } from "./dto/query.dto"

@Injectable()
export class AiAssistantService {
  private openai: OpenAI | null = null;

  constructor(
    @InjectRepository(AiQuery)
    private aiQueryRepository: Repository<AiQuery>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }
  }

  async processQuery(queryDto: QueryDto, user: User) {
    const startTime = Date.now()

    // If OpenAI is not configured, return mock response
    if (!this.openai) {
      return this.getMockResponse(queryDto)
    }

    // Get context data based on user role and query
    const contextData = await this.getContextData(queryDto, user)

    // Build prompt with context
    const prompt = this.buildPrompt(queryDto.query, contextData, user)

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(user),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content || "No response generated"
      const tokensUsed = completion.usage?.total_tokens || 0
      const responseTime = Date.now() - startTime

      // Save query to database
      const aiQuery = this.aiQueryRepository.create({
        user: { id: user.id },
        query: queryDto.query,
        query_type: this.determineQueryType(queryDto.query),
        response: response,
        tokens_used: tokensUsed,
        response_time_ms: responseTime,
        context: queryDto.structured_query ? JSON.parse(queryDto.structured_query) : null,
      })

      await this.aiQueryRepository.save(aiQuery)

      // Parse response for structured data
      const structuredResponse = this.parseResponse(response, contextData)

      return {
        response,
        structured_data: structuredResponse,
        tokens_used: tokensUsed,
        query_id: aiQuery.id,
      }
    } catch (error) {
      console.error("OpenAI API error:", error)
      return this.getMockResponse(queryDto)
    }
  }

  private async getMockResponse(queryDto: QueryDto): Promise<any> {
    // Mock response when OpenAI is not available
    const response = await this.generateMockResponse(queryDto.query)

    // Save mock query to database
    const aiQuery = this.aiQueryRepository.create({
      query: queryDto.query,
      query_type: queryDto.query_type,
      response: response,
      tokens_used: 0,
      response_time_ms: 0,
    })

    await this.aiQueryRepository.save(aiQuery)

    return {
      response,
      type: aiQuery.query_type,
      tokens_used: 0,
      response_time_ms: 0,
      query_id: aiQuery.id,
      mock: true,
    }
  }

  async getTemplates() {
    return {
      templates: [
        {
          name: "Request Search",
          query: "Show me all pending requests from last week",
          description: "Search for requests with specific criteria",
        },
        {
          name: "Statistics",
          query: "What are the current dashboard statistics?",
          description: "Get overview of system metrics",
        },
        {
          name: "Help",
          query: "How do I assign a request to a team member?",
          description: "Get help with system features",
        },
      ],
    }
  }

  private async getContextData(queryDto: QueryDto, user: User) {
    const query = this.requestRepository
      .createQueryBuilder("request")
      .leftJoinAndSelect("request.category", "category")
      .leftJoinAndSelect("request.assigned_to", "assigned_to")
      .leftJoinAndSelect("request.fund_requests", "fund_requests")

    // Apply role-based filtering
    if (user.role === "FIELD_TEAM") {
      query.where("request.assigned_to = :userId", { userId: user.id })
    }

    // Apply structured query filters if provided
    if (queryDto.structured_query) {
      try {
        const filters = JSON.parse(queryDto.structured_query)

        if (filters.status) {
          query.andWhere("request.status = :status", { status: filters.status })
        }

        if (filters.priority) {
          query.andWhere("request.priority = :priority", { priority: filters.priority })
        }

        if (filters.type) {
          query.andWhere("request.type = :type", { type: filters.type })
        }

        if (filters.date_range) {
          const days = this.parseDateRange(filters.date_range)
          const fromDate = new Date()
          fromDate.setDate(fromDate.getDate() - days)
          query.andWhere("request.created_at >= :fromDate", { fromDate })
        }
      } catch (error) {
        console.error("Error parsing structured query:", error)
      }
    }

    query.limit(100) // Limit context data
    const requests = await query.getMany()

    return {
      requests,
      total_requests: requests.length,
      user_role: user.role,
    }
  }

  private buildPrompt(query: string, contextData: any, user: any): string {
    const requestsSummary = contextData.requests.map((req) => ({
      id: req.id,
      type: req.type,
      status: req.status,
      priority: req.priority,
      title: req.title,
      created_at: req.created_at,
      assigned_to: req.assigned_to?.name,
      category: req.category?.name,
    }))

    return `
User Query: ${query}

Context Data:
- User Role: ${user.role}
- Total Requests in Context: ${contextData.total_requests}
- Requests Summary: ${JSON.stringify(requestsSummary, null, 2)}

Please provide a comprehensive analysis based on the query and context data. Include:
1. Summary of findings
2. Key statistics
3. Actionable recommendations
4. Any patterns or trends identified

Format the response in a clear, structured manner suitable for a ${user.role.toLowerCase().replace("_", " ")}.
`
  }

  private getSystemPrompt(user: any): string {
    const roleContext = {
      MINISTER: "You are an AI assistant for a Minister. Provide high-level strategic insights and summaries.",
      PERSONAL_ASSISTANT:
        "You are an AI assistant for a Personal Assistant. Focus on operational efficiency and task management.",
      FIELD_TEAM: "You are an AI assistant for field team members. Provide practical, actionable information.",
      OFFICE_STAFF: "You are an AI assistant for office staff. Focus on administrative tasks and process optimization.",
    }

    return `
You are an AI assistant for a Minister's Grievance & Request Management System.
${roleContext[user.role] || "Provide helpful analysis and insights."}

Guidelines:
- Be concise but comprehensive
- Focus on actionable insights
- Respect data privacy (mask sensitive personal information)
- Provide Telugu translations when relevant
- Use appropriate terminology for government operations
- Highlight urgent items that need attention
`
  }

  private parseResponse(response: string, contextData: any) {
    // Extract structured data from AI response
    const structured = {
      summary: "",
      top_requests: [],
      statistics: {},
      recommendations: [],
      charts_data: {},
    }

    try {
      // Simple parsing logic - in production, you might want more sophisticated parsing
      const lines = response.split("\n")
      let currentSection = ""

      for (const line of lines) {
        if (line.toLowerCase().includes("summary")) {
          currentSection = "summary"
        } else if (line.toLowerCase().includes("recommendation")) {
          currentSection = "recommendations"
        } else if (line.toLowerCase().includes("statistic")) {
          currentSection = "statistics"
        }

        if (currentSection === "summary" && line.trim() && !line.toLowerCase().includes("summary")) {
          structured.summary += line + " "
        }
      }

      // Extract top requests from context
      structured.top_requests = contextData.requests
        .filter((req) => req.priority === "HIGH" || req.priority === "CRITICAL")
        .slice(0, 5)
        .map((req) => ({
          id: req.id,
          title: req.title,
          priority: req.priority,
          status: req.status,
          assigned_to: req.assigned_to?.name,
        }))

      // Generate basic statistics
      const statusCounts = contextData.requests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1
        return acc
      }, {})

      structured.statistics = {
        total: contextData.requests.length,
        by_status: statusCounts,
      }

      structured.charts_data = {
        status_distribution: Object.entries(statusCounts).map(([status, count]) => ({
          label: status,
          value: count,
        })),
      }
    } catch (error) {
      console.error("Error parsing AI response:", error)
    }

    return structured
  }

  private parseDateRange(dateRange: string): number {
    const ranges = {
      "7_days": 7,
      "15_days": 15,
      "30_days": 30,
      "90_days": 90,
    }
    return ranges[dateRange] || 30
  }

  private async generateMockResponse(query: string): Promise<string> {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("status") || lowerQuery.includes("request")) {
      return "Based on the current data, there are several pending requests that require attention. Would you like me to provide specific details about any particular request?"
    }

    if (lowerQuery.includes("fund") || lowerQuery.includes("budget")) {
      return "The current fund allocation shows healthy distribution across categories. Healthcare and infrastructure requests are the primary fund consumers this month."
    }

    if (lowerQuery.includes("report") || lowerQuery.includes("summary")) {
      return "I can generate a comprehensive report including request statistics, resolution rates, and fund utilization. What specific timeframe would you like me to focus on?"
    }

    return "I understand your query. Based on the available data, I recommend reviewing the dashboard for detailed insights. Is there a specific aspect you'd like me to elaborate on?"
  }

  private determineQueryType(query: string): string {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("search") || lowerQuery.includes("find")) {
      return "REQUEST_SEARCH"
    }

    if (lowerQuery.includes("stats") || lowerQuery.includes("analytics")) {
      return "ANALYTICS"
    }

    if (lowerQuery.includes("template") || lowerQuery.includes("format")) {
      return "TEMPLATE"
    }

    return "GENERAL"
  }

  private async handleRequestSearch(query: string): Promise<string> {
    const recentRequests = await this.requestRepository.find({
      take: 5,
      order: { created_at: "DESC" },
      relations: ["category"],
    })

    return `Here are the 5 most recent requests:\n${recentRequests
      .map((r, i) => `${i + 1}. ${r.title} (${r.status}) - ${r.created_at.toDateString()}`)
      .join("\n")}`
  }

  private async handleAnalytics(query: string): Promise<string> {
    const totalRequests = await this.requestRepository.count()
    const pendingRequests = await this.requestRepository.count({ where: { status: "PENDING" } })

    return `Current Statistics:
- Total Requests: ${totalRequests}
- Pending Requests: ${pendingRequests}
- Resolution Rate: ${totalRequests > 0 ? (((totalRequests - pendingRequests) / totalRequests) * 100).toFixed(1) : 0}%`
  }

  private getHelpResponse(): string {
    return `I can help you with:
1. Search for requests: "Show me recent requests"
2. Get statistics: "What are the current stats?"
3. General assistance: "How do I create a new request?"
4. Status updates: "What's the status of request GRV-2024-1234?"

Just ask me anything about the grievance management system!`
  }
}
