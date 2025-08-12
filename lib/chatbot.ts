// Types for the chatbot
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type ChatbotContext = {
  grievanceStats: {
    totalGrievances: number;
    pendingCount: number;
    resolvedCount: number;
    inProgressCount: number;
  };
  districtStats: {
    [district: string]: {
      totalGrievances: number;
      pendingCount: number;
      resolvedCount: number;
      inProgressCount: number;
      averageResolutionTime: number;
    };
  };
  categoryStats: {
    [category: string]: {
      totalGrievances: number;
      resolvedCount: number;
      averageCost: number;
    };
  };
};

// Function to process user queries
export async function processQuery(
  query: string,
  context: ChatbotContext
): Promise<string> {
  query = query.toLowerCase();
  
  // Helper function to format numbers
  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);
  
  // Process total statistics queries
  if (query.includes('total grievances') || query.includes('how many grievances')) {
    return `Total grievances: ${formatNumber(context.grievanceStats.totalGrievances)}\nPending: ${formatNumber(context.grievanceStats.pendingCount)}\nResolved: ${formatNumber(context.grievanceStats.resolvedCount)}\nIn Progress: ${formatNumber(context.grievanceStats.inProgressCount)}`;
  }
  
  // Process district-specific queries
  for (const district in context.districtStats) {
    if (query.includes(district.toLowerCase())) {
      const stats = context.districtStats[district];
      return `${district} District Statistics:\n` +
        `Total Grievances: ${formatNumber(stats.totalGrievances)}\n` +
        `Resolved: ${formatNumber(stats.resolvedCount)}\n` +
        `Pending: ${formatNumber(stats.pendingCount)}\n` +
        `In Progress: ${formatNumber(stats.inProgressCount)}\n` +
        `Average Resolution Time: ${stats.averageResolutionTime} days`;
    }
  }
  
  // Process category-specific queries
  for (const category in context.categoryStats) {
    if (query.includes(category.toLowerCase())) {
      const stats = context.categoryStats[category];
      return `${category} Category Statistics:\n` +
        `Total Grievances: ${formatNumber(stats.totalGrievances)}\n` +
        `Resolved: ${formatNumber(stats.resolvedCount)}\n` +
        `Average Cost: ₹${formatNumber(stats.averageCost)}`;
    }
  }
  
  // Process performance queries
  if (query.includes('performance') || query.includes('resolution rate')) {
    const resolvedPercentage = (context.grievanceStats.resolvedCount / context.grievanceStats.totalGrievances) * 100;
    return `Overall Performance Metrics:\n` +
      `Resolution Rate: ${resolvedPercentage.toFixed(1)}%\n` +
      `Total Resolved: ${formatNumber(context.grievanceStats.resolvedCount)}\n` +
      `Average Processing Time: ${calculateAverageProcessingTime(context)} days`;
  }
  
  return "I apologize, but I couldn't understand your query. You can ask me about:\n" +
         "- Total grievances and their status\n" +
         "- District-specific statistics\n" +
         "- Category-wise grievance data\n" +
         "- Overall performance metrics";
}

// Helper function to calculate average processing time
function calculateAverageProcessingTime(context: ChatbotContext): number {
  let totalTime = 0;
  let totalDistricts = 0;
  
  for (const district in context.districtStats) {
    totalTime += context.districtStats[district].averageResolutionTime;
    totalDistricts++;
  }
  
  return totalDistricts > 0 ? Math.round(totalTime / totalDistricts) : 0;
}
